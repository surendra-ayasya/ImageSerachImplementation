import torch
import torchvision.transforms as transforms
from torchvision.models import resnet18, ResNet18_Weights
from PIL import Image
import numpy as np
import os
from sklearn.neighbors import NearestNeighbors
import joblib
import boto3
from io import BytesIO
from botocore.exceptions import NoCredentialsError, PartialCredentialsError, ClientError

from config import (
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_REGION,
    AWS_BUCKET,
    AWS_URL,
    LOCAL_TILE_FOLDER,
)

S3_FOLDER = "kclweb/"  # 🔹 Only index images from this folder

# -----------------------
# 🔹 S3 Client with fallback
# -----------------------
def init_s3_client():
    try:
        if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
            s3 = boto3.client(
                "s3",
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                region_name=AWS_DEFAULT_REGION,
            )
        else:
            s3 = boto3.client("s3", region_name=AWS_DEFAULT_REGION)

        # test credentials by listing bucket
        s3.list_objects_v2(Bucket=AWS_BUCKET, Prefix=S3_FOLDER, MaxKeys=1)
        print(f"✅ Connected to S3 bucket: {AWS_BUCKET}/{S3_FOLDER}")
        return s3
    except (NoCredentialsError, PartialCredentialsError):
        print("❌ AWS credentials not found. Falling back to local tiles.")
    except ClientError as e:
        print(f"❌ AWS Client error: {e}. Falling back to local tiles.")
    return None


s3_client = init_s3_client()

# -----------------------
# 🔹 ResNet18 Feature Extractor
# -----------------------
def get_resnet_model():
    if not hasattr(get_resnet_model, "model"):
        weights = ResNet18_Weights.DEFAULT
        model = resnet18(weights=weights)
        model = torch.nn.Sequential(*list(model.children())[:-1])
        model.eval()
        get_resnet_model.model = model
    return get_resnet_model.model


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# -----------------------
# 🔹 Feature Extraction
# -----------------------
def extract_features(image_input, crop_to_center=False):
    try:
        if isinstance(image_input, str):
            image = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, Image.Image):
            image = image_input.convert("RGB")
        else:
            raise ValueError("Unsupported image input type")

        if crop_to_center:
            w, h = image.size
            min_dim = min(w, h)
            image = image.crop((
                (w - min_dim) // 2,
                (h - min_dim) // 2,
                (w + min_dim) // 2,
                (h + min_dim) // 2
            ))

        image = image.resize((224, 224))
    except Exception as e:
        print(f"⚠️ Error loading image: {e}")
        return np.zeros(512)

    tensor = transform(image).unsqueeze(0)
    model = get_resnet_model()
    with torch.no_grad():
        features = model(tensor).squeeze()
    return features.numpy()


# -----------------------
# 🔹 Image Hash (for deduplication)
# -----------------------
def compute_hash(image_input):
    try:
        if isinstance(image_input, str):
            image = Image.open(image_input).convert("L").resize((8, 8), Image.Resampling.LANCZOS)
        elif isinstance(image_input, Image.Image):
            image = image_input.convert("L").resize((8, 8), Image.Resampling.LANCZOS)
        else:
            raise ValueError("Unsupported image input type")

        pixels = np.array(image)
        avg = pixels.mean()
        bits = pixels > avg
        return ''.join(['1' if b else '0' for b in bits.flatten()])
    except Exception as e:
        print(f"⚠️ Could not hash image: {e}")
        return None


# -----------------------
# 🔹 List Images (S3 or Local)
# -----------------------
def list_images():
    if s3_client:
        resp = s3_client.list_objects_v2(Bucket=AWS_BUCKET, Prefix=S3_FOLDER)
        return [
            ("s3", item["Key"])
            for item in resp.get("Contents", [])
            if item["Key"].lower().endswith((".png", ".jpg", ".jpeg"))
        ]
    else:
        files = []
        for root, _, filenames in os.walk(LOCAL_TILE_FOLDER):
            for f in filenames:
                if f.lower().endswith((".png", ".jpg", ".jpeg")):
                    files.append(("local", os.path.join(root, f)))
        return files


def load_image(source, key):
    if source == "s3":
        obj = s3_client.get_object(Bucket=AWS_BUCKET, Key=key)
        return Image.open(BytesIO(obj["Body"].read())).convert("RGB")
    else:
        return Image.open(key).convert("RGB")


# -----------------------
# 🔹 Build Index
# -----------------------
def build_image_index():
    all_features = []
    tile_names = []
    seen_hashes = set()

    images = list_images()
    print(f"📦 Found {len(images)} images ({'S3' if s3_client else 'LOCAL'})")

    for source, key in images:
        try:
            image = load_image(source, key)
            image_hash = compute_hash(image)
            if not image_hash or image_hash in seen_hashes:
                continue
            seen_hashes.add(image_hash)

            feats = extract_features(image)
            if np.linalg.norm(feats) != 0:
                all_features.append(feats)
                tile_names.append(key)
        except Exception as e:
            print(f"⚠️ Error processing {key}: {e}")

    if not all_features:
        print("❌ No valid images found to index.")
        return

    all_features = np.vstack(all_features)
    joblib.dump((tile_names, all_features), "tile_index.pkl")
    print("✅ Feature index saved as 'tile_index.pkl'.")


# -----------------------
# 🔹 Similarity Search
# -----------------------
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def find_best_matches(uploaded_image_path, top_k=20, min_threshold=0.5, dedup_threshold=0.01):
    if not os.path.exists("tile_index.pkl"):
        build_image_index()

    tile_names, feature_matrix = joblib.load("tile_index.pkl")

    uploaded_vector = extract_features(uploaded_image_path, crop_to_center=True).reshape(-1)

    similarities = []
    exact_match_found = False

    for idx, tile_vector in enumerate(feature_matrix):
        sim = cosine_similarity(uploaded_vector, tile_vector)

        if not exact_match_found and sim >= 0.99999:
            similarities.insert(0, (tile_names[idx], 1.0))
            exact_match_found = True
        elif sim >= min_threshold:
            similarities.append((tile_names[idx], sim))

    # Deduplicate
    deduped_results = []
    seen_vectors = []

    for name, sim in sorted(similarities, key=lambda x: x[1], reverse=True):
        vec = feature_matrix[tile_names.index(name)]

        is_duplicate = any(
            cosine_similarity(vec, seen_vec) > (1 - dedup_threshold)
            for seen_vec in seen_vectors
        )
        if not is_duplicate:
            deduped_results.append((name, sim))
            seen_vectors.append(vec)

        if len(deduped_results) >= top_k:
            break

    return deduped_results

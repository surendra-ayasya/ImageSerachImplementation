import os
import joblib
import numpy as np
from io import BytesIO
from PIL import Image
import torch
import torchvision.transforms as transforms
from torchvision.models import resnet18, ResNet18_Weights
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError, ClientError
import pandas as pd
from config import (
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_REGION,
    AWS_BUCKET,
    AWS_URL,
    S3_FOLDER,
    PRODUCTS_EXCEL_KEY,
    PRODUCTS_EXCEL_SHEET,
)

# -----------------------
# 🔹 S3 Client
# -----------------------
def init_s3_client():
    try:
        session = boto3.session.Session(
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_DEFAULT_REGION,
        )
        s3 = session.client("s3")
        # test connection (small call)
        s3.list_objects_v2(Bucket=AWS_BUCKET, Prefix=S3_FOLDER, MaxKeys=1)
        print(f"✅ Connected to S3 bucket: {AWS_BUCKET}/{S3_FOLDER}")
        return s3
    except (NoCredentialsError, PartialCredentialsError):
        raise RuntimeError("❌ AWS credentials not configured properly")
    except ClientError as e:
        raise RuntimeError(f"❌ AWS Client error: {e}")

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
# 🔹 Image Hash (dedupe)
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
# 🔹 List Images from S3
# -----------------------
def list_images():
    resp = s3_client.list_objects_v2(Bucket=AWS_BUCKET, Prefix=S3_FOLDER)
    return [
        ("s3", item["Key"])
        for item in resp.get("Contents", [])
        if item["Key"].lower().endswith((".png", ".jpg", ".jpeg"))
    ]

def load_image_from_s3(key):
    obj = s3_client.get_object(Bucket=AWS_BUCKET, Key=key)
    return Image.open(BytesIO(obj["Body"].read())).convert("RGB")

# -----------------------
# 🔹 Product mapping (Excel)
# -----------------------
_product_map = None
_product_map_last_modified = None

def load_product_mapping(force=False):
    """
    Loads the Excel products file from S3 and builds a mapping:
      basename (e.g. GP00091_b.jpg) -> { title, slug, sizes, category }
    Caches the mapping and reloads if the S3 object's LastModified changes.
    """
    global _product_map, _product_map_last_modified
    try:
        head = s3_client.head_object(Bucket=AWS_BUCKET, Key=PRODUCTS_EXCEL_KEY)
        last_mod = head.get("LastModified")

        if not force and _product_map is not None and last_mod == _product_map_last_modified:
            return _product_map

        obj = s3_client.get_object(Bucket=AWS_BUCKET, Key=PRODUCTS_EXCEL_KEY)
        data = obj["Body"].read()

        # Try sheet named PRODUCTS_EXCEL_SHEET first, else fallback to first sheet
        try:
            df = pd.read_excel(BytesIO(data), sheet_name=PRODUCTS_EXCEL_SHEET, engine="openpyxl")
        except Exception:
            df = pd.read_excel(BytesIO(data), sheet_name=0, engine="openpyxl")

        # Normalize columns (case-insensitive)
        cols = {c.lower(): c for c in df.columns}

        images_col = cols.get('images', None)
        title_col = cols.get('product title', None) or cols.get('producttitle', None) or cols.get('title', None)
        slug_col = cols.get('slug name', None) or cols.get('slugname', None) or cols.get('slug', None)
        sizes_col = cols.get('sizes', None) or cols.get('size', None) or cols.get('size(s)', None)
        category_col = cols.get('category', None) or cols.get('categories', None)

        mapping = {}

        if images_col is None:
            print("⚠️ Products excel: 'Images' column not found. Product mapping will be empty.")
            _product_map = mapping
            _product_map_last_modified = last_mod
            return mapping

        for _, row in df.iterrows():
            try:
                images_field = row.get(images_col, "")
                title = row.get(title_col, "") if title_col else ""
                slug = row.get(slug_col, "") if slug_col else ""
                sizes = row.get(sizes_col, "") if sizes_col else ""
                category = row.get(category_col, "") if category_col else ""

                # normalize NaN -> ""
                title = "" if pd.isna(title) else str(title).strip()
                slug = "" if pd.isna(slug) else str(slug).strip()
                sizes = "" if pd.isna(sizes) else str(sizes).strip()
                category = "" if pd.isna(category) else str(category).strip()

                if pd.isna(images_field):
                    continue

                # images_field may be comma-separated
                if isinstance(images_field, str):
                    parts = [p.strip() for p in images_field.split(",") if p.strip()]
                elif isinstance(images_field, (list, tuple)):
                    parts = images_field
                else:
                    parts = [str(images_field).strip()]

                for p in parts:
                    basename = os.path.basename(p)
                    mapping[basename.lower()] = {
                        "title": title,
                        "slug": slug,
                        "sizes": sizes,
                        "category": category
                    }
            except Exception as e:
                print(f"⚠️ Error parsing row in products excel: {e}")

        _product_map = mapping
        _product_map_last_modified = last_mod
        print(f"✅ Loaded product mapping for {len(mapping)} image filenames from Excel.")
        return mapping
    except Exception as e:
        print(f"⚠️ Could not load products excel from S3: {e}")
        _product_map = {}
        _product_map_last_modified = None
        return _product_map

def get_product_info_for_filename(filename):
    """
    filename: basename (e.g. 'GP00091_b.jpg') or full key.
    Returns tuple (title, slug, sizes, category). Returns empty strings if not found.
    """
    mapping = load_product_mapping()
    key = os.path.basename(filename).lower()
    info = mapping.get(key)
    if info:
        return (
            info.get("title", "") or "",
            info.get("slug", "") or "",
            info.get("sizes", "") or "",
            info.get("category", "") or ""
        )
    return "", "", "", ""

# -----------------------
# 🔹 Build Index
# -----------------------
def build_image_index():
    all_features = []
    tile_names = []
    seen_hashes = set()

    images = list_images()
    print(f"📦 Found {len(images)} images (S3)")

    for _, key in images:
        try:
            image = load_image_from_s3(key)
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

def find_best_matches(uploaded_image_path, top_k=20, min_threshold=0.7, dedup_threshold=0.01):
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

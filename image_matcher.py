import torch
import torchvision.transforms as transforms
from torchvision.models import resnet18, ResNet18_Weights
from PIL import Image
import numpy as np
import os
from sklearn.neighbors import NearestNeighbors
import joblib
from config import TILE_FOLDER

def get_resnet_model():
    # Lazy-load the model only once
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

def extract_features(image_path, crop_to_center=False):
    try:
        image = Image.open(image_path).convert('RGB')
        if crop_to_center:
            w, h = image.size
            min_dim = min(w, h)
            image = image.crop(((w - min_dim)//2, (h - min_dim)//2, (w + min_dim)//2, (h + min_dim)//2))
        image = image.resize((224, 224))
    except Exception as e:
        print(f"⚠️ Error loading {image_path}: {e}")
        return np.zeros(512)

    tensor = transform(image).unsqueeze(0)
    model = get_resnet_model()
    with torch.no_grad():
        features = model(tensor).squeeze()
    return features.numpy()


def compute_hash(image_path):
    try:
        image = Image.open(image_path).convert('L').resize((8, 8), Image.Resampling.LANCZOS)
        pixels = np.array(image)
        avg = pixels.mean()
        bits = pixels > avg
        return ''.join(['1' if b else '0' for b in bits.flatten()])
    except Exception as e:
        print(f"⚠️ Could not hash image {image_path}: {e}")
        return None

def build_image_index():
    all_features = []
    tile_names = []
    seen_hashes = set()

    for fname in os.listdir(TILE_FOLDER):
        path = os.path.join(TILE_FOLDER, fname)
        image_hash = compute_hash(path)
        if not image_hash or image_hash in seen_hashes:
            continue
        seen_hashes.add(image_hash)

        feats = extract_features(path)
        if np.linalg.norm(feats) != 0:
            all_features.append(feats)
            tile_names.append(fname)

    if not all_features:
        print("❌ No valid images found to index.")
        return

    all_features = np.vstack(all_features)
    joblib.dump((tile_names, all_features), 'tile_index.pkl')
    print("✅ Feature index saved as 'tile_index.pkl'.")

def find_best_matches(uploaded_image_path, top_k=5, min_threshold=0.6, dedup_threshold=0.01):
    if not os.path.exists("tile_index.pkl"):
        build_image_index()

    tile_names, feature_matrix = joblib.load("tile_index.pkl")
    uploaded_features = extract_features(uploaded_image_path, crop_to_center=True).reshape(1, -1)

    model_nn = NearestNeighbors(n_neighbors=min(top_k + 10, len(tile_names)), metric="cosine")
    model_nn.fit(feature_matrix)
    distances, indices = model_nn.kneighbors(uploaded_features)

    results = []
    seen_vectors = []

    for dist, idx in zip(distances[0], indices[0]):
        similarity = 1 - dist
        if similarity < min_threshold:
            continue

        candidate_vector = feature_matrix[idx]

        # Check if this vector is too similar to any already added
        is_duplicate = any(
            np.dot(candidate_vector, seen_vec) /
            (np.linalg.norm(candidate_vector) * np.linalg.norm(seen_vec)) > (1 - dedup_threshold)
            for seen_vec in seen_vectors
        )
        if is_duplicate:
            continue

        results.append((tile_names[idx], similarity))
        seen_vectors.append(candidate_vector)

        if len(results) >= top_k:
            break

    return sorted(results, key=lambda x: x[1], reverse=True)
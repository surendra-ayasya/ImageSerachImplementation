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

        # Check for exact match using near-perfect cosine similarity
        if not exact_match_found and sim >= 0.99999:
            similarities.insert(0, (tile_names[idx], 1.0))  # Force exact match to the top
            exact_match_found = True
        elif sim >= min_threshold:
            similarities.append((tile_names[idx], sim))

    # Remove duplicates based on vector closeness
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



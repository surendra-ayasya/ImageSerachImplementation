import os
import torch
import open_clip
from sklearn.neighbors import NearestNeighbors
import numpy as np
import joblib
from PIL import Image


def get_clip_model():
    if not hasattr(get_clip_model, "model"):
        model, _, preprocess = open_clip.create_model_and_transforms(
            'ViT-B-32', pretrained='laion2b_s34b_b79k'
        )
        tokenizer = open_clip.get_tokenizer('ViT-B-32')
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = model.to(device)
        model.eval()
        get_clip_model.model = model
        get_clip_model.preprocess = preprocess
        get_clip_model.tokenizer = tokenizer
        get_clip_model.device = device
    return get_clip_model.model, get_clip_model.preprocess, get_clip_model.tokenizer, get_clip_model.device


def encode_text(text):
    model, _, tokenizer, device = get_clip_model()
    tokens = tokenizer([text]).to(device)
    with torch.no_grad():
        text_features = model.encode_text(tokens)
    return text_features.cpu().numpy()


def encode_image(image_path):
    model, preprocess, _, device = get_clip_model()
    image = Image.open(image_path).convert("RGB")
    image_input = preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        image_features = model.encode_image(image_input)
    return image_features.cpu().numpy()


def build_clip_index(tile_folder="static/tiles", output_file="tile_clip_index.pkl"):
    tile_names = []
    feature_list = []

    for fname in os.listdir(tile_folder):
        if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
            path = os.path.join(tile_folder, fname)
            try:
                features = encode_image(path)
                tile_names.append(fname)
                feature_list.append(features[0])
            except Exception as e:
                print(f"⚠️ Failed to process {fname}: {e}")

    feature_matrix = np.vstack(feature_list)
    joblib.dump((tile_names, feature_matrix), output_file)
    print(f"✅ Saved CLIP feature index to {output_file} with {len(tile_names)} tiles.")


def search_tiles_by_text(query, top_k=20, min_threshold=0.1, dedup_threshold=0.01):
    if not os.path.exists("tile_clip_index.pkl"):
        print("❌ You must run reindex_clip.py first.")
        return []

    tile_names, feature_matrix = joblib.load("tile_clip_index.pkl")
    text_vector = encode_text(query)

    nn_model = NearestNeighbors(n_neighbors=min(top_k + 10, len(tile_names)), metric="cosine")
    nn_model.fit(feature_matrix)

    distances, indices = nn_model.kneighbors(text_vector)
    results = []

    for dist, idx in zip(distances[0], indices[0]):
        sim = 1 - dist
        tile_name = tile_names[idx]

        if sim < min_threshold:
            continue

        is_duplicate = any(abs(sim - existing[1]) < dedup_threshold for existing in results)
        if is_duplicate:
            continue

        results.append((tile_name, sim))

        if len(results) >= top_k:
            break

    return sorted(results, key=lambda x: x[1], reverse=True)


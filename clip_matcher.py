import torch
import open_clip
from PIL import Image
import numpy as np
from sklearn.neighbors import NearestNeighbors
import joblib
import os
from config import TILE_FOLDER

device = "cuda" if torch.cuda.is_available() else "cpu"
model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
tokenizer = open_clip.get_tokenizer('ViT-B-32')
model = model.to(device)

def encode_text(text):
    tokenized = tokenizer([text]).to(device)
    with torch.no_grad():
        return model.encode_text(tokenized).cpu().numpy()

def search_tiles_by_text(description, top_k=10, min_threshold=0.5):
    if not os.path.exists("tile_clip_index.pkl"):
        raise FileNotFoundError("❌ Missing tile_clip_index.pkl. Please run reindex_clip.py locally to generate it.")

    tile_names, clip_features = joblib.load("tile_clip_index.pkl")
    text_feat = encode_text(description)

    nn_model = NearestNeighbors(n_neighbors=min(top_k, len(tile_names)), metric="cosine")
    nn_model.fit(clip_features)
    distances, indices = nn_model.kneighbors(text_feat)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        sim = 1 - dist
        if sim >= min_threshold:
            results.append((tile_names[idx], sim))

    return sorted(results, key=lambda x: x[1], reverse=True)

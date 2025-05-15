import torch
import os
from PIL import Image
import numpy as np
import joblib
from config import TILE_FOLDER
import open_clip

# Load OpenCLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
model = model.to(device)
model.eval()

def compute_hash(image_path):
    """Generate perceptual hash for deduplication."""
    try:
        image = Image.open(image_path).convert('L').resize((8, 8), Image.Resampling.LANCZOS)
        pixels = np.array(image)
        avg = pixels.mean()
        bits = pixels > avg
        return ''.join(['1' if b else '0' for b in bits.flatten()])
    except Exception as e:
        print(f"⚠️ Error hashing image {image_path}: {e}")
        return None

def encode_image(image_path):
    try:
        image = preprocess(Image.open(image_path).convert("RGB")).unsqueeze(0).to(device)
        with torch.no_grad():
            image_features = model.encode_image(image)
        return image_features.cpu().numpy()[0]
    except Exception as e:
        print(f"⚠️ Error encoding image {image_path}: {e}")
        return None

def build_clip_index():
    seen_hashes = set()
    features = []
    file_names = []

    for fname in os.listdir(TILE_FOLDER):
        if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue

        path = os.path.join(TILE_FOLDER, fname)
        image_hash = compute_hash(path)
        if not image_hash or image_hash in seen_hashes:
            continue

        seen_hashes.add(image_hash)
        feat = encode_image(path)
        if feat is not None:
            features.append(feat)
            file_names.append(fname)

    if not features:
        print("❌ No valid features to save.")
        return

    joblib.dump((file_names, np.vstack(features)), "tile_clip_index.pkl")
    print(f"✅ CLIP feature index saved. {len(file_names)} images indexed (duplicates removed).")

if __name__ == "__main__":
    build_clip_index()

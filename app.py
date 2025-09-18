import os
import traceback
import threading
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import numpy as np

from config import UPLOAD_FOLDER, MAX_CONTENT_LENGTH, AWS_URL, BASE_URL, PRODUCTS_EXCEL_KEY
from utils import allowed_file
from image_matcher import (
    find_best_matches,
    build_image_index,
    list_images,
    load_product_mapping,
    get_product_info_for_filename
)

app = Flask(__name__)
CORS(app)  # Allow CORS for all routes

# Configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load product mapping at startup (cached)
try:
    load_product_mapping(force=True)
except Exception as e:
    print(f"⚠️ Could not pre-load product mapping: {e}")

# -----------------------
# 🔹 Helper: Convert numpy to Python types
# -----------------------
def convert_numpy(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.generic):
        return obj.item()
    elif isinstance(obj, float):
        return float(obj)
    elif isinstance(obj, list):
        return [convert_numpy(i) for i in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_numpy(i) for i in obj)
    elif isinstance(obj, dict):
        return {k: convert_numpy(v) for k, v in obj.items()}
    else:
        return obj

# -----------------------
# 🔹 Background Index & Excel Watcher
# -----------------------
def watch_s3_inventory(interval=300):
    """Check S3 inventory and product excel periodically and rebuild index/mapping if changed."""
    last_seen = set()

    while True:
        try:
            current = set([key for _, key in list_images()])
            if current != last_seen:
                print("🔄 S3 inventory changed → rebuilding index...")
                build_image_index()
                last_seen = current
        except Exception as e:
            print(f"⚠️ Error watching inventory: {e}")

        # Try reload product mapping (image->product) every interval
        try:
            # load_product_mapping handles caching and only reloads if modified
            load_product_mapping()
        except Exception as e:
            print(f"⚠️ Error reloading product mapping: {e}")

        time.sleep(interval)  # check every `interval` seconds

# Start watcher thread
watcher_thread = threading.Thread(target=watch_s3_inventory, daemon=True)
watcher_thread.start()

# -----------------------
# 🔹 API: Upload image
# -----------------------
@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files or request.files['image'].filename == '':
            return jsonify({"error": "No image provided"}), 400

        file = request.files['image']
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        # Clear existing uploaded files
        for f in os.listdir(UPLOAD_FOLDER):
            try:
                os.remove(os.path.join(UPLOAD_FOLDER, f))
            except Exception:
                pass

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        if not os.path.exists(filepath):
            return jsonify({"error": "Failed to save uploaded image"}), 500

        matches = find_best_matches(filepath)
        safe_matches = convert_numpy(matches)

        transformed_matches = []
        for match in safe_matches:
            # match: (s3_key, score)
            key = match[0]
            score = float(match[1]) if len(match) >= 2 else 0.0
            basename = os.path.basename(key)

            # product info from excel mapping (now returns title, slug, sizes, category)
            product_title, product_slug, sizes, category = get_product_info_for_filename(basename)

            product_url = None
            if product_slug:
                product_url = f"{BASE_URL.rstrip('/')}/products/{product_slug.lstrip('/')}"

            transformed_matches.append({
                "url": f"{AWS_URL}/{key}",
                "score": score,
                "filename": os.path.basename(key),
                "productName": product_title if product_title else None,
                "productUrl": product_url,
                "sizes": sizes if sizes else "",
                "category": category if category else ""
            })

        return jsonify({"results": transformed_matches})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# -----------------------
# 🔹 API: Search by text
# -----------------------
from clip_matcher import search_tiles_by_text

@app.route('/search', methods=['POST'])
def search_by_text():
    try:
        data = request.get_json()
        description = data.get('description', '').strip()
        if not description:
            return jsonify({"error": "Description is required"}), 400

        matches = search_tiles_by_text(description)
        safe_matches = convert_numpy(matches)

        transformed_matches = []
        for match in safe_matches:
            key = match[0]
            score = float(match[1]) if len(match) >= 2 else 0.0
            basename = os.path.basename(key)
            product_title, product_slug, sizes, category = get_product_info_for_filename(basename)
            product_url = f"{BASE_URL.rstrip('/')}/products/{product_slug.lstrip('/')}" if product_slug else None

            transformed_matches.append({
                "url": f"{AWS_URL}/{key}",
                "score": score,
                "filename": os.path.basename(key),
                "productName": product_title if product_title else None,
                "productUrl": product_url,
                "sizes": sizes if sizes else "",
                "category": category if category else ""
            })

        return jsonify({"results": transformed_matches})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

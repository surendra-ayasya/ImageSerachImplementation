from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import os
import numpy as np
from werkzeug.utils import secure_filename
import traceback

from config import UPLOAD_FOLDER, MAX_CONTENT_LENGTH
from utils import allowed_file
from image_matcher import find_best_matches
from clip_matcher import search_tiles_by_text

app = Flask(__name__)
CORS(app)  # Allow CORS for all routes

# Configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Helper function to convert NumPy types to native Python types
def convert_numpy(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.generic):
        return obj.item()
    elif isinstance(obj, np.floating):  # Handle float32, float64, etc.
        return float(obj)
    elif isinstance(obj, list):
        return [convert_numpy(i) for i in obj]
    elif isinstance(obj, tuple):  # Handle tuples
        return tuple(convert_numpy(i) for i in obj)
    elif isinstance(obj, dict):
        return {k: convert_numpy(v) for k, v in obj.items()}
    else:
        return obj

# Optional Web UI for manual testing
@app.route('/', methods=['GET', 'POST'])
def index():
    matches = []
    filename = None

    if request.method == 'POST':
        if 'image' in request.files and request.files['image'].filename != '':
            file = request.files['image']
            if allowed_file(file.filename):
                # Clear old files
                for f in os.listdir(UPLOAD_FOLDER):
                    os.remove(os.path.join(UPLOAD_FOLDER, f))

                filename = secure_filename(file.filename)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)

                matches = find_best_matches(filepath)

        elif 'description' in request.form:
            description = request.form['description'].strip()
            if description:
                matches = search_tiles_by_text(description)

    return render_template('index.html', matches=matches, filename=filename)

# ✅ API Route: Upload image
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
            os.remove(os.path.join(UPLOAD_FOLDER, f))

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        print(f"Saving uploaded file to: {filepath}")
        file.save(filepath)

        # Verify file exists
        if not os.path.exists(filepath):
            return jsonify({"error": "Failed to save uploaded image"}), 500

        print(f"Calling find_best_matches with filepath: {filepath}")
        matches = find_best_matches(filepath)
        print(f"Raw matches from find_best_matches: {matches}")
        safe_matches = convert_numpy(matches)
        print(f"Converted matches: {safe_matches}")

        # Transform matches to include image URLs (handle tuples)
        transformed_matches = [
            {
                'url': f'/tiles/{match[0]}',
                'score': float(match[1]),
                'filename': match[0]
            }
            for match in safe_matches
            if len(match) >= 2  # Ensure match has at least two elements
        ]

        return jsonify({"results": transformed_matches})
    except Exception as e:
        print("Upload Error:", str(e))
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# ✅ API Route: Search by text
@app.route('/search', methods=['POST'])
def search_by_text():
    try:
        data = request.get_json()
        print("Received data from frontend:", data)

        description = data.get('description', '').strip()
        if not description:
            return jsonify({"error": "Description is required"}), 400

        matches = search_tiles_by_text(description)
        print("Raw matches:", matches)
        safe_matches = convert_numpy(matches)
        print("Converted matches:", safe_matches)
        # Transform matches to include image URLs
        transformed_matches = [
            {
                'url': f'/tiles/{match[0]}',
                'score': float(match[1]),
                'filename': match[0]
            }
            for match in safe_matches
        ]

        return jsonify({"results": transformed_matches})
    except Exception as e:
        print("Search Error:", str(e))
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500

# ✅ Route to serve images from static/tiles/
@app.route('/tiles/<filename>')
def serve_image(filename):
    try:
        return send_from_directory('static/tiles', filename)
    except Exception as e:
        print(f"Error serving image {filename}: {str(e)}")
        return jsonify({"error": "Image not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
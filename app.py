from flask import Flask, request, render_template
import os
from werkzeug.utils import secure_filename
from config import UPLOAD_FOLDER, MAX_CONTENT_LENGTH
from utils import allowed_file
from image_matcher import find_best_matches
from clip_matcher import search_tiles_by_text

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/', methods=['GET', 'POST'])
def index():
    matches = []
    filename = None

    if request.method == 'POST':
        if 'image' in request.files and request.files['image'].filename != '':
            file = request.files['image']
            if allowed_file(file.filename):
                for f in os.listdir(UPLOAD_FOLDER):
                    os.remove(os.path.join(UPLOAD_FOLDER, f))

                filename = secure_filename(file.filename)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)

                matches = find_best_matches(filepath)
                # Text-based search
        elif 'description' in request.form:
            description = request.form['description'].strip()
            if description:
                matches = search_tiles_by_text(description)

    return render_template('index.html', matches=matches, filename=filename)

if __name__ == '__main__':
    app.run(debug=True)

import os
import torch

# ==========================
# 🔒 AWS Configuration (env-based for production)
# ==========================
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")  # must be set in env
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")  # must be set in env
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION")
AWS_BUCKET = os.getenv("AWS_BUCKET")

# Pre-signed URL / static S3 path
AWS_URL = f"https://{AWS_BUCKET}.s3.{AWS_DEFAULT_REGION}.amazonaws.com"

# ==========================
# 📂 Index & Storage
# ==========================
INDEX_FILE = os.getenv("INDEX_FILE", "tile_index.pkl")  # local file (rebuild via reindex.py)

# Device (CPU/GPU)
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Uploads (user query images)
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 5 * 1024 * 1024))  # 5 MB
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

# Matching threshold
MATCH_THRESHOLD = float(os.getenv("MATCH_THRESHOLD", 0.9))  # 90% similarity

# ==========================
# 📊 S3 Product Data
# ==========================
S3_FOLDER = os.getenv("S3_FOLDER", "kclweb/")  # use trailing slash
PRODUCTS_EXCEL_KEY = os.getenv(
    "PRODUCTS_EXCEL_KEY",
    "kclweb/all_products_16sept25-kajaria.xlsx"
)
PRODUCTS_EXCEL_SHEET = os.getenv("PRODUCTS_EXCEL_SHEET", "Worksheet")

# ==========================
# 🌐 Website Links
# ==========================
BASE_URL = os.getenv("BASE_URL", "https://demowebsite.kajariaceramics.com/")

# Flask secret key (for sessions / security)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")  # replace in prod



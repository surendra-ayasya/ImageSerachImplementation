import os
from config import ALLOWED_EXTENSIONS

def allowed_file(filename: str) -> bool:
    if not filename:
        return False
    ext = os.path.splitext(filename)[1].lower().lstrip('.')
    return ext in ALLOWED_EXTENSIONS

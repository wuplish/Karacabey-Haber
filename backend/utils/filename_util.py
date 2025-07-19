import os
import time
from werkzeug.utils import secure_filename

def save_uploaded_file(file, upload_folder="uploads"):
    filename = secure_filename(file.filename.replace(" ", "_"))
    timestamp = time.strftime("%Y%m%d%H%M%S")
    new_filename = f"{timestamp}_{filename}"
    file_path = os.path.join(upload_folder, new_filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    return new_filename

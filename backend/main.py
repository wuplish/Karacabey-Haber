from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import sqlite3
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from utils.filename_util import save_uploaded_file

app = FastAPI()
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
def get_user_id(request: Request):
    return request.headers.get("gelmisgecmiseniyiuserid") or get_remote_address(request)

limiter = Limiter(key_func=get_user_id)

app.state.limiter = limiter
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request, exc):
    return JSONResponse(status_code=429, content={"detail": "Çok fazla istek, lütfen sonra tekrar deneyin."})

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "*.karacabeyhaber.com", "*"])  # domainine göre ayarla
DB_FILE = "database.db"
def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            image TEXT,
            category TEXT,
            tags TEXT,
            status TEXT,
            publish_date TEXT,
            created_at TEXT,
            view_count INTEGER DEFAULT 0,
            breaking_news INTEGER DEFAULT 0
        )
        """)
        conn.commit()

def query_db(query, args=(), one=False):
    with sqlite3.connect(DB_FILE) as conn:
        cur = conn.cursor()
        cur.execute(query, args)
        rows = cur.fetchall()
        conn.commit()
        return (rows[0] if rows else None) if one else rows

# --- Models ---
class LoginData(BaseModel):
    username: str
    password: str

class PostData(LoginData):
    title: str
    content: str
    image: str
    category: str
    tags: List[str]
    status: str
    publish_date: Optional[str] = None
    breaking_news: Optional[int] = 0

class UpdatePostData(PostData):
    pass

# --- Auth ---
def is_admin(data: LoginData):
    return data.username == "admin" and data.password == "admin1234"
from fastapi import Request
@app.post("/login")
@limiter.limit("1/5seconds")
def login(request: Request,data: LoginData):
    if is_admin(data):
        return {"success": True}
    raise HTTPException(status_code=401, detail="Unauthorized")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mp3"}
def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS


# --- File Upload System ---
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="Desteklenmeyen dosya türü.")
    filename = save_uploaded_file(file)
    return {"url": f"http://localhost:5000/uploads/{filename}"}

@app.get("/uploads/{filename}")
def get_file(filename: str):
    path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)

# --- Posts ---
@app.get("/posts")
@limiter.limit("5/5seconds")
def get_posts(request: Request):
    rows = query_db("SELECT * FROM posts ORDER BY publish_date DESC")
    return [{
        "id": row[0],
        "title": row[1],
        "content": row[2],
        "image": row[3],
        "category": row[4],
        "tags": row[5].split(',') if row[5] else [],
        "status": row[6],
        "publish_date": row[7],
        "created_at": row[8],
        "view_count": row[9],
        "breaking_news": row[10]
    } for row in rows]

@app.get("/posts/{post_id}")
@limiter.limit("5/5seconds")
def get_post(request: Request,post_id: int):
    query_db("UPDATE posts SET view_count = view_count + 1 WHERE id = ?", (post_id,))
    row = query_db("SELECT * FROM posts WHERE id = ?", (post_id,), one=True)
    if not row:
        raise HTTPException(status_code=404, detail="Post not found")
    return {
        "id": row[0],
        "title": row[1],
        "content": row[2],
        "image": row[3],
        "category": row[4],
        "tags": row[5].split(',') if row[5] else [],
        "status": row[6],
        "publish_date": row[7],
        "created_at": row[8],
        "view_count": row[9],
        "breaking_news": row[10]
    }

@app.post("/posts")
@limiter.limit("5/5seconds")
def create_post(request: Request, data: PostData):
    if not is_admin(data):
        raise HTTPException(status_code=401, detail="Unauthorized")

    query_db("""
    INSERT INTO posts (title, content, image, category, tags, status, publish_date, created_at, breaking_news)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.title,
        data.content,
        data.image,
        data.category,
        ",".join(data.tags),
        data.status,
        data.publish_date or datetime.now().isoformat(),
        datetime.now().isoformat(),
        data.breaking_news
    ))

    return {"message": "Post created"}

@app.put("/posts/{post_id}")
@limiter.limit("5/5seconds")
def update_post(request: Request, post_id: int, data: UpdatePostData):
    if not is_admin(data):
        raise HTTPException(status_code=401, detail="Unauthorized")

    row = query_db("SELECT * FROM posts WHERE id = ?", (post_id,), one=True)
    if not row:
        raise HTTPException(status_code=404, detail="Post not found")

    query_db("""
    UPDATE posts SET title=?, content=?, image=?, category=?, tags=?, status=?, publish_date=?, breaking_news=?
    WHERE id=?
    """, (
        data.title,
        data.content,
        data.image,
        data.category,
        ",".join(data.tags),
        data.status,
        data.publish_date or datetime.now().isoformat(),
        data.breaking_news,
        post_id
    ))

    return {"message": "Post updated"}

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, data: LoginData):
    if not is_admin(data):
        raise HTTPException(status_code=401, detail="Unauthorized")

    row = query_db("SELECT * FROM posts WHERE id = ?", (post_id,), one=True)
    if not row:
        raise HTTPException(status_code=404, detail="Post not found")

    query_db("DELETE FROM posts WHERE id = ?", (post_id,))
    return {"message": "Post deleted"}

# --- Breaking News ---
@app.get("/breaking")
def get_breaking():
    row = query_db("""
    SELECT * FROM posts WHERE breaking_news = 1 AND status = 'published'
    ORDER BY publish_date DESC LIMIT 1
    """, one=True)

    if not row:
        return {}

    return {
        "id": row[0],
        "title": row[1],
        "content": row[2],
        "image": row[3],
        "category": row[4],
        "tags": row[5].split(','),
        "status": row[6],
        "publish_date": row[7],
        "created_at": row[8],
        "view_count": row[9],
        "breaking_news": row[10]
    }

# --- Start DB ---
init_db()

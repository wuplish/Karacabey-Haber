import json
import threading
from fastapi import Body, FastAPI, HTTPException, UploadFile, File, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import time
import os
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import sqlite3
import requests
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from utils.filename_util import save_uploaded_file
from utils.slug import create_slug
import jsonify
today = datetime.now().strftime("%d-%m-%Y")
app = FastAPI()
CATEGORY_JSON = "categories.json"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
def get_user_id(request: Request):
    return request.headers.get("gelmisgecmiseniyiuserid") or get_remote_address(request)
def load_categories():
    if not os.path.exists(CATEGORY_JSON):
        return []
    with open(CATEGORY_JSON, "r", encoding="utf-8") as f:
        return json.load(f)

def save_categories(data):
    with open(CATEGORY_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

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
            breaking_news INTEGER DEFAULT 0,
            slug TEXT UNIQUE 
        )
        """)
        conn.execute("""
        CREATE TABLE IF NOT EXISTS subheadings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            title TEXT,
            content TEXT,
            FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
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
class CategoryModel(BaseModel):
    name: str
    path: Optional[str] = None
    description: Optional[str] = ""
    order: Optional[int] = 0
    header: Optional[bool] = False
class PlanModel(BaseModel):
    name: str
    price: str
    description: str
    features: str
class IletisimModel(BaseModel):
    adres: str
    telefon: str
    email: str
class MobilModel(BaseModel):
    playstore: str
    appstore: str
    huaweistore: str
class FooterLinks(BaseModel):
    kunye: str
    kurumsal: str
    gizlilik: str
    kvkk: str

class FooterSettings(BaseModel):
    links: FooterLinks
    iletisim: IletisimModel   # Burası mutlaka olmalı
    plans: List[PlanModel]

class LoginData(BaseModel):
    username: str
    password: str

class Subheading(BaseModel):
    title: str
    content: str

class PostData(BaseModel):
    title: str
    content: str
    image: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    status: Optional[str] = "draft"
    publish_date: Optional[str] = None
    breaking_news: Optional[bool] = False
    subheadings: Optional[List[Subheading]] = []
    username: Optional[str] = None
    password: Optional[str] = None
    slug: Optional[str] = None  


class UpdatePostData(PostData):
    pass

# --- Auth ---
def is_admin(data: LoginData):
    return data.username == "karacabeyhaber@admin.panel" and data.password == "karacabeyhaber@admin.user.haber@latest"
from fastapi import Request
@app.post("/login")
@limiter.limit("1/5seconds")
def login(request: Request,data: LoginData):
    if is_admin(data):
        return {"success": True}
    raise HTTPException(status_code=401, detail="Unauthorized")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS
SETTINGS_FILE = "data/footer_settings.json"
# Ayarları JSON'dan oku
def load_footer_settings():
    if not os.path.exists(SETTINGS_FILE):
        return {"links": {}, "plans": []}
    with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
# Ayarları JSON'a yaz
def save_footer_settings(data):
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
# GET endpoint
@app.get("/settings/footer")
async def get_footer_settings():
    return load_footer_settings()
# POST endpoint
@app.post("/settings/footer")
async def update_footer_settings(settings: FooterSettings):
    try:
        save_footer_settings(settings.dict())
        return {"message": "Footer ayarları başarıyla kaydedildi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ayarlar kaydedilemedi: {str(e)}")
    


URL = "data/url.json"
def load_app_settings():
    if not os.path.exists(URL):
        return {"nothing": {}}
    with open(URL, "r", encoding="utf-8") as f:
        return json.load(f)
def save_app_settings(data):
    with open(URL, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
@app.get("/settings/apps")
async def get_apps_settings():
    return load_app_settings()
# POST endpoint
@app.post("/settings/apps")
async def update_apps_settings(settings: MobilModel):
    try:
        save_app_settings(settings.dict())
        return {"message": "apps ayarları başarıyla kaydedildi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ayarlar kaydedilemedi: {str(e)}")
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
def get_posts(request: Request):
    posts = query_db("SELECT * FROM posts ORDER BY publish_date DESC")
    result = []
    for post in posts:
        subheadings = query_db("SELECT title, content FROM subheadings WHERE post_id = ?", (post[0],))
        result.append({
            "id": post[0],
            "title": post[1],
            "content": post[2],
            "image": post[3],
            "category": post[4],
            "tags": post[5].split(',') if post[5] else [],
            "status": post[6],
            "publish_date": post[7],
            "created_at": post[8],
            "view_count": post[9],
            "breaking_news": post[10],
            "slug": post[11],
            "subheadings": [{"title": s[0], "content": s[1]} for s in subheadings]
        })
    return result

@app.get("/posts/{slug}")
@limiter.limit("5/5seconds")
def get_post_by_slug(request: Request, slug: str):
    post = query_db("SELECT * FROM posts WHERE slug = ?", (slug,), one=True)
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    query_db("UPDATE posts SET view_count = view_count + 1 WHERE slug = ?", (slug,))

    subheadings = query_db("SELECT title, content FROM subheadings WHERE post_id = ?", (post[0],))

    return {
        "id": post[0],
        "title": post[1],
        "content": post[2],
        "image": post[3],
        "category": post[4],
        "tags": post[5].split(',') if post[5] else [],
        "status": post[6],
        "publish_date": post[7],
        "created_at": post[8],
        "view_count": post[9],
        "breaking_news": post[10],
        "slug": post[11],
        "subheadings": [{"title": s[0], "content": s[1]} for s in subheadings]
    }


@app.post("/posts")
@limiter.limit("5/5seconds")
def create_post(request: Request, data: PostData):
    if not is_admin(data):
        raise HTTPException(status_code=401, detail="Unauthorized")
    slug = data.slug
    print("Gelen slug:", slug)
    slug = create_slug(data.title)
    counter = 1
    original_slug = slug
    while query_db("SELECT id FROM posts WHERE slug = ?", (slug,), one=True):
        slug = f"{original_slug}-{counter}"
        counter += 1

    cursor = query_db("""
    INSERT INTO posts (title, content, image, category, tags, status, publish_date, created_at, breaking_news, slug)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
    """, (
        data.title,
        data.content,
        data.image,
        data.category,
        ",".join(data.tags),
        data.status,
        data.publish_date or datetime.now().isoformat(),
        datetime.now().isoformat(),
        data.breaking_news,
        slug  
    ), one=True)

    post_id = cursor[0]

    if data.subheadings:
        for subheading in data.subheadings:
            query_db("""
            INSERT INTO subheadings (post_id, title, content)
            VALUES (?, ?, ?)
            """, (post_id, subheading.title, subheading.content))

    return {"message": "Post created", "id": post_id}

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

    query_db("DELETE FROM subheadings WHERE post_id = ?", (post_id,))

    if data.subheadings:
        for subheading in data.subheadings:
            query_db("""
            INSERT INTO subheadings (post_id, title, content)
            VALUES (?, ?, ?)
            """, (post_id, subheading.title, subheading.content))

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
    today = datetime.now().strftime("%Y-%m-%d")

    rows = query_db("""
        SELECT * FROM posts 
        WHERE status = 'published'
        AND substr(publish_date, 1, 10) = ?
        ORDER BY publish_date DESC 
        LIMIT 20
    """, (today,))
    
    return [
        {
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
            "breaking_news": row[10],
            "slug": row[11]
        } for row in rows
    ]

# --- Slider ---
@app.get("/slides")
def get_slider_posts(category: str = None):
    if category:
        query = """
            SELECT id, title, image, publish_date 
            FROM posts 
            WHERE status = 'published' AND category = ? 
            ORDER BY publish_date DESC 
            LIMIT 15
        """ # category check added
        rows = query_db(query, (category,))
    else:
        query = """
            SELECT id, title, image, publish_date 
            FROM posts 
            WHERE status = 'published' 
            ORDER BY publish_date DESC 
            LIMIT 15
        """
        rows = query_db(query)

    return [
        {
            "id": row[0],
            "title": row[1],
            "image": row[2],
            "publish_date": row[3]
        }
        for row in rows
    ]


# --- Slug ---
@app.get("/posts/by-slug/{slug}")
def get_post_by_slug(slug: str):
    post = query_db("SELECT * FROM posts WHERE slug = ?", (slug,), one=True)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    subheadings = query_db("SELECT title, content FROM subheadings WHERE post_id = ?", (post[0],))
    
    return {
        "id": post[0],
        "title": post[1],
        "content": post[2],
        "image": post[3],
        "category": post[4],
        "tags": post[5].split(',') if post[5] else [],
        "status": post[6],
        "publish_date": post[7],
        "created_at": post[8],
        "view_count": post[9],
        "breaking_news": post[10],
        "slug": post[11],  
        "subheadings": [{"title": s[0], "content": s[1]} for s in subheadings]
    }


# - admin panel -
LOGO_SETTINGS_PATH = "data/logo_settings.json"

def read_logo_settings():
    try:
        with open(LOGO_SETTINGS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {
            "logo_line1": "KARACABEY",
            "logo_line2": "HABER",
            "logo_line1_color": "#e63946",
            "logo_line2_color": "#222222"
        }

def write_logo_settings(data: dict):
    with open(LOGO_SETTINGS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

@app.get("/settings/logo-text")
def get_logo_text():
    return read_logo_settings()

@app.post("/settings/logo-text")
async def update_logo_text(request: Request):
    data = await request.json()
    current = read_logo_settings()
    updated = {
        "logo_line1": data.get("logo_line1", current["logo_line1"]),
        "logo_line2": data.get("logo_line2", current["logo_line2"]),
        "logo_line1_color": data.get("logo_line1_color", current["logo_line1_color"]),
        "logo_line2_color": data.get("logo_line2_color", current["logo_line2_color"]),
    }
    write_logo_settings(updated)
    return updated
# social media
SOCIALMEDIA_PATH = "data/socialmedia.json"
def read_socialmedia():
    try:
        with open(SOCIALMEDIA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # Eğer dosya yoksa varsayılan boş yapı döner
        return {
            "facebook": "",
            "instagram": "",
            "twitter": ""
        }

def write_socialmedia(data: dict):
    with open(SOCIALMEDIA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.get("/socialmedia")
def get_socialmedia():
    return read_socialmedia()

@app.post("/settings/socialmedia")
async def update_socialmedia(request: Request, data: LoginData = Body(...)):
    if not is_admin(data):
        raise HTTPException(status_code=401, detail="Unauthorized")

    body = await request.json()
    current = read_socialmedia()

    updated = {
        "facebook": body.get("facebook", current.get("facebook", "")),
        "instagram": body.get("instagram", current.get("instagram", "")),
        "twitter": body.get("twitter", current.get("twitter", ""))
    }

    write_socialmedia(updated)
    return updated


# --- Today ---
@app.get("/today")
def get_today_news():
    rows = query_db(f"""
        SELECT * FROM posts 
        WHERE DATE(publish_date) = '{today}'
        AND status = 'published'
        ORDER BY publish_date DESC
    """)
    return jsonify(rows)
# --- Category System ---
@app.get("/category")
def get_categories():
    return load_categories()

@app.post("/category")
def create_category(data: CategoryModel = Body(...)):
    categories = load_categories()
    path = data.path or "/" + create_slug(data.name)

    if any(cat['path'] == path for cat in categories):
        raise HTTPException(status_code=400, detail="Bu path zaten kullanılıyor.")

    if data.header:
        header_count = sum(1 for cat in categories if cat.get("header"))
        if header_count >= 4:
            raise HTTPException(status_code=400, detail="En fazla 4 tane header kategorisi olabilir.")

    new_cat = {
        "name": data.name,
        "path": path,
        "description": data.description or "",
        "order": data.order or 0,
        "header": data.header or False
    }

    categories.append(new_cat)
    save_categories(categories)
    return {"message": "Kategori oluşturuldu", "category": new_cat}


@app.delete("/category/{name}")
def delete_category_by_name(name: str):
    categories = load_categories()

    filtered_categories = [cat for cat in categories if cat['name'] != name]

    if len(filtered_categories) == len(categories):
        raise HTTPException(status_code=404, detail="Kategori bulunamadı.")

    save_categories(filtered_categories)
    return {"message": f"{name} kategorisi silindi."}

# Hava Durumu Helpers
def get_location_from_ip(ip):
    try:
        res = requests.get(f"http://ip-api.com/json/{ip}")
        if res.status_code == 200:
            data = res.json()
            if data['status'] == 'success':
                return data['lat'], data['lon'], data['city']
    except:
        pass
    return None, None, None

def get_weather(lat, lon):
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&current_weather=true&timezone=auto"
        )
        res = requests.get(url)
        if res.status_code == 200:
            data = res.json()
            return data.get("current_weather")
    except:
        pass
    return None

# --- Hava Durumu Api ---
@app.get("/api/havadurumu/{ipadress}")
def get_havadurumu_with_ipadress(ipadress: str):
    lat, lon, city = get_location_from_ip(ipadress)
    if lat is None or lon is None:
        return JSONResponse(status_code=404, content={"detail": "Konum alınamadı"})

    weather = get_weather(lat, lon)
    if not weather:
        return JSONResponse(status_code=404, content={"detail": "Hava durumu alınamadı"})

    return {
        "sehir": city,
        "sicaklik": weather["temperature"],  
        "ruzgar": weather["windspeed"],  
        "zaman": weather["time"]           
    }

# --- Get Gram Altın Api ---
API_KEY = "FM6HagN5eL"
headers = {"key": API_KEY}

def fetch_latest_data():
    today = datetime.now()
    for i in range(7):
        date_str = (today - timedelta(days=i)).strftime("%d-%m-%Y")
        url = (
            f"https://evds2.tcmb.gov.tr/service/evds/"
            f"series=TP.DK.USD.A-TP.DK.EUR.A-TP.DK.GBP.A"
            f"&startDate={date_str}&endDate={date_str}&type=json&limit=1&sort=desc"
        )
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            if items and (
                items[0].get("TP_DK_USD_A") or
                items[0].get("TP_DK_EUR_A") or
                items[0].get("TP_DK_GBP_A")
            ):
                return {
                    "tarih": items[0].get("Tarih"),
                    "usd": items[0].get("TP_DK_USD_A"),
                    "euro": items[0].get("TP_DK_EUR_A"),
                    "gbp": items[0].get("TP_DK_GBP_A")
                }
    return {
        "tarih": None,
        "usd": None,
        "euro": None,
        "gbp": None
    }

@app.get("/api/doviz")
def doviz():
    return fetch_latest_data()

init_db()

import re
import unicodedata

def create_slug(title: str) -> str:
    slug = unicodedata.normalize('NFKD', title)
    slug = slug.encode('ascii', 'ignore').decode('ascii')
    
    slug = re.sub(r'[^\w\s-]', '', slug.lower())
    slug = re.sub(r'[\s-]+', '-', slug).strip('-_')
    
    return slug
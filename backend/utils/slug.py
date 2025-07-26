import re
import unicodedata

def create_slug(title: str) -> str:
    # Türkçe karakterleri dönüştür
    title = title.lower()
    title = unicodedata.normalize('NFKD', title).encode('ascii', 'ignore').decode('ascii')
    
    # Harf ve sayılar dışındaki karakterleri tire ile değiştir
    title = re.sub(r'[^a-z0-9]+', '-', title)
    # Başta ve sonda tire varsa temizle
    title = title.strip('-')
    return title

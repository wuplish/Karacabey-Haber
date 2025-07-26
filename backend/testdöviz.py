import requests
from datetime import datetime, timedelta

API_KEY = "FM6HagN5eL"
headers = {"key": API_KEY}

def fetch_latest_data():
    today = datetime.now()
    for i in range(7):  # 7 gün geriye dene
        date_str = (today - timedelta(days=i)).strftime("%d-%m-%Y")
        url = (
            f"https://evds2.tcmb.gov.tr/service/evds/"
            f"series=TP.DK.USD.A-TP.DK.EUR.A-TP.DK.GBP.A-TP.DK.XAU.S.A-XU100-TP.TMBFAP"
            f"&startDate={date_str}&endDate={date_str}&type=json&limit=1&sort=desc"
        )
        response = requests.get(url, headers=headers)
        print(f"Tarih: {date_str} - Status Code: {response.status_code}")
        print("Response:", response.text[:200])  # İlk 200 karakteri yazdır
        
        if response.status_code == 200:
            data = response.json()
            if data.get("totalCount", 0) > 0:
                print("Veri bulundu!")
                return data["items"][0]
            else:
                print("Veri yok, başka tarih denenecek...")
        else:
            print("Hatalı cevap, başka tarih denenecek...")

    print("Sonuç: Veri bulunamadı.")
    return None

result = fetch_latest_data()
print(result)

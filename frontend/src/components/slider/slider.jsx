import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Artık harici slider.css dosyasına gerek yok, tüm stiller inline olarak burada.

const Slider = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true); // Yükleme durumu
  const [error, setError] = useState(null); // Hata durumu
  const navigate = useNavigate(); // React Router hook'u

  // API'nizin temel URL'si. Kendi sunucu adresinize göre ayarlayın.
  const API_BASE_URL = 'https://api.karacabeygazetesi.com/main.php?url=';
  // Haber detay sayfaları için ana site URL'si
  // LÜTFEN BURAYI KENDİ ANA WEB SİTENİZİN KÖK DİZİNİ URL'Sİ İLE GÜNCELLEYİN!
  // Örnek: 'https://www.siteniz.com/' veya 'https://karacabeygazetesi.com/'
  const FRONTEND_BASE_URL = 'https://karacabeygazetesi.com/'; 

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true); // Yüklemeyi başlat
        setError(null); // Önceki hataları temizle

        // Backend'den slaytları çek
        const res = await fetch(`${API_BASE_URL}slides`);

        if (!res.ok) {
          throw new Error(`HTTP hatası! durum: ${res.status}`);
        }

        const data = await res.json();

        // Gelen verinin bir dizi olduğundan emin ol
        if (Array.isArray(data)) {
          setSlides(data);
        } else if (data && Array.isArray(data.slidesData)) { // API'niz { slidesData: [...] } gibi bir obje döndürüyorsa
          setSlides(data.slidesData);
        }
        else {
          // Geçersiz veri gelirse hata logla ve slaytları boş dizi yap
          console.error("API'den gelen slayt yanıtı bir dizi değil:", data);
          setSlides([]); 
          setError("Sunucudan geçerli slayt verisi alınamadı.");
        }
      } catch (e) {
        console.error("Slaytlar getirilirken hata oluştu:", e);
        setError("Slaytlar yüklenirken bir sorun oluştu.");
        setSlides([]); // Hata durumunda slaytları boşalt
      } finally {
        setLoading(false); // Yüklemeyi bitir
      }
    };

    fetchSlides();
  }, [API_BASE_URL]); // API_BASE_URL değiştiğinde yeniden çalışır

  // Slaytları otomatik ilerletme efekti
  useEffect(() => {
    // Sadece slayt varsa interval kur
    if (slides.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // Her 5 saniyede bir ilerle

    return () => clearInterval(interval); // Bileşen kaldırıldığında interval'i temizle
  }, [slides]); // Slayt verisi değiştiğinde efekti yeniden çalıştır

  // Sonraki slayta geç
  const goToNext = () => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  // Önceki slayta geç
  const goToPrev = () => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Slayta tıklandığında yönlendirme
  const handleSlideClick = (slide) => {
    console.log("Tıklanan slayt verisi:", slide); // Tüm slayt objesini logla
    console.log("Slayt target_url:", slide.target_url);
    console.log("Slayt slug:", slide.slug);
    console.log("Slayt id:", slide.id);

    const targetUrl = slide.target_url ? slide.target_url.trim() : '';
    const slideSlug = slide.slug || slide.id; // Fallback to id if slug is not present

    if (targetUrl) {
        // Case 1: target_url is an internal post path (e.g., "/post/some-slug")
        if (targetUrl.startsWith('/post/')) {
            const postUrl = new URL(targetUrl, FRONTEND_BASE_URL).href;
            console.log("Dahili haber URL'sine yönlendiriliyor (aynı sekme):", postUrl);
            window.location.href = postUrl; // Aynı sekmede aç
        }
        // Case 2: target_url is a full external URL (e.g., "https://google.com")
        else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
            console.log("Harici URL'ye yönlendiriliyor (yeni sekme):", targetUrl);
            window.open(targetUrl, '_blank'); // Yeni sekmede aç
        }
        // Case 3: target_url is an external URL without protocol (e.g., "google.com")
        else {
            const urlToNavigate = `https://${targetUrl}`; // Varsayılan olarak https ekle
            console.log("Harici URL'ye yönlendiriliyor (protokol eklendi, yeni sekme):", urlToNavigate);
            window.open(urlToNavigate, '_blank'); // Yeni sekmede aç
        }
    } else if (slideSlug) {
        // Case 4: No target_url, but it's a post with slug/id (default behavior for posts)
        const postPath = `post/${slideSlug}`;
        const postUrl = new URL(postPath, FRONTEND_BASE_URL).href;
        console.log("Haber detayına yönlendiriliyor (slug/id ile, aynı sekme):", postUrl);
        window.location.href = postUrl; // Aynı sekmede aç
    } else {
        console.warn("Slayt için hedef URL veya slug/ID bulunamadı. Yönlendirme yapılamadı.", slide);
    }
  };

  // --- Render Logic ---
  if (loading) {
    return <div>Slaytlar yükleniyor...</div>;
  }

  if (error) {
    return <div className="slider-status slider-error">{error}</div>;
  }

  // Yükleme sonrası slayt yoksa
  if (slides.length === 0) {
    return <div className="slider-status">Görüntülenecek slayt yok.</div>;
  }

  // current indeksini slayt dizisi sınırları içinde tut
  const displayIndex = current % slides.length;
  const currentSlide = slides[displayIndex];

  // currentSlide'ın tanımsız olma ihtimaline karşı kontrol
  if (!currentSlide) {
      console.warn("currentSlide, slaytlar dizisi boş olmamasına rağmen tanımsız. Bu alışılmadık bir durum.");
      return null;
  }

  return (
    <div className="slider-container">
      {/* Tüm CSS stilleri buraya taşındı */}
      <style>
        {`
          /* --- Base Slider Styles --- */
          .slider-container {
            width: 100%;
            max-width: 900px; /* Maksimum genişlik belirle */
            height: 400px; /* Sabit yükseklik belirle */
            margin: 20px auto; /* Ortala ve üstten/alttan boşluk bırak */
            position: relative;
            overflow: hidden;
            border-radius: 8px; /* Hafif yuvarlak köşeler */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Hafif gölge */
            /* aspect-ratio kaldırıldı, sabit yükseklik kullanılıyor */
          }

          .slider {
            width: 100%;
            height: 100%;
            position: relative;
          }

          /* Status messages */
          .slider-status {
            text-align: center;
            padding: 50px 20px;
            font-size: 1.2em;
            color: #555;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            box-sizing: border-box;
          }

          .slider-status.slider-error {
            color: #d9534f;
            font-weight: bold;
          }

          /* Slides */
          .slide {
            position: absolute;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            opacity: 0;
            transition: opacity 1s ease-in-out;
            display: flex;
            align-items: flex-end;
            justify-content: flex-start;
            padding: 20px;
            box-sizing: border-box;
            color: white;
            cursor: pointer;
            border-radius: 8px; /* Köşeleri kapsayıcı ile eşleştir */
          }

          .slide.active {
            opacity: 1;
            z-index: 1;
          }

          /* Slide Content */
          .slide-content {
            background-color: rgba(0, 0, 0, 0.4);
            padding: 10px 15px; /* Padding'i azalttım */
            border-radius: 10px;
            max-width: calc(100% - 80px);
            box-sizing: border-box;
            margin-bottom: 10px; /* Alt boşluğu azalttım */
          }

          .slide-title {
            margin: 0 0 5px 0; /* Başlık alt boşluğunu ayarladım */
            font-size: 1.8em;
            font-weight: bold;
            color: rgba(255, 255, 255, 0.95);
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
            white-space: nowrap; /* Kaydırma animasyonu kaldırıldığı için nowrap */
            overflow: hidden; /* Taşmayı gizle */
            text-overflow: ellipsis; /* Metin taşarsa üç nokta göster */
            display: block; /* Marquee kaldırıldığı için block olarak ayarla */
            max-width: 100%; /* Kapsayıcı genişliğine uyum sağla */
            /* animation: marquee 15s linear infinite; -- Kaldırıldı */
            line-height: 1.2; /* Satır aralığını ayarladım */
          }

          .slide-date {
            margin: 0; /* Tüm margin'leri sıfırladım */
            font-size: 0.9em;
            opacity: 0.85;
            color: #f0f0f0;
            line-height: 1.3; /* Tarih satır aralığını ayarladım */
          }

          /* Navigation Arrows */
          .arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 50px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.2rem;
            color: white;
            background-color: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(8px);
            border: none;
            cursor: pointer;
            border-radius: 8px;
            z-index: 2;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            user-select: none;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            opacity: 0.8;
            padding: 0;
          }

          .arrow:hover {
            background-color: rgba(0, 0, 0, 0.7);
            color: #fff;
            transform: translateY(-50%) scale(1.05);
            opacity: 1;
          }

          .arrow:active {
            transform: translateY(-50%) scale(0.95);
          }

          .arrow.left {
            left: 10px;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          }

          .arrow.right {
            right: 10px;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }

          /* Dots Navigation */
          .dots {
            position: absolute;
            bottom: 15px;
            width: 100%;
            text-align: center;
            z-index: 10;
          }

          .dot {
            display: inline-block;
            width: 14px;
            height: 14px;
            margin: 0 7px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.3s ease;
            box-shadow: 0 0 5px rgba(0,0,0,0.3);
          }

          .dot.active,
          .dot:hover {
            background: #f57b6e;
            transform: scale(1.2);
          }

          /* --- Responsive Adjustments --- */

          /* Tablets and small desktops */
          @media (max-width: 1024px) {
            .slider-container {
              height: 350px;
            }
            .slide {
              padding: 15px;
            }
            .slide-content {
              padding: 12px 20px;
              max-width: calc(100% - 60px);
            }
            .slide-title {
              font-size: 1.6em;
            }
            .slide-date {
              font-size: 0.85em;
            }
            .arrow {
              width: 50px;
              height: 50px;
              font-size: 2.5em;
            }
            .dot {
              width: 12px;
              height: 12px;
              margin: 0 6px;
            }
          }

          /* Mobile devices */
          @media (max-width: 768px) {
            .slider-container {
              height: 280px;
              border-radius: 0;
            }
            .slide {
              padding: 10px;
            }
            .slide-content {
              padding: 8px 12px;
              max-width: calc(100% - 40px);
            }
            .slide-title {
              font-size: 1.2em;
            }
            .slide-date {
              font-size: 0.75em;
            }
            .arrow {
              width: 45px;
              height: 45px;
              font-size: 2em;
            }
            .dots {
              bottom: 8px;
            }
            .dot {
              width: 9px;
              height: 9px;
              margin: 0 4px;
            }
          }

          /* Small mobile devices */
          @media (max-width: 480px) {
            .slider-container {
              height: 200px;
            }
            .slide {
              padding: 8px;
            }
            .slide-content {
              padding: 5px 8px;
              max-width: calc(100% - 20px);
            }
            .slide-title {
              font-size: 1em;
            }
            .slide-date {
              font-size: 0.65em;
            }
            .arrow {
              width: 40px;
              height: 40px;
              font-size: 1.8em;
            }
            .dots {
              bottom: 5px;
            }
            .dot {
              width: 7px;
              height: 7px;
              margin: 0 3px;
            }
          }

          /* Landscape mode */
          @media (max-height: 480px) and (orientation: landscape) {
            .slider-container {
              height: 180px;
            }
            .slide {
              padding: 5px;
            }
            .slide-content {
              padding: 5px 10px;
              max-width: calc(100% - 20px);
            }
            .slide-title {
              font-size: 0.9em;
            }
            .slide-date {
              font-size: 0.6em;
            }
            .arrow {
              width: 35px;
              height: 35px;
              font-size: 1.5em;
            }
            .dots {
              bottom: 3px;
            }
            .dot {
              width: 6px;
              height: 6px;
              margin: 0 2px;
            }
          }
        `}
      </style>
      
      <div className="slider">
        {/* Slaytları haritala */}
        {slides.map((slide, index) => (
          <div
            key={slide.id || index} // Benzersiz ID kullan, yoksa index'e geri dön
            className={`slide ${index === displayIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
            onClick={() => handleSlideClick(slide)}
          >
          </div>
        ))}
        <div className="dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === displayIndex ? "active" : ""}`}
              onClick={() => setCurrent(index)}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./slider.css";

const Slider = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true); // Start loading
        setError(null); // Clear previous errors

        // Make sure this URL is correct based on your backend routing setup
        // If you applied the '?url=' fix to main.php, this is correct.
        const res = await fetch("https://api.karacabeygazetesi.com/main.php?url=slides");

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // --- Crucial Check: Ensure the data is an array ---
        if (Array.isArray(data)) {
          setSlides(data);
        } else if (data && Array.isArray(data.slidesData)) { // Example if API returns { slidesData: [...] }
          setSlides(data.slidesData);
        }
        else {
          // If the API returns something else, log an error and treat it as no slides
          console.error("API response for slides is not an array:", data);
          setSlides([]); // Ensure slides is an empty array if invalid data
          setError("Sunucudan geçerli slayt verisi alınamadı.");
        }
      } catch (e) {
        console.error("Slaytlar getirilirken hata oluştu:", e);
        setError("Slaytlar yüklenirken bir sorun oluştu.");
        setSlides([]); // Ensure slides is empty on error
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchSlides();
  }, []); // Empty dependency array means this runs once on mount

  // Effect for auto-advancing slides
  useEffect(() => {
    // Only set up the interval if there are slides to show
    if (slides.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval); // Clean up the interval
  }, [slides]); // Re-run effect if slides data changes

  const goToNext = () => {
    // Only navigate if there are slides
    if (slides.length === 0) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    // Only navigate if there are slides
    if (slides.length === 0) return;
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSlideClick = (slide) => {
    // Assuming 'slide' has a 'slug' property for cleaner URLs
    // If your backend returns 'id', use `/post/${slide.id}`
    navigate(`/post/${slide.slug || slide.id}`); // Fallback to id if slug is missing
  };

  // --- Render Logic ---
  if (loading) {
    return <div className="slider-loading">Slaytlar yükleniyor...</div>;
  }

  if (error) {
    return <div className="slider-error">{error}</div>;
  }

  // If no slides after loading, return null or a message
  if (slides.length === 0) {
    return null; // Or <div className="slider-no-data">Görüntülenecek slayt yok.</div>;
  }

  // Ensure current is within bounds, especially if slides array changes dynamically
  const displayIndex = current % slides.length;
  const currentSlide = slides[displayIndex];

  // Defensive check for currentSlide in case of very odd race conditions
  if (!currentSlide) {
      console.warn("currentSlide is undefined despite slides.length > 0. This is unusual.");
      return null;
  }


  return (
    <div className="slider">
      {/* Map over slides only if they exist and are an array */}
      {slides.map((slide, index) => (
        <div
          key={slide.id || index} // Use unique ID, fallback to index if ID is not guaranteed
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
  );
};

export default Slider;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./slider.css"; // Assuming you want to keep the same CSS

const CategorySlider = ({ category = null }) => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);   // Add error state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategorySlides = async () => {
      try {
        setLoading(true); // Start loading
        setError(null);   // Clear previous errors

        // Construct the URL based on whether a category is provided
        // Use 'main.php' if that's your consistent entry point for the API
        const url = category
          ? `https://api.karacabeygazetesi.com/main.php?url=slides&category=${encodeURIComponent(category)}`
          : "https://api.karacabeygazetesi.com/main.php?url=slides";

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // --- Crucial Check: Ensure the data is an array ---
        if (Array.isArray(data)) {
          setSlides(data);
        } else if (data && typeof data === 'object' && (Array.isArray(data.slides) || Array.isArray(data.data) || Array.isArray(data.posts))) {
          // If the API wraps the array in an object (e.g., { slides: [...] } or { data: [...] } or { posts: [...] })
          // You need to inspect your actual API response structure to pick the correct property.
          // For the PHP code you provided for handleSlides, it directly outputs an array,
          // so the 'Array.isArray(data)' check should be sufficient, but this is a safeguard.
          setSlides(data.slides || data.data || data.posts);
        }
        else {
          console.error("API response for category slides is not an array:", data);
          setSlides([]); // Ensure slides is an empty array if invalid data
          setError("Sunucudan geçerli slayt verisi alınamadı.");
        }
      } catch (e) {
        console.error("Kategori slaytları getirilirken hata oluştu:", e);
        setError("Kategori slaytları yüklenirken bir sorun oluştu.");
        setSlides([]); // Ensure slides is empty on error
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchCategorySlides();
  }, [category]); // Re-run effect when 'category' prop changes

  // Effect for auto-advancing slides
  useEffect(() => {
    // Only set up the interval if there are slides to show
    // and if slides has changed to a non-empty array
    if (slides.length === 0) {
      // If slides become empty, ensure current index is reset to prevent out-of-bounds
      setCurrent(0);
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
    // Assuming 'slide' has an 'id' property. If your posts also have a 'slug',
    // using 'slug' for clean URLs is often preferred: `/post/${slide.slug}`
    navigate(`/post/${slide.id}`);
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
    return null; // Or <div className="slider-no-data">Bu kategori için slayt yok.</div>;
  }

  // Ensure current is within bounds, especially if slides array changes dynamically
  const displayIndex = current % slides.length;
  const currentSlide = slides[displayIndex];

  // Defensive check for currentSlide in case of very odd race conditions
  if (!currentSlide) {
      console.warn("currentSlide is undefined despite slides.length > 0. This is unusual.");
      return null; // Or a placeholder
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
          <div className="slide-content">
            <h2>{slide.title}</h2>
            <p>{new Date(slide.publish_date).toLocaleDateString()}</p>
          </div>
        </div>
      ))}

      <button className="arrow left" onClick={goToPrev}>
        &#10094;
      </button>
      <button className="arrow right" onClick={goToNext}>
        &#10095;
      </button>

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

export default CategorySlider;
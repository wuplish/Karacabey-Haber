import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./slider.css";

const CategorySlider = ({ category = null }) => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const url = category
      ? `https://api.karacabeygazetesi.com/index.php?url=slides?category=${encodeURIComponent(category)}`
      : "https://api.karacabeygazetesi.com/index.php?url=slides";

    fetch(url)
      .then((res) => res.json())
      .then((data) => setSlides(data));
  }, [category]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSlideClick = (slide) => {
    navigate(`/post/${slide.id}`); 
  };

  if (slides.length === 0) return null;

  return (
    <div className="slider">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`slide ${index === current ? "active" : ""}`}
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
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default CategorySlider;

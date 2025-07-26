import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import Slider from "./slider/slider";
import BreakingNewsBanner from './breakingnews/BreakingNewsBanner';
import { FaEdit, FaTrash } from "react-icons/fa";
import { WiDaySunny, WiCloudy, WiRain, WiSnow } from 'react-icons/wi';
const Home = () => {
  const [breaking, setBreaking] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState(null);
  const [currencyLoading, setCurrencyLoading] = useState(true);
  const [currencyError, setCurrencyError] = useState(null);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/doviz");
        const data = await res.json();
        if (data.detail) {
          setCurrencyError("Döviz verisi alınamadı");
          setCurrency(null);
        } else {
          setCurrency(data);
          setCurrencyError(null);
        }
      } catch (err) {
        console.error("Döviz verisi alınamadı:", err);
        setCurrencyError("Sunucuya ulaşılamadı");
        setCurrency(null);
      } finally {
        setCurrencyLoading(false);
      }
    };
    fetchCurrency();
  }, []);
  function getWeatherIcon(temp) {
    if (temp >= 30) return <WiDaySunny size={40} color="#f39c12" />;
    if (temp >= 20) return <WiDaySunny size={40} color="#f1c40f" />;
    if (temp >= 10) return <WiCloudy size={40} color="#7f8c8d" />;
    if (temp >= 0) return <WiRain size={40} color="#3498db" />;
    return <WiSnow size={40} color="#5dade2" />;
  }
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const ipRes = await fetch("https://api64.ipify.org?format=json");
        const ipData = await ipRes.json();
        const weatherRes = await fetch(`http://localhost:5000/api/havadurumu/${ipData.ip}`);
        const weatherData = await weatherRes.json();
        if(weatherData.detail) {
          setWeatherError("Hava durumu alınamadı");
          setWeather(null);
        } else {
          setWeather(weatherData);
          setWeatherError(null);
        }
      } catch (err) {
        console.error("Hava durumu alınamadı:", err);
        setWeatherError("Sunucuya ulaşılamadı");
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/breaking")
      .then(res => res.json())
      .then(data => {
        setBreaking(data);
      });

    fetch("http://localhost:5000/posts")
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-container">
      {loading ? (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      ) : (
        <>
            <div className="mobile-slider-wrapper">
              <Slider />
            </div>
            {weather && (
              <div className="weather-widget">
                <div className="weather-left">
                  <h3>{weather.sehir}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {getWeatherIcon(weather.sicaklik)}
                    <p><strong>{weather.sicaklik}°C</strong></p>
                  </div>
                  <p>Rüzgar: {weather.ruzgar} km/h</p>
                </div>

                <div className="currency-right">
                  <h3>Döviz Kurları</h3>
                  {currencyLoading && <p>Yükleniyor...</p>}
                  {currencyError && <p style={{color: 'red'}}>{currencyError}</p>}
                  {currency && (
                    <ul style={{listStyle: "none", padding: 0, margin: 0}}>
                      <li><strong>USD:</strong> {currency.usd ?? "Yok"}</li>
                      <li><strong>EUR:</strong> {currency.euro ?? "Yok"}</li>
                      <li><strong>GBP:</strong> {currency.gbp ?? "Yok"}</li> 
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="main-content expanded">
              <div className="top-posts-row">
                {posts.slice(0, 4).map(post => (
                  <Link to={`/post/${post.slug}`} className="post-card" key={post.slug}>
                    <div className="card-image-container">
                      <img src={post.image} alt={post.title} className="post-image" />
                      <span className="category-tag">{post.category}</span>
                    </div>
                    <div className="card-content">
                      <h3 className="post-title">{post.title.slice(0, 30)}...</h3>
                      <p className="post-excerpt">{post.content.slice(0, 30)}...</p>
                      <div className="post-meta">
                        <span className="publish-date">
                          {new Date(post.publish_date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="slide-section">
                <div className="slider-area">
                  <Slider />
                  {posts.slice(6, 8).map(post => (
                    <Link to={`/post/${post.slug}`} className="slider-bottom-post" key={post.slug}>
                      <img src={post.image} alt={post.title} />
                      <div className="content">
                        <h3 className="post-title">{post.title.slice(0, 30)}...</h3>
                        <p className="post-excerpt">{post.content.slice(0, 30)}...</p>
                        <div className="post-meta">
                          <span className="publish-date">
                            {new Date(post.publish_date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="side-posts">
                  {posts.slice(4, 6).map(post => (
                    <Link to={`/post/${post.slug}`} className="post-card" key={post.slug}>
                      <div className="card-image-container">
                        <img src={post.image} alt={post.title} className="post-image" />
                        <span className="category-tag">{post.category}</span>
                      </div>
                      <div className="card-content">
                        <h3 className="post-title">{post.title.slice(0, 30)}...</h3>
                        <p className="post-excerpt">{post.content.slice(0, 30)}...</p>
                        <div className="post-meta">
                          <span className="publish-date">
                            {new Date(post.publish_date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="content-wrapper">
                <h2 className="section-title">
                  <span>Diğer Tüm Haberler</span>
                </h2>

                {(() => {
                  const categorized = {}; 
                  posts.slice(8).forEach(post => {
                    if (!categorized[post.category]) {
                      categorized[post.category] = [];
                    }
                    categorized[post.category].push(post);
                  });

                  return Object.entries(categorized).map(([category, categoryPosts]) => {
                    if (categoryPosts.length === 0) return null;

                    return (
                      <div key={category} className="category-section">
                        <h3 className="category-title">{category} Haberleri</h3>
                        <div className="posts-grid">
                          {categoryPosts.map(post => (
                            <Link to={`/post/${post.slug}`} className="post-card" key={post.slug}>
                              <div className="card-image-container">
                                <img src={post.image} alt={post.title} className="post-image" />
                                <span className="category-tag">{post.category}</span>
                              </div>
                              <div className="card-content">
                                <h3 className="post-title">{post.title}</h3>
                                <p className="post-excerpt">{post.content.slice(0, 50)}...</p>
                                <div className="post-meta">
                                  <span className="publish-date">
                                    {new Date(post.publish_date).toLocaleDateString('tr-TR')}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
        </>
      )}
    </div>
  );
};

export default Home;
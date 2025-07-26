import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CategoryPage.css';
import CategorySlider from '../slider/categoryslider';

const CategoryPage = ({ category }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryColor, setCategoryColor] = useState('#dd0000ff'); 
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/posts")
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(post => post.category === category);
        setPosts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    fetch("http://localhost:5000/category")
      .then(res => res.json())
      .then(data => {
        const match = data.find(cat => cat.name === category);
        if (match && match.color) {
          setCategoryColor(match.color);
        } else {
          setCategoryColor('#dd0000ff'); 
        }
      })
      .catch(() => {
        setCategoryColor('#dd0000ff'); 
      });
  }, [category]);

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="loader"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="no-posts">
        <img src="/no-results.svg" alt="Sonuç yok" />
        <h3>Henüz {category.toLowerCase()} haberleri bulunmamaktadır</h3>
        <Link to="/" className="home-link">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-header" style={{ backgroundColor: categoryColor }}>
        <h1>{category} Haberleri</h1>
        <p>En güncel {category.toLowerCase()} haberleri burada</p>
      </div>
      {!showMobileMenu && (
        <div className="mobile-slider-wrapper">
          <CategorySlider category={category} />
        </div>
      )}
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
          <CategorySlider category={category} />
          {posts.slice(6, 8).map(post => (
            <Link to={`/post/${post.slug}`} className="slider-bottom-post" key={post.slug}>
              <img src={post.image} alt={post.title} />
              <div className="content">
                <h3 className="post-title">{post.title.slice(0, 30)}...</h3>
                <p className="post-excerpt">{post.content.slice(0, 30)}...</p>
                <div className="post-meta">
                  <span className="read-time">2 dk okuma</span>
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
                  <span className="read-time">2 dk okuma</span>
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
          <span>Diğer {category} Haberleri</span>
        </h2>
        <div className="posts-grid">
          {posts.slice(8).map(post => (
            <Link to={`/post/${post.slug}`} className="post-card" key={post.slug}>
              <div className="card-image-container">
                <img src={post.image} alt={post.title} className="post-image" />
                <span className="category-tag">{post.category}</span>
              </div>
              <div className="card-content">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.content.slice(0, 50)}...</p>
                <div className="post-meta">
                  <span className="read-time">2 dk okuma</span>
                  <span className="publish-date">
                    {new Date(post.publish_date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;

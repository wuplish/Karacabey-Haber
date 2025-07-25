import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import './CategoryPage.css';
import CategorySlider from './slider/categoryslider';

const CategoryPage = ({ category }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const categoryColors = {
    'Gündem': '#e74c3c',
    'Spor': '#3498db',
    'Magazin': '#9b59b6',
    'Ekonomi': '#f39c12',
    'Siyaset': '#2ecc71',
    'Eğitim': '#1abc9c',
    'Sağlık': '#e67e22',
    'Teknoloji': '#6d77fdff',
    'Kültür-Sanat': '#d35400',
    'Yaşam': '#27ae60',
    'Asayiş': '#c0392b',
    'Tarım': '#16a085',
    'Belediye': '#8e44ad',
    'Resmi İlanlar': '#ff0000ff'
  };

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
      <div className="category-header" style={{ backgroundColor: categoryColors[category] || '#2c3e50' }}>
        <h1>{category} Haberleri</h1>
        <p>En güncel {category.toLowerCase()} haberleri burada</p>
      </div>

      {/* 🟥 İlk 4 post - özel kartlar */}
      <div className="top-posts-row">
        {posts.slice(0, 4).map(post => (
          <Link to={`/post/${post.id}`} className="post-card" key={post.id}>
            <div className="card-image-container">
              <img src={post.image} alt={post.title} className="post-image" />
              <span className="category-tag">{post.category}</span>
            </div>
            <div className="card-content">
              <h3 className="post-title">{post.title.slice(0, 30)}...</h3>
              <p className="post-excerpt">{post.content.slice(0, 30)}...</p>
              <div className="post-meta">
                <span className="read-time">3 dk okuma</span>
                <span className="publish-date">
                  {new Date(post.publish_date).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 🟦 Slider + 6.-8. postlar + yan postlar */}
      <div className="slide-section">
        <div className="slider-area">
          <CategorySlider category={category} />

          {/* Alt kısımda 7-8. postlar */}
          {posts.slice(6, 8).map(post => (
            <Link to={`/post/${post.id}`} className="slider-bottom-post" key={post.id}>
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

        {/* 5-6. postları sağ tarafa yerleştir */}
        <div className="side-posts">
          {posts.slice(4, 6).map(post => (
            <Link to={`/post/${post.id}`} className="post-card" key={post.id}>
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

      {/* 🟩 Geri kalan tüm haberler */}
      <div className="content-wrapper">
        <h2 className="section-title">
          <span>Diğer {category} Haberleri</span>
        </h2>
        <div className="posts-grid">
          {posts.slice(8).map(post => (
            <Link to={`/post/${post.id}`} className="post-card" key={post.id}>
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

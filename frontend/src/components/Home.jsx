import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const Home = () => {
  const [breaking, setBreaking] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/breaking")
      .then(res => res.json())
      .then(data => setBreaking(data));

    fetch("http://localhost:5000/posts")
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-container">
      {/* Breaking News */}
      {breaking && breaking.title && (
        <Link to={`/haber/${breaking.id}`} className="breaking-news-card">
          <div className="breaking-overlay">
            <span className="breaking-badge">SON DAKİKA</span>
            <h2>{breaking.title}</h2>
            <p>{breaking.content?.slice(0, 150)}...</p>
          </div>
          <img src={breaking.image} alt={breaking.title} className="breaking-image" />
        </Link>
      )}

      {/* Main Content */}
      <div className="content-wrapper">
        <h2 className="section-title">
          <span>Tüm Haberler</span>
        </h2>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <Link to={`/post/${post.id}`} className="post-card" key={post.id}>
                <div className="card-image-container">
                  <img src={post.image} alt={post.title} className="post-image" />
                  <span className="category-tag">{post.category}</span>
                </div>
                <div className="card-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">{post.content.slice(0, 100)}...</p>
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
        )}
      </div>
    </div>
  );
};

export default Home;
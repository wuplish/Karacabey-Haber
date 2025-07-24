import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import Slider from "./slider/slider";
import BreakingNewsBanner from './breakingnews/BreakingNewsBanner';

const Home = () => {
  const [breaking, setBreaking] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/breaking")
      .then(res => res.json())
      .then(data => {
        console.log("BREAKING DATA:", data);
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
          {/* İlk 4 post */}
          <div className="top-posts-row">
            {posts.slice(0, 4).map(post => (
              <Link to={`/post/${post.id}`} className="post-card" key={post.id}>
                <div className="card-image-container">
                  <img src={post.image} alt={post.title} className="post-image" />
                  <span className="category-tag">{post.category}</span>
                </div>
                <div className="card-content">
                  <h3 className="post-title">{post.title.slice(0, 10)}...</h3>
                  <p className="post-excerpt">{post.content.slice(0, 20)}...</p>
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
          <div className="slide-section">
            <div className="slider-area">
              <Slider />
              {/* Buraya yatay post ekliyoruz */}
              {posts.slice(6, 8).map(post => (
                <Link to={`/post/${post.id}`} className="slider-bottom-post">
                  <img src={post.image} alt={post.title} />
                  <div className="content">
                    <h3 className="post-title">{post.title.slice(0, 30)}...</h3>
                    <p className="post-excerpt">{post.content.slice(0, 20)}...</p>
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
              {/* 5. ve 6. postlar burada zaten */}
              {posts.slice(4, 6).map(post => (
                <Link to={`/post/${post.id}`} className="post-card" key={post.id}>
                  <div className="card-image-container">
                    <img src={post.image} alt={post.title} className="post-image" />
                    <span className="category-tag">{post.category}</span>
                  </div>
                  <div className="card-content">
                    <h3 className="post-title">{post.title.slice(0, 20)}...</h3>
                    <p className="post-excerpt">{post.content.slice(0, 10)}...</p>
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
              <span>Diğer Tüm Haberler</span>
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
        </>
      )}
    </div>
  );
};

export default Home;

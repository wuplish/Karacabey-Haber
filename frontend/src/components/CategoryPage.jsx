import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import PostCard from './PostCard';
import './CategoryPage.css';

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
    'Teknoloji': '#34495e',
    'Kültür-Sanat': '#d35400',
    'Yaşam': '#27ae60',
    'Asayiş': '#c0392b',
    'Tarım': '#16a085',
    'Belediye': '#8e44ad'
  };

  return (
    <div className="category-page">
      <div className="category-header" style={{ backgroundColor: categoryColors[category] || '#2c3e50' }}>
        <h1>{category} Haberleri</h1>
        <p>En güncel {category.toLowerCase()} haberleri burada</p>
      </div>

      <div className="category-content">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Haberler yükleniyor...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <img src="/no-results.svg" alt="Sonuç yok" />
            <h3>Henüz {category.toLowerCase()} haberleri bulunmamaktadır</h3>
            <Link to="/" className="home-link">Ana Sayfaya Dön</Link>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
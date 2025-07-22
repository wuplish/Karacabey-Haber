import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // kendin oluşturabilirsin

const HomePage = () => {
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

  const grouped = [];
  for (let i = 0; i < posts.length; i += 3) {
    grouped.push(posts.slice(i, i + 3));
  }

  return (
    <div className="home-container">
        {breaking ? (
        breaking.title ? (
            <Link to={`/haber/${breaking.id}`}>
            <img src={breaking.image} alt={breaking.title} />
            <div>
                <h2>SON DAKİKA: {breaking.title}</h2>
                <p>{breaking.content?.slice(0, 120)}...</p>
            </div>
            </Link>
        ) : (
            <div></div>
        )
        ) : (
        <p>Yükleniyor...</p>
        )}

      <h2 className="section-title">Tüm Haberler</h2>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        grouped.map((group, index) => (
          <div className="news-row" key={index}>
            {group.map(post => (
              <Link to={`/post/${post.id}`} className="post-card" key={post.id}>
                <img src={post.image} alt={post.title} />
                <h3>{post.title}</h3>
                <p>{post.content.slice(0, 100)}...</p>
                <span className="category">{post.category}</span>
              </Link>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default HomePage;

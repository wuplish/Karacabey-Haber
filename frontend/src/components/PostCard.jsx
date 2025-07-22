import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post }) => (
  <Link to={`/post/${post.id}`} className="post-card">
    {post.image && (
      <div className="post-card-image">
        <img src={post.image} alt={post.title} loading="lazy" />
        <span className="category-badge">{post.category}</span>
      </div>
    )}
    <div className="post-card-content">
      <h3 className="post-card-title">{post.title}</h3>
      <p className="post-card-excerpt">{post.content.slice(0, 100)}...</p>
      <div className="post-card-meta">
        <time className="post-date">
          {new Date(post.publish_date).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </time>
        <span className="read-more">
          Devamını Oku <span className="arrow">→</span>
        </span>
      </div>
    </div>
  </Link>
);

export default PostCard;
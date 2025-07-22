import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './PostDetail.css';
import { getOrCreateUserId } from '../utils/userId';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const userId = getOrCreateUserId();
      try {
        const res = await fetch(`http://localhost:5000/posts/${id}`, {
          headers: {
            'gelmisgecmiseniyiuserid': userId,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 429 && data.detail?.includes('Çok fazla istek')) {
            setError('Yavaş biraz 😅 Sunucuya çok fazla istek gönderdin.');
          } else {
            setError('Gönderi alınırken bir hata oluştu.');
          }
          return;
        }

        setPost(data);
      } catch (err) {
        setError('Bağlantı hatası oluştu.');
      }
    };

    fetchPost();
  }, [id]);
  const splitIntoParagraphs = (text, sentenceCount = 2) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]; // Noktalara göre ayır
    const paragraphs = [];

    for (let i = 0; i < sentences.length; i += sentenceCount) {
      const group = sentences.slice(i, i + sentenceCount).join(' ').trim();
      if (group.length > 0) paragraphs.push(group);
    }

    return paragraphs;
  };

  if (error) return <p className="error">{error}</p>;
  if (!post) return <p className="loading">Yükleniyor...</p>;

  return (
    <article className="post-detail">
      <h1 className="post-title">{post.title}</h1>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="post-image"
          loading="lazy"
        />
      )}

      <div className="post-content">
        {splitIntoParagraphs(post.content).map((para, index) => (
          <p key={index}>{para}</p>
        ))}
      </div>


      <div className="post-meta">
        <span>📅 {new Date(post.publish_date).toLocaleString('tr-TR')}</span>
        <span>📁 Kategori: <strong>{post.category}</strong></span>
        <span>👁️ {post.view_count} görüntülenme</span>
      </div>

      {post.tags?.length > 0 && (
        <div className="post-tags">
          🏷️ Etiketler:{" "}
          {post.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
};

export default PostDetail;

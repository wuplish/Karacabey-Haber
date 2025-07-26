import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';  // <-- buraya ekle
import './PostDetail.css';
import { getOrCreateUserId } from '../../utils/userId';

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = getOrCreateUserId();
      try {
        const postRes = await fetch(`http://localhost:5000/posts/${slug}`, {
          headers: {
            'gelmisgecmiseniyiuserid': userId,
          },
        });

        if (!postRes.ok) {
          const errorData = await postRes.json();
          throw new Error(errorData.message || 'Gönderi alınamadı');
        }

        const postData = await postRes.json();
        setPost(postData);

        const relatedRes = await fetch(`http://localhost:5000/posts?category=${postData.category}&limit=3`);
        const relatedData = await relatedRes.json();
        setRelatedPosts(relatedData.filter(p => p.id !== postData.id));

      } catch (err) {
        setError(err.message.includes('Çok fazla istek') 
          ? 'Yavaş biraz 😅 Sunucuya çok fazla istek gönderdin.' 
          : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const formatContent = (content) => {
    return content.split('\n').map((para, i) => (
      <p key={i} className="content-para">
        {para.trim() || <br />}
      </p>
    ));
  };

  if (loading) return (
      <div className="loader-wrapper">
        <div className="loader"></div>
      </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Hata oluştu</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Yeniden Dene
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{post.title} - Karacabey Haber</title>
        <meta name="description" content={post.content.slice(0, 160)} />
        <meta name="keywords" content={post.taags?.join(", ") || ""} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.content.slice(0, 160)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {post.image && <meta property="og:image" content={post.image} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.content.slice(0, 160)} />
        {post.image && <meta name="twitter:image" content={post.image} />}
      </Helmet>

      <div className="post-detail-container">
        <article className="post-article">
          <div className="post-header-meta">
            <span className="category-badge">{post.category}</span>
            <time className="publish-date">
              {new Date(post.publish_date).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </time>
          </div>

          <h1 className="post-title">{post.title}</h1>

          {post.image && (
            <div className="featured-image-container">
              <img
                src={post.image}
                alt={post.title}
                className="featured-image"
                loading="lazy"
              />
              {post.image_caption && (
                <figcaption className="image-caption">{post.image_caption}</figcaption>
              )}
            </div>
          )}

          <div className="post-content">
            {formatContent(post.content)}
          </div>

          {post.subheadings && post.subheadings.length > 0 && (
            <div className="subheadings">
              {post.subheadings.map((sub, i) => (
                <div key={i}>
                  <h3>{sub.title}</h3>
                  <p>{sub.content}</p>
                </div>
              ))}
            </div>
          )}
          <div className="post-footer-meta">
            <div className="view-count">
              <span>👁️ {post.view_count} görüntülenme</span>
            </div>
            
            {post.tags?.length > 0 && (
              <div className="tags-container">
                <h4>Etiketler:</h4>
                <div className="tags-list">
                  {post.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <aside className="related-posts">
            <h3 className="related-title">İlgili Haberler</h3>
            <div className="related-grid">
              {relatedPosts.map(related => (
                <a href={`/post/${related.id}`} key={related.id} className="related-card">
                  {related.image && (
                    <img src={related.image} alt={related.title} className="related-image" />
                  )}
                  <h4>{related.title}</h4>
                </a>
              ))}
            </div>
          </aside>
        )}
      </div>
    </>
  );
};

export default PostDetail;

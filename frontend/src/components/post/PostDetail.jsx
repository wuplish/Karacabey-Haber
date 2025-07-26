import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaWhatsapp, FaFacebookF, FaTwitter } from 'react-icons/fa';
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
        const postRes = await fetch(`http://api.karacabeygazatesi.com/posts/${slug}`, {
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

        // İlgili haberler çekiliyor
        const relatedRes = await fetch(`http://api.karacabeygazatesi.com/posts?category=${encodeURIComponent(postData.category)}&limit=4`);
        if (!relatedRes.ok) throw new Error('İlgili haberler alınamadı');
        const relatedData = await relatedRes.json();

        // Şu anki post hariç 3 tane gösterelim
        setRelatedPosts(relatedData.filter(p => p.id !== postData.id).slice(0, 3));

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
      <div className="error-icon" role="img" aria-label="Hata">⚠️</div>
      <h3>Hata oluştu</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Yeniden Dene
      </button>
    </div>
  );

  // Paylaşım butonları için fonksiyonlar:
  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(post.title)}%20https://karacabeygazatesi/post/${slug}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://karacabeygazatesi/post/${slug}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://karacabeygazatesi/post/${slug}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Helmet>
        <title>{post.title} - Karacabey Haber</title>
        <meta name="description" content={post.content.slice(0, 160)} />
        <meta name="keywords" content={post.tags?.join(", ") || ""} />
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
            <time className="publish-date" dateTime={post.publish_date}>
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
            <figure className="featured-image-container">
              <img
                src={post.image}
                alt={post.title}
                className="featured-image"
                loading="lazy"
              />
              {post.image_caption && (
                <figcaption className="image-caption">{post.image_caption}</figcaption>
              )}
            </figure>
          )}

          {/* Paylaşım butonları */}
          <ShareButtons
            handleWhatsAppShare={handleWhatsAppShare}
            handleFacebookShare={handleFacebookShare}
            handleTwitterShare={handleTwitterShare}
          />

          <div className="post-content">
            {formatContent(post.content)}
          </div>

          {post.subheadings?.length > 0 && (
            <div className="subheadings">
              {post.subheadings.map((sub, i) => (
                <section key={i}>
                  <h3>{sub.title}</h3>
                  <p>{sub.content}</p>
                </section>
              ))}
            </div>
          )}

          <footer className="post-footer-meta">
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
          </footer>
        </article>

        {relatedPosts.length > 0 && (
          <aside className="related-posts">
            <h3 className="related-title">İlgili Haberler</h3>
            <div className="related-grid">
              {relatedPosts.map(related => (
                <Link to={`/post/${related.id}`} key={related.id} className="related-card">
                  {related.image && (
                    <img src={related.image} alt={related.title} className="related-image" />
                  )}
                  <h4>{related.title}</h4>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </>
  );
};

// ShareButtons komponenti güncellendi, handle fonksiyonları prop ile alıyor
const ShareButtons = ({ handleWhatsAppShare, handleFacebookShare, handleTwitterShare }) => {
  return (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        maxWidth: 'fit-content',
        backgroundColor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',

        justifyContent: 'flex-end', // sağa hizalama
        marginTop: '-10px',          // yukarı kaldırma
        marginBottom: '10px',        // altta biraz boşluk bırak (opsiyonel)
        marginLeft: 'auto',          // sağa yaslama için (flex container varsa)
    }}>
      <span style={{ marginRight: '8px', fontWeight: '500' }}>Paylaş:</span>

      <button
        style={buttonStyle('#25D366')}
        onClick={handleWhatsAppShare}
        aria-label="WhatsApp'ta paylaş"
      >
        <FaWhatsapp size={18} />
        WhatsApp
      </button>

      <button
        style={buttonStyle('#3b5998')}
        onClick={handleFacebookShare}
        aria-label="Facebook'ta paylaş"
      >
        <FaFacebookF size={18} />
        Facebook
      </button>

      <button
        style={buttonStyle('#1DA1F2')}
        onClick={handleTwitterShare}
        aria-label="Twitter'da paylaş"
      >
        <FaTwitter size={18} />
        Twitter
      </button>
    </div>
  );
};

// Stil fonksiyonu
const buttonStyle = (bgColor) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: bgColor,
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

export default PostDetail;

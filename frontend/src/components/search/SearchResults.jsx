import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './SearchResults.css'

const SearchResults = () => {
  const { query } = useParams()
  const [posts, setPosts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("https://api.karacabeygazetesi.com/index.php?url=posts")
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        const q = query.toLowerCase()
        const results = data.filter(post =>
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(q)))
        )
        setFiltered(results)
        setLoading(false)
      })
  }, [query])

  const highlightText = (text) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
      <span key={i} className="highlight">{part}</span> : part
    )
  }

  return (
    <div className="search-results-container">
      <div className="search-header">
        <h1 className="search-title">
          <span className="search-query">"{query}"</span> için arama sonuçları
        </h1>
        <p className="result-count">{filtered.length} sonuç bulundu</p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Sonuçlar aranıyor...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="results-grid">
          {filtered.map(post => (
            <article key={post.id} className="result-card">
              <Link to={`/post/${post.id}`} className="card-link">
                {post.image && (
                  <div className="card-image">
                    <img src={post.image} alt={post.title} />
                  </div>
                )}
                <div className="card-content">
                  <div className="card-meta">
                    {post.category && (
                      <span className="category-badge">{post.category}</span>
                    )}
                    {post.publish_date && (
                      <time className="publish-date">
                        {new Date(post.publish_date).toLocaleDateString('tr-TR')}
                      </time>
                    )}
                  </div>
                  <h3 className="card-title">{highlightText(post.title)}</h3>
                  <p className="card-excerpt">
                    {highlightText(post.content.slice(0, 160))}...
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="card-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h3>"{query}" ile ilgili sonuç bulunamadı</h3>
          <p>Farklı anahtar kelimelerle tekrar deneyin</p>
          <Link to="/" className="home-link">Ana Sayfaya Dön</Link>
        </div>
      )}
    </div>
  )
}

export default SearchResults
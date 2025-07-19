import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './PostDetail.css'
import { getOrCreateUserId } from '../utils/userId'
const PostDetail = () => {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const userId = getOrCreateUserId()
    console.log(`User ID: ${userId}`)
    fetch(`http://localhost:5000/posts/${id}`, {
      headers: {
        'gelmisgecmiseniyiuserid': userId
      }
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json()
          if (res.status === 429 && data.detail?.includes('Çok fazla istek')) {
            setError('Yavaş biraz 😅 Sunucuya çok fazla istek gönderdin.')
          } else {
            setError('Gönderi alınırken bir hata oluştu.')
          }
          return
        }
        return res.json()
      })
      .then(data => {
        if (data) setPost(data)
      })
      .catch(() => {
        setError('Bağlantı hatası oluştu.')
      })
  }, [id])

  if (error) return <p className="error">{error}</p>
  if (!post) return <p className="loading">Yükleniyor...</p>

  return (
    <article className="post-detail">
      <h1 className="post-title">{post.title}</h1>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="post-image"
        />
      )}

      <div className="post-content">
        {post.content
          .split('\n')
          .filter(line => line.trim() !== '')
          .map((line, index) => (
            <p key={index}>{line}</p>
          ))}
      </div>

      <div className="post-meta">
        <span>📅 {new Date(post.publish_date).toLocaleString()}</span>
        <span>📁 Kategori: <strong>{post.category}</strong></span>
        <span>👁️ {post.view_count} kez görüntülendi</span>
      </div>

      <div className="post-tags">
        🏷️ Etiketler: {post.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </article>
  )
}

export default PostDetail

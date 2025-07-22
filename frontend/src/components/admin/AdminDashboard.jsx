import React, { useEffect, useState } from 'react'
import PostForm from '../PostForm'

function AdminDashboard() {
  const [posts, setPosts] = useState([])
  const [editPost, setEditPost] = useState(null)

  const fetchPosts = async () => {
    const res = await fetch("http://localhost:5000/posts")
    const data = await res.json()
    setPosts(data)
    setEditPost(null)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/posts/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin1234" })
    })
    fetchPosts()
  }

  const handleEdit = (post) => {
    setEditPost({
      ...post,
      tags: post.tags || []
    })
    window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }

  return (
    <div className="admin-dashboard">
      <h2>Haberler</h2>
      <PostForm onPostSaved={fetchPosts} editPost={editPost} />
      <ul>
        {posts.map(post => (
          <li key={post.id} style={{ marginBottom: '1rem' }}>
            <strong>{post.title}</strong> — {post.status === 'published' ? '✅ Yayında' : '🕓 Taslak'}
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => handleEdit(post)}>🖊️ Düzenle</button>
              <button onClick={() => handleDelete(post.id)} style={{ marginLeft: '0.5rem', backgroundColor: '#dc3545' }}>
                🗑️ Sil
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminDashboard

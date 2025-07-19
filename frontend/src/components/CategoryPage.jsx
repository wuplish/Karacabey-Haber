import React, { useEffect, useState } from 'react'
import PostCard from './PostCard'

const CategoryPage = ({ category }) => {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch("http://localhost:5000/posts")
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(post => post.category === category)
        setPosts(filtered)
      })
  }, [category])

  return (
    <section className="category">
      <h2>{category} Haberleri</h2>
      {posts.length === 0 ? (
        <p>Henüz haber bulunamadı.</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} />)
      )}
    </section>
  )
}

export default CategoryPage

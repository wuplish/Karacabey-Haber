import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const   SearchResults = () => {
  const { query } = useParams()
  const [posts, setPosts] = useState([])
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    fetch("http://localhost:5000/posts")
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        const q = query.toLowerCase()
        const results = data.filter(post =>
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q)
        )
        setFiltered(results)
      })
  }, [query])

  return (
    <section className="search-results px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">"{query}" için arama sonuçları</h2>
      {filtered.length > 0 ? (
        filtered.map(post => (
          <article key={post.id} className="mb-4 p-4 border-b">
            <h3 className="text-xl font-bold">
              <Link to={`/post/${post.id}`}>{post.title}</Link>
            </h3>
            <p>{post.content.slice(0, 120)}...</p>
          </article>
        ))
      ) : (
        <p>Sonuç bulunamadı.</p>
      )}
    </section>
  )
}

export default SearchResults

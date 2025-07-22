import React from 'react'
import { Link } from 'react-router-dom'

const PostCard = ({ post }) => (
  <article className="card">
    <h3>{post.title}</h3>
    <p>{post.content.slice(0, 70)}...</p>
    <small>{new Date(post.publish_date).toLocaleString()}</small>
    <br />
    <Link to={`/post/${post.id}`}>Devamını oku →</Link>
  </article>
)

export default PostCard

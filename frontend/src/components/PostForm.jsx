import React, { useState, useEffect } from 'react'

function PostForm({ onPostSaved, editPost }) {
  const [form, setForm] = useState({
    title: '', content: '', image: '', category: '',
    tags: '', status: 'draft', publish_date: ''
  })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  useEffect(() => { if (editPost) { setForm({ ...editPost, tags: editPost.tags.join(','), publish_date: editPost.publish_date?.slice(0, 16) || '' })
  setFile(null)}}, [editPost])
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleFile = (e) => {
    setFile(e.target.files[0])
  }
  const uploadImage = async () => {
    if (!file) return form.image
    const data = new FormData()
    data.append('file', file)
    setUploading(true)
    const res = await fetch('http://localhost:5000/upload', { method: 'POST', body: data })
    const json = await res.json()
    setUploading(false)
    return json.url
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const imageUrl = await uploadImage()
    const payload = {
      ...form,
      image: imageUrl,
      tags: form.tags.split(',').map(t => t.trim()),
      username: 'admin', password: 'admin1234'
    }
    const method = editPost ? 'PUT' : 'POST'
    const url = editPost
      ? `http://localhost:5000/posts/${editPost.id}`
      : 'http://localhost:5000/posts'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setForm({ title: '', content: '', image: '', category: '', tags: '', status: 'draft', publish_date: '' })
    setFile(null)
    onPostSaved()
  }
  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h3>{editPost ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}</h3>
      <input name="title" placeholder="Başlık" value={form.title} onChange={handleChange} />
      <textarea name="content" placeholder="İçerik" value={form.content} onChange={handleChange} />
      <input name="category" placeholder="Kategori" value={form.category} onChange={handleChange} />
      <input name="tags" placeholder="Etiketler (virgülle)" value={form.tags} onChange={handleChange} />
      <input name="publish_date" type="datetime-local" value={form.publish_date} onChange={handleChange} />
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="draft">Taslak</option>
        <option value="published">Yayınlandı</option>
      </select> 
      <label>
        Görsel:
        <input type="file" accept="image/*" onChange={handleFile} />
      </label>
      {uploading && <p>Yükleniyor...</p>}
      {form.image && !file && <img src={form.image} alt="Preview" style={{ width: '100%', marginTop: '1rem' }} />}

      <button type="submit">{editPost ? 'Güncelle' : 'Kaydet'}</button>
    </form>
  )
}
export default PostForm

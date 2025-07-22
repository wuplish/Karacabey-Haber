import React, { useState, useEffect } from 'react';
import './PostForm.css';

function PostForm({ onPostSaved, editPost }) {
  const categories = [
    "Gündem",
    "Spor",
    "Magazin",
    "Ekonomi",
    "Siyaset",
    "Eğitim",
    "Sağlık",
    "Teknoloji",
    "Kültür-Sanat",
    "Yaşam",
    "Asayiş",
    "Tarım",
    "Belediye"
  ];

  const [form, setForm] = useState({
    title: '', content: '', image: '', category: '',
    tags: '', status: 'draft', publish_date: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editPost) {
      setForm({
        ...editPost,
        tags: editPost.tags.join(','),
        publish_date: editPost.publish_date?.slice(0, 16) || ''
      });
      setFile(null);
    }
  }, [editPost]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!file) return form.image;
    const data = new FormData();
    data.append('file', file);
    setUploading(true);
    const res = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: data
    });
    const json = await res.json();
    setUploading(false);
    return json.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const imageUrl = await uploadImage();
    const payload = {
      ...form,
      image: imageUrl,
      tags: form.tags.split(',').map(t => t.trim()),
      username: 'admin',
      password: 'admin1234'
    };
    const method = editPost ? 'PUT' : 'POST';
    const url = editPost
      ? `http://localhost:5000/posts/${editPost.id}`
      : 'http://localhost:5000/posts';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setForm({
      title: '', content: '', image: '', category: '',
      tags: '', status: 'draft', publish_date: ''
    });
    setFile(null);
    onPostSaved();
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h3>{editPost ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}</h3>

      <div className="form-group">
        <label>Başlık</label>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Başlık" required />
      </div>

      <div className="form-group">
        <label>İçerik</label>
        <textarea name="content" value={form.content} onChange={handleChange} placeholder="İçerik" required />
      </div>

      <div className="form-group">
        <label>Kategori</label>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Kategori Seçin</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Etiketler (virgülle ayırın)</label>
        <input name="tags" value={form.tags} onChange={handleChange} placeholder="etiket1, etiket2" />
      </div>

      <div className="form-group">
        <label>Yayın Tarihi</label>
        <input name="publish_date" type="datetime-local" value={form.publish_date} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Durum</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="draft">Taslak</option>
          <option value="published">Yayınlandı</option>
        </select>
      </div>

      <div className="form-group">
        <label>Görsel</label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {file && <span className="file-info">{file.name}</span>}
      </div>

      {uploading && <p className="info-text">Yükleniyor...</p>}

      {form.image && !file && (
        <img src={form.image} alt="Preview" className="image-preview" />
      )}

      <button type="submit" className="submit-btn">
        {editPost ? 'Güncelle' : 'Kaydet'}
      </button>
    </form>
  );
}

export default PostForm;
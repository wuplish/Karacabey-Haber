import React, { useState, useEffect } from 'react';
import './PostForm.css';

function PostForm({ onPostSaved, editPost }) {
  const categories = [
    "Gündem", "Spor", "Magazin", "Ekonomi",
    "Siyaset", "Eğitim", "Sağlık", "Teknoloji",
    "Kültür-Sanat", "Yaşam", "Asayiş", "Tarım", "Belediye"
  ];

  const [form, setForm] = useState({
    title: '', content: '', image: '', category: '',
    tags: '', status: 'draft', publish_date: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (editPost) {
      setForm({
        ...editPost,
        tags: editPost.tags?.join(',') || '',
        publish_date: editPost.publish_date?.slice(0, 16) || ''
      });
      if (editPost.image) setPreview(editPost.image);
    }
  }, [editPost]);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const uploadImage = async () => {
    if (!file) return form.image;
    
    const data = new FormData();
    data.append('file', file);
    setUploading(true);
    
    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: data
      });
      const json = await res.json();
      return json.url;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrl = await uploadImage();
      const payload = {
        ...form,
        image: imageUrl,
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
        username: 'admin',
        password: 'admin1234'
      };
      
      const method = editPost ? 'PUT' : 'POST';
      const url = editPost 
        ? `http://localhost:5000/posts/${editPost.id}`
        : 'http://localhost:5000/posts';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Kayıt başarısız');

      setForm({
        title: '', content: '', image: '', category: '',
        tags: '', status: 'draft', publish_date: ''
      });
      setFile(null);
      setPreview('');
      onPostSaved();
    } catch (error) {
      alert('Hata oluştu: ' + error.message);
    }
  };

  return (
    <div className="post-form-container">
      <form className="post-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>{editPost ? 'Haber Düzenle' : 'Yeni Haber Ekle'}</h2>
          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => window.history.back()}>
              İptal
            </button>
            <button type="submit" className="primary-btn" disabled={uploading}>
              {uploading ? (
                <>
                  <span className="spinner"></span>
                  {editPost ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                </>
              ) : (
                editPost ? 'Güncelle' : 'Kaydet'
              )}
            </button>
          </div>
        </div>

        <div className="form-grid">
          {/* Sol Kolon */}
          <div className="form-column">
            <div className="form-group">
              <label className="form-label">Başlık*</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Haber başlığını yazın"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">İçerik*</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Haber içeriğini yazın"
                className="form-textarea"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Etiketler</label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="etiket1, etiket2, etiket3"
                className="form-input"
              />
              <span className="input-hint">Virgülle ayırarak birden fazla etiket ekleyebilirsiniz</span>
            </div>
          </div>

          {/* Sağ Kolon */}
          <div className="form-column">
            <div className="form-group">
              <label className="form-label">Kategori*</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Kategori seçin</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Yayın Tarihi</label>
              <input
                type="datetime-local"
                name="publish_date"
                value={form.publish_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Durum</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayınlandı</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Görsel</label>
              <div className="file-upload">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="file-input"
                  />
                  <span className="file-upload-button">Dosya Seç</span>
                  <span className="file-name">
                    {file ? file.name : form.image ? 'Mevcut görsel kullanılacak' : 'Dosya seçilmedi'}
                  </span>
                </label>
              </div>
              
              {preview && (
                <div className="image-preview-container">
                  <img src={preview} alt="Önizleme" className="image-preview" />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => {
                      setFile(null);
                      setPreview('');
                      setForm({...form, image: ''});
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PostForm;
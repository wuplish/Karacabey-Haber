import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './AdminDashboard.css';

function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [editPost, setEditPost] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [subheadings, setSubheadings] = useState([]);
  const [newSubheading, setNewSubheading] = useState({ title: '', content: '' });
  const [showSubheadingForm, setShowSubheadingForm] = useState(false);

  const fetchPosts = async () => {
    const res = await fetch("http://localhost:5000/posts");
    const data = await res.json();
    setPosts(data);
    setEditPost(null);
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchPosts();
    const savedCredentials = localStorage.getItem('adminCredentials');
    if (savedCredentials) {
      try {
        const parsedCredentials = JSON.parse(savedCredentials);
        if (parsedCredentials.username && parsedCredentials.password) {
          setUsername(parsedCredentials.username);
          setPassword(parsedCredentials.password);
        } else {
          console.warn("Geçersiz credential formatı");
        }
      } catch (error) {
        console.error("JSON parse hatası:", error);
        localStorage.removeItem('adminCredentials');
      }
    }
  }, []);
  const handleDelete = async (id) => {
    if (window.confirm('Bu haberi silmek istediğinize emin misiniz?')) {
      await fetch(`http://localhost:5000/posts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      fetchPosts();
    }
  };

  const handleEdit = (post) => {
    setEditPost({
      ...post,
      tags: post.tags || [],
      subheadings: post.subheadings || []
    });
    setSubheadings(post.subheadings || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleExpand = (id) => {
    setExpandedPost(expandedPost === id ? null : id);
  };

  const addSubheading = () => {
    setSubheadings([...subheadings, newSubheading]);
    setNewSubheading({ title: '', content: '' });
    setShowSubheadingForm(false);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Haber Yönetim Paneli</h1>
        <div className="header-actions">
          <button 
            className="new-post-btn"
            onClick={() => {
              setEditPost(null);
              setSubheadings([]);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <FaPlus /> Yeni Haber
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="post-form-section">
          <PostForm 
            onPostSaved={fetchPosts} 
            editPost={editPost} 
            subheadings={subheadings}
            setSubheadings={setSubheadings}
          />
        </div>

        <div className="posts-list">
          <h2>Haber Listesi</h2>
          <div className="posts-grid">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header" onClick={() => toggleExpand(post.id)}>
                  <h3>
                    {post.title}
                    <span className={`status-badge ${post.status}`}>
                      {post.status === 'published' ? 'Yayında' : 'Taslak'}
                    </span>
                  </h3>
                  <div className="post-actions">
                    <button 
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(post);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                    {expandedPost === post.id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
                
                {expandedPost === post.id && (
                  <div className="post-details">
                    <p className="post-category">{post.category}</p>
                    <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
                    
                    {post.subheadings && post.subheadings.length > 0 && (
                      <div className="subheadings-section">
                        <h4>Alt Başlıklar</h4>
                        {post.subheadings.map((sub, index) => (
                          <div key={index} className="subheading">
                            <h5>{sub.title}</h5>
                            <div dangerouslySetInnerHTML={{ __html: sub.content }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostForm({ onPostSaved, editPost, subheadings, setSubheadings }) {
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
  const [newSubheading, setNewSubheading] = useState({ title: '', content: '' });
  const [showSubheadingForm, setShowSubheadingForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    const savedCredentials = localStorage.getItem('adminCredentials');
    if (savedCredentials) {
      try {
        const parsedCredentials = JSON.parse(savedCredentials);
        if (parsedCredentials.username && parsedCredentials.password) {
          setUsername(parsedCredentials.username);
          setPassword(parsedCredentials.password);
        } else {
          console.warn("Geçersiz credential formatı");
        }
      } catch (error) {
        console.error("JSON parse hatası:", error);
        localStorage.removeItem('adminCredentials');
      }
    }
  }, []);
  useEffect(() => {
    if (editPost) {
      setForm({
        ...editPost,
        tags: editPost.tags?.join(',') || '',
        publish_date: editPost.publish_date?.slice(0, 16) || ''
      });
      if (editPost.image) setPreview(editPost.image);
    } else {
      setForm({
        title: '', content: '', image: '', category: '',
        tags: '', status: 'draft', publish_date: ''
      });
      setPreview('');
      setFile(null);
      setSubheadings([]);
    }
  }, [editPost]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubheadingChange = (e) => {
    setNewSubheading({ ...newSubheading, [e.target.name]: e.target.value });
  };

  const addSubheading = () => {
    setSubheadings([...subheadings, newSubheading]);
    setNewSubheading({ title: '', content: '' });
    setShowSubheadingForm(false);
  };

  const removeSubheading = (index) => {
    const updated = [...subheadings];
    updated.splice(index, 1);
    setSubheadings(updated);
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
        subheadings: subheadings,
        username, 
        password  
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
      setSubheadings([]);
      onPostSaved();
    } catch (error) {
      alert('Hata oluştu: ' + error.message);
    }
  };

  return (
    <div className={`post-form-container ${editPost ? 'editing' : ''}`}>
      <form className="post-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>{editPost ? 'Haber Düzenle' : 'Yeni Haber Ekle'}</h2>
          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={uploading}>
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
          <div className="main-content">
            <div className="form-group">
              <label>Başlık*</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ana haber başlığı"
                required
              />
            </div>

            <div className="form-group">
              <label>İçerik*</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Ana haber içeriği"
                required
              />
            </div>

            <div className="subheadings-section">
              <div className="section-header">
                <h3>Alt Başlıklar</h3>
                <button 
                  type="button" 
                  className="add-subheading-btn"
                  onClick={() => setShowSubheadingForm(!showSubheadingForm)}
                >
                  <FaPlus /> Alt Başlık Ekle
                </button>
              </div>

              {showSubheadingForm && (
                <div className="subheading-form">
                  <div className="form-group">
                    <input
                      type="text"
                      name="title"
                      value={newSubheading.title}
                      onChange={handleSubheadingChange}
                      placeholder="Alt başlık"
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      name="content"
                      value={newSubheading.content}
                      onChange={handleSubheadingChange}
                      placeholder="Alt başlık içeriği"
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setShowSubheadingForm(false)}
                    >
                      İptal
                    </button>
                    <button 
                      type="button" 
                      className="add-btn"
                      onClick={addSubheading}
                      disabled={!newSubheading.title}
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              )}

              {subheadings.length > 0 && (
                <div className="subheadings-list">
                  {subheadings.map((sub, index) => (
                    <div key={index} className="subheading-item">
                      <div className="subheading-header">
                        <h4>{sub.title}</h4>
                        <button 
                          type="button"
                          className="remove-subheading"
                          onClick={() => removeSubheading(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="subheading-content">{sub.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sidebar">
            <div className="form-group">
              <label>Kategori*</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Seçiniz</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Durum</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayınlandı</option>
              </select>
            </div>

            <div className="form-group">
              <label>Yayın Tarihi</label>
              <input
                type="datetime-local"
                name="publish_date"
                value={form.publish_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Etiketler</label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="etiket1, etiket2, etiket3"
              />
              <span className="hint">Virgülle ayırarak ekleyin</span>
            </div>

            <div className="form-group">
              <label>Görsel</label>
              <div className="image-upload">
                <label className="upload-label">
                  <input type="file" accept="image/*" onChange={handleFile} />
                  <span className="upload-btn">Dosya Seç</span>
                  <span className="file-name">
                    {file ? file.name : form.image ? 'Mevcut görsel' : 'Görsel seçilmedi'}
                  </span>
                </label>
                {preview && (
                  <div className="image-preview">
                    <img src={preview} alt="Önizleme" />
                    <button 
                      type="button" 
                      className="remove-image"
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
        </div>
      </form>
    </div>
  );
}

export default AdminDashboard;
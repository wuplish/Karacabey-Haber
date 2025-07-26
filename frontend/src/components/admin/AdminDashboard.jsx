import React, { useState, useEffect, act } from 'react';
import { FaPlus, FaTrash, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './AdminDashboard.css';
import axios from "axios";  
function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [editPost, setEditPost] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [subheadings, setSubheadings] = useState([]);
  const [newSubheading, setNewSubheading] = useState({ title: '', content: '' });
  const [showSubheadingForm, setShowSubheadingForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const fetchPosts = async () => {
    const res = await fetch("https://api.karacabeygazatesi.com/posts");
    const data = await res.json();
    setPosts(data);
    setEditPost(null);
  };
  const fetchCategories = async () => {
    try {
      const res = await fetch("https://api.karacabeygazatesi.com/category");
      const data = await res.json();
      // header → showInHeader eşlemesi
      setCategories(data.map(cat => ({
        ...cat,
        showInHeader: cat.header || false
      })));
    } catch (err) {
      console.error("Kategori alınamadı:", err);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, []);
  function HeaderSettings() {
  const [settings, setSettings] = useState({
    logo_line1: '',
    logo_line2: '',
    logo_line1_color: '#000000',
    logo_line2_color: '#000000'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('https://api.karacabeygazatesi.com/settings/logo-text');
        if (!res.ok) throw new Error('Ayarlar alınamadı');
        const data = await res.json();
        setSettings(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({...settings, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      try {
        const res = await fetch('https://api.karacabeygazatesi.com/settings/logo-text', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(settings),
        });
        if (!res.ok) throw new Error('Kaydetme başarısız');
        setSuccessMsg('Ayarlar kaydedildi!');
      } catch (e) {
        setError(e.message);
      } finally {
        setSaving(false);
      }
    };

    if (loading) return <p>Yükleniyor...</p>;
    if (error) return <p style={{color: 'red'}}>Hata: {error}</p>;

    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
        <h2>Header Logo Ayarları</h2>
        <label>
          Logo Satırı 1:
          <input
            type="text"
            name="logo_line1"
            value={settings.logo_line1}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: 10 }}
          />
        </label>

        <label>
          Logo Satırı 2:
          <input
            type="text"
            name="logo_line2"
            value={settings.logo_line2}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: 10 }}
          />
        </label>

        <label>
          Logo Satırı 1 Renk:
          <input
            type="color"
            name="logo_line1_color"
            value={settings.logo_line1_color}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: 10 }}
          />
        </label>

        <label>
          Logo Satırı 2 Renk:
          <input
            type="color"
            name="logo_line2_color"
            value={settings.logo_line2_color}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: 20 }}
          />
        </label>

        <button type="submit" disabled={saving} style={{ padding: '10px 20px' }}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>

        {successMsg && <p style={{ color: 'green', marginTop: 10 }}>{successMsg}</p>}
      </form>
    );
  }

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("haber");
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
        console.error("JSON  parse hatası:", error);
        localStorage.removeItem('adminCredentials');
      }
    }
  }, []);
  const handleDelete = async (id) => {
    if (window.confirm('Bu haberi silmek istediğinize emin misiniz?')) {
      await fetch(`https://api.karacabeygazatesi.com/posts/${id}`, {
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
      <div className="tab-menu">
        <div className="tab-menu">
        <button onClick={() => setActiveTab("haber")} className={activeTab === "haber" ? "active" : ""}>Haberler</button>
        <button onClick={() => setActiveTab("kategori")} className={activeTab === "kategori" ? "active" : ""}>Kategoriler</button>
        <button onClick={() => setActiveTab("header")} className={activeTab === "header" ? "active" : ""}>Header Ayarları</button>
        <button onClick={() => setActiveTab("socialmedia")} className={activeTab === "socialmedia" ? "active" : ""}>Sosyal Medya Ayarları</button>
        <button onClick={() => setActiveTab("footer")} className={activeTab === "footer" ? "active" : ""}>Footer Ayarları</button>
        <button onClick={() => setActiveTab("mobilappurl")} className={activeTab === "mobilappurl" ? "active" : ""}>Mobil APP URl Ayarları</button>
      </div>
      </div>
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
      {activeTab === "haber" ? (
      <div className="dashboard-content">
        <div className="post-form-section">
          <PostForm 
            onPostSaved={fetchPosts} 
            editPost={editPost} 
            subheadings={subheadings}
            setSubheadings={setSubheadings}
            categories={categories}
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
                      <FaEdit size={16} color="blue" />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post.id);
                      }}
                    >           
                    <FaTrash size={16} color="red" />
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
      ) : activeTab === "kategori" ? (
        <CategoryManager fetchCategories={fetchCategories} categories={categories} />
      ) : activeTab === "header" ? (
        <HeaderSettings />
      ) : activeTab === "socialmedia" ? (
        <SocialMediaSettings />
      ) : activeTab === "footer" ? (
        <FooterSettings />
      ) : activeTab === "mobilappurl" ? (
        <MobilAppUrlSettings />
      ) : null}
    </div>
  );
}
function MobilAppUrlSettings() {
  const [form, setForm] = useState({
    playstore: "",
    appstore: "",
    huaweistore: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("https://api.karacabeygazatesi.com/settings/apps");
      setForm(res.data);
    } catch (err) {
      console.error("Ayarlar alınamadı:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://api.karacabeygazatesi.com/settings/apps", form);
      setMessage("Ayarlar kaydedildi!");
    } catch (err) {
      setMessage("Hata oluştu!");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Mobil Uygulama URL Ayarları</h2>

      <div>
        <label className="block font-medium">Play Store</label>
        <input
          type="text"
          name="playstore"
          value={form.playstore}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          placeholder="https://play.google.com/store/apps/details?id=..."
        />
      </div>

      <div>
        <label className="block font-medium">App Store</label>
        <input
          type="text"
          name="appstore"
          value={form.appstore}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          placeholder="https://apps.apple.com/tr/app/..."
        />
      </div>

      <div>
        <label className="block font-medium">Huawei AppGallery</label>
        <input
          type="text"
          name="huaweistore"
          value={form.huaweistore}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          placeholder="https://appgallery.huawei.com/#/app/..."
        />
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Kaydediliyor..." : "Kaydet"}
      </button>

      {message && <p className="text-green-600">{message}</p>}
    </div>
  );
}


function FooterSettings() {
  const [footerLinks, setFooterLinks] = useState({
    kunye: "",
    kurumsal: "",
    gizlilik: "",
    kvkk: "",
    iletisim: "",
  });

  const [contactInfo, setContactInfo] = useState({
    adres: "",
    telefon: "",
    email: "",
  });

  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    description: "",
    features: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("https://api.karacabeygazatesi.com/settings/footer");
        if (!res.ok) throw new Error("Footer ayarları alınamadı");
        const data = await res.json();

        setFooterLinks(data.links || {});
        setContactInfo(data.iletisim || { adres: "", telefon: "", email: "" });
        setPlans(data.plans || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleLinkChange = (e) => {
    setFooterLinks({ ...footerLinks, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e) => {
    setContactInfo({ ...contactInfo, [e.target.name]: e.target.value });
  };

  const handlePlanChange = (index, field, value) => {
    const updatedPlans = [...plans];
    updatedPlans[index][field] = value;
    setPlans(updatedPlans);
  };

  const handleAddPlan = () => {
    if (newPlan.name.trim()) {
      setPlans([...plans, newPlan]);
      setNewPlan({ name: "", price: "", description: "", features: "" });
    }
  };

  const handleRemovePlan = (index) => {
    const updated = [...plans];
    updated.splice(index, 1);
    setPlans(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("https://api.karacabeygazatesi.com/settings/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: footerLinks, iletisim: contactInfo, plans }),
      });
      if (!res.ok) throw new Error("Kaydetme başarısız");
      setSuccessMsg("Footer ayarları başarıyla kaydedildi!");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p style={{ color: "red" }}>Hata: {error}</p>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Footer Ayarları</h2>

      {/* Footer Linkleri */}
      {["kunye", "kurumsal", "gizlilik", "kvkk"].map((key) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <label>
            {key.charAt(0).toUpperCase() + key.slice(1)}:
            <textarea
              name={key}
              value={footerLinks[key]}
              onChange={handleLinkChange}
              style={{ width: "100%", height: 100, padding: 8, resize: "vertical" }}
            />
          </label>
        </div>
      ))}

      {/* İletişim Bilgileri */}
      <h3>İletişim Bilgileri</h3>
      <div style={{ marginBottom: 12 }}>
        <label>
          Adres:
          <textarea
            name="adres"
            value={contactInfo.adres}
            onChange={handleContactChange}
            style={{ width: "100%", height: 80, padding: 8, resize: "vertical" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Telefon:
          <textarea
            name="telefon"
            value={contactInfo.telefon}
            onChange={handleContactChange}
            style={{ width: "100%", height: 40, padding: 8, resize: "none" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Email:
          <textarea
            name="email"
            value={contactInfo.email}
            onChange={handleContactChange}
            style={{ width: "100%", height: 40, padding: 8, resize: "none" }}
          />
        </label>
      </div>

      {/* Abonelik Planları */}
      <h3>Abonelik Planları</h3>
      {plans.map((plan, index) => (
        <div key={index} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
          <label>
            Plan Adı:
            <textarea
              value={plan.name}
              onChange={(e) => handlePlanChange(index, "name", e.target.value)}
              style={{ width: "100%", height: 40, marginBottom: 5, resize: "none", padding: 8 }}
            />
          </label>

          <label>
            Fiyat:
            <textarea
              value={plan.price}
              onChange={(e) => handlePlanChange(index, "price", e.target.value)}
              style={{ width: "100%", height: 40, marginBottom: 5, resize: "none", padding: 8 }}
            />
          </label>

          <label>
            Açıklama:
            <textarea
              value={plan.description}
              onChange={(e) => handlePlanChange(index, "description", e.target.value)}
              style={{ width: "100%", height: 80, marginBottom: 5, resize: "vertical", padding: 8 }}
            />
          </label>

          <label>
            Özellikler:
            <textarea
              value={plan.features}
              onChange={(e) => handlePlanChange(index, "features", e.target.value)}
              style={{ width: "100%", height: 80, marginBottom: 5, resize: "vertical", padding: 8 }}
            />
          </label>

          <button type="button" onClick={() => handleRemovePlan(index)} style={{ marginTop: 5 }}>
            Planı Sil
          </button>
        </div>
      ))}

      <h4>Yeni Plan Ekle</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea
          placeholder="Plan adı"
          value={newPlan.name}
          onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
          style={{ padding: 8, height: 40, resize: "none" }}
        />
        <textarea
          placeholder="Fiyat"
          value={newPlan.price}
          onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
          style={{ padding: 8, height: 40, resize: "none" }}
        />
        <textarea
          placeholder="Açıklama"
          value={newPlan.description}
          onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
          style={{ height: 80, resize: "vertical", padding: 8 }}
        />
        <textarea
          placeholder="Özellikler"
          value={newPlan.features}
          onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
          style={{ height: 80, resize: "vertical", padding: 8 }}
        />
        <button type="button" onClick={handleAddPlan}>
          Ekle
        </button>
      </div>

      <button type="submit" disabled={saving} style={{ marginTop: 20 }}>
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>

      {successMsg && <p style={{ color: "green", marginTop: 10 }}>{successMsg}</p>}
    </form>
  );
}

function SocialMediaSettings() {
  const [links, setLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch('https://api.karacabeygazatesi.com/socialmedia');
        if (!res.ok) throw new Error('Sosyal medya linkleri alınamadı');
        const data = await res.json();
        setLinks(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, []);

  const handleChange = (e) => {
    setLinks({ ...links, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const savedCredentials = localStorage.getItem('adminCredentials');
      let credentials = { username: '', password: '' };
      if (savedCredentials) {
        credentials = JSON.parse(savedCredentials);
      }

      const payload = {
        ...links,
        username: credentials.username,
        password: credentials.password,
      };

      const res = await fetch('https://api.karacabeygazatesi.com/settings/socialmedia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Kaydetme başarısız');
      setSuccessMsg('Sosyal medya linkleri kaydedildi!');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p style={{ color: 'red' }}>Hata: {error}</p>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Sosyal Medya Linkleri</h2>

      <label>
        Facebook:
        <input
          type="url"
          name="facebook"
          value={links.facebook}
          onChange={handleChange}
          placeholder="https://facebook.com/yourpage"
          style={{ width: '100%', marginBottom: 10 }}
        />
      </label>

      <label>
        Instagram:
        <input
          type="url"
          name="instagram"
          value={links.instagram}
          onChange={handleChange}
          placeholder="https://instagram.com/yourpage"
          style={{ width: '100%', marginBottom: 10 }}
        />
      </label>

      <label>
        Twitter:
        <input
          type="url"
          name="twitter"
          value={links.twitter}
          onChange={handleChange}
          placeholder="https://twitter.com/yourpage"
          style={{ width: '100%', marginBottom: 20 }}
        />
      </label>

      <button type="submit" disabled={saving} style={{ padding: '10px 20px' }}>
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>

      {successMsg && <p style={{ color: 'green', marginTop: 10 }}>{successMsg}</p>}
    </form>
  );
}



function CategoryManager({ fetchCategories, categories }) {
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    path: '', 
    description: '', 
    showInHeader: false 
  });

  const handleAddCategory = async () => {
    const headerCount = categories.filter(c => c.showInHeader).length;
    if (newCategory.showInHeader && headerCount >= 4) {
      alert("Header’da en fazla 4 kategori olabilir.");
      return;
    }

    // Backend header alanını bekliyor, burayı güncelle
    await fetch("https://api.karacabeygazatesi.com/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newCategory.name,
        path: newCategory.path,
        description: newCategory.description,
        header: newCategory.showInHeader // burası önemli
      }),
    });

    setNewCategory({ name: '', path: '', description: '', showInHeader: false });
    fetchCategories();
  };

  const handleToggleHeader = async (name, value) => {
    const headerCount = categories.filter(c => c.showInHeader).length;

    // Eğer aktif etme işlemi ve zaten 4 tane varsa engelle
    if (value && !categories.find(c => c.name === name).showInHeader && headerCount >= 4) {
      alert("Header’da en fazla 4 kategori olabilir.");
      return;
    }

    await fetch(`https://api.karacabeygazatesi.com/category/${name}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ header: value }), // burada header olarak gönder
    });
    fetchCategories();
  };

  const handleDeleteCategory = async (name) => {
    if (window.confirm(`${name} kategorisini silmek istiyor musunuz?`)) {
      await fetch(`https://api.karacabeygazatesi.com/category/${name}`, { method: "DELETE" });
      fetchCategories();
    }
  };


  return (
    <div className="category-manager">
      <h2>Kategori Yönetimi</h2>
      <div className="category-form">
        <input 
          placeholder="Ad" 
          value={newCategory.name} 
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} 
        />
        <input 
          placeholder="Yol (path)" 
          value={newCategory.path} 
          onChange={(e) => setNewCategory({ ...newCategory, path: e.target.value })} 
        />
        <input 
          placeholder="Açıklama" 
          value={newCategory.description} 
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} 
        />
        <label>
          Header’da Göster
          <input 
            type="checkbox" 
            checked={newCategory.showInHeader} 
            onChange={(e) => setNewCategory({ ...newCategory, showInHeader: e.target.checked })} 
          />
        </label>
        <button onClick={handleAddCategory}>Ekle</button>
      </div>

      <ul className="category-list">
        {Array.isArray(categories) && categories.map((cat, idx) => (
          <li key={idx}>
            <strong>{cat.name}</strong> - {cat.path} <br />
            <label>
              Header’da Gözüksün mü? 
              <input 
                type="checkbox" 
                checked={cat.showInHeader || false} 
                onChange={(e) => handleToggleHeader(cat.name, e.target.checked)} 
              />
            </label>
            <button onClick={() => handleDeleteCategory(cat.name)}>Sil</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
function PostForm({ onPostSaved, editPost, subheadings, setSubheadings, categories }) {
   const [cat, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://api.karacabeygazatesi.com/category");
        const namesOnly = response.data.map((item) => item.name); // sadece name çek
        setCategories(namesOnly);
      } catch (error) {
        console.error("Kategori verisi alınamadı:", error);
      }
    };

    fetchCategories();
  }, []);


    
  const [form, setForm] = useState({
    content: '', image: '', category: '',
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
    if (!file) return form.image || "https://api.karacabeygazatesi.com/uploads/ifnoimage.png";
    
    const data = new FormData();
    data.append('file', file);
    setUploading(true);
    
    try {
      const res = await fetch('https://api.karacabeygazatesi.com/upload', {
        method: 'POST',
        body: data
      });
      const json = await res.json();
      return json.url;
    } finally {
      setUploading(false);
    }
  };

  // Slug üretici fonksiyon
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[çğıöşü]/g, c => ({
        ç: 'c',
        ğ: 'g',
        ı: 'i',
        ö: 'o',
        ş: 's',
        ü: 'u'
      }[c]))
      .replace(/[^a-z0-9\s-]/g, '')  // harf/rakam/boşluk dışında sil
      .replace(/\s+/g, '-')          // boşlukları tire yap
      .replace(/-+/g, '-')           // birden çok tireyi teke indir
      .replace(/^-+|-+$/g, '');      // baş/son tireyi sil
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrl = await uploadImage();
      const payload = {
        ...form,
        slug: generateSlug(form.title),
        image: imageUrl,
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
        subheadings: subheadings,
        username, 
        password 
      };
      console.log(payload)
      const method = editPost ? 'PUT' : 'POST';
      const url = editPost 
        ? `https://api.karacabeygazatesi.com/posts/${editPost.slug}`
        : 'https://api.karacabeygazatesi.com/posts';

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
                  {categories.map((category, index) => (
                    <option key={index} value={category.name}>
                      {category.name}
                    </option>
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
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
    const res = await fetch("https://api.karacabeygazetesi.com/main.php?url=posts");
    const data = await res.json();
    setPosts(data);
    setEditPost(null);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://api.karacabeygazetesi.com/main.php?url=category");
      const data = await res.json();
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
          const res = await fetch('https://api.karacabeygazetesi.com/main.php?url=settings/logo-text');
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
          const res = await fetch('https://api.karacabeygazetesi.com/main.php?url=settings/logo-text', {
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
        await fetch(`https://api.karacabeygazetesi.com/main.php?url=posts/${id}`, {
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
          <PostForm 
            onPostSaved={fetchPosts} 
            editPost={editPost} 
            setEditPost={setEditPost} // setEditPost prop olarak eklendi
            subheadings={subheadings}
            setSubheadings={setSubheadings}
            categories={categories}
          />
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
        const res = await axios.get("https://api.karacabeygazetesi.com/main.php?url=settings/apps");
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
        const res = await axios.post("https://api.karacabeygazetesi.com/main.php?url=settings/apps", form);
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
          const res = await fetch("https://api.karacabeygazetesi.com/main.php?url=settings/footer");
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
        const res = await fetch("https://api.karacabeygazetesi.com/main.php?url=settings/footer", {
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
          const res = await fetch('https://api.karacabeygazetesi.com/main.php?url=socialmedia');
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

        const res = await fetch('https://api.karacabeygazetesi.com/main.php?url=settings/socialmedia', {
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

      await fetch("https://api.karacabeygazetesi.com/main.php?url=category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.name,
          path: newCategory.path,
          description: newCategory.description,
          header: newCategory.showInHeader 
        }),
      });

      setNewCategory({ name: '', path: '', description: '', showInHeader: false });
      fetchCategories();
    };

    const handleToggleHeader = async (name, value) => {
      const headerCount = categories.filter(c => c.showInHeader).length;

      if (value && !categories.find(c => c.name === name).showInHeader && headerCount >= 4) {
        alert("Header’da en fazla 4 kategori olabilir.");
        return;
      }

      await fetch(`https://api.karacabeygazetesi.com/main.php?url=category/${name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ header: value }), 
      });
      fetchCategories();
    };

    const handleDeleteCategory = async (name) => {
      if (window.confirm(`${name} kategorisini silmek istiyor musunuz?`)) {
        await fetch(`https://api.karacabeygazetesi.com/main.php?url=category/${name}`, { method: "DELETE" });
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
function PostForm({ onPostSaved, editPost, setEditPost, subheadings, setSubheadings, categories: propCategories }) { 

  const [cat, setCategories] = useState([]); // State for fetched categories (names only)
  const [form, setForm] = useState({
    title: '', // Added title to form state for new posts
    content: '',
    image: '', // This will hold the path from upload, or existing path
    category: '',
    tags: '',
    status: 'draft',
    publish_date: ''
  });
  
  const [file, setFile] = useState(null); // The actual File object to be uploaded
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(''); // URL for image preview (local or remote)
  const [newSubheading, setNewSubheading] = useState({ title: '', content: '' });
  const [showSubheadingForm, setShowSubheadingForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(''); // Başarı/hata mesajları için

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("https://api.karacabeygazetesi.com/main.php?url=category");
        const namesOnly = response.data.map((item) => item.name);
        setCategories(namesOnly);
      } catch (error) {
        console.error("Kategori verisi alınamadı:", error);
      }
    };
    fetchCategories();
  }, []);

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
      console.log("Edit Post mode. Initializing form with:", editPost);
      setForm({
        ...editPost,
        tags: editPost.tags?.join(',') || '',
        publish_date: editPost.publish_date?.slice(0, 16) || '' // Format for datetime-local
      });
      // Set preview for existing image
      if (editPost.image) {
        // Assuming editPost.image is already a full URL or a relative path
        // If it's a relative path like "uploads/filename.jpg", construct full URL for preview
        setPreview(editPost.image.startsWith('http') ? editPost.image : `https://api.karacabeygazetesi.com/main.php?url=${editPost.image}`); 
        console.log("Setting image preview for existing post:", editPost.image.startsWith('http') ? editPost.image : `https://api.karacabeygazetesi.com/main.php?url=${editPost.image}`);
      } else {
        setPreview('');
      }
      setFile(null); // No new file selected yet
      setSubheadings(editPost.subheadings || []); // Initialize subheadings
    } else {
      console.log("New Post mode. Resetting form.");
      setForm({
        title: '', content: '', image: '', category: '',
        tags: '', status: 'draft', publish_date: ''
      });
      setPreview('');
      setFile(null);
      setSubheadings([]);
    }
  }, [editPost, setSubheadings]); // Added setSubheadings to dependency array

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubheadingChange = (e) => {
    setNewSubheading({ ...newSubheading, [e.target.name]: e.target.value });
  };

  const addSubheading = () => {
    if (newSubheading.title.trim() && newSubheading.content.trim()) {
        setSubheadings([...subheadings, newSubheading]);
        setNewSubheading({ title: '', content: '' });
        setShowSubheadingForm(false);
    } else {
        alert("Alt başlık ve içerik boş bırakılamaz.");
    }
  };

  const removeSubheading = (index) => {
    const updated = [...subheadings];
    updated.splice(index, 1);
    setSubheadings(updated);
  };

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    console.log("handleFile: Selected file:", selectedFile);
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Create a local URL for instant preview
    } else {
      setFile(null);
      // If no file selected, revert preview to existing image if in edit mode
      // Ensure existing image is also a full URL for preview
      setPreview(editPost && editPost.image ? (editPost.image.startsWith('http') ? editPost.image : `https://api.karacabeygazetesi.com/main.php?url=${editPost.image}`) : '');
    }
  };

  const uploadImage = async () => {
    console.log("--- uploadImage fonksiyonu başladı ---");
    console.log("Current 'file' state (dosya seçili mi?):", file);

    // If no new file is selected, return the existing image path or a default
    if (!file) {
      const existingImagePath = form.image; // This comes from editPost or is empty for new
      const defaultImagePath = "https://api.karacabeygazetesi.com/main.php?url=uploads/ifnoimage.png";
      console.log("Yeni dosya seçilmedi. Mevcut resim yolu ('form.image'):", existingImagePath);
      console.log("Varsayılan resim yolu:", defaultImagePath);
      return existingImagePath || defaultImagePath;
    }

    // A new file is selected, proceed with upload
    const data = new FormData();
    data.append('image', file); // DÜZELTİLDİ: 'file' yerine 'image' kullanıldı
    console.log("FormData oluşturuldu. 'image' eklendi.");
    setUploading(true); // Indicate upload in progress

    try {
      console.log("PHP /upload API'ye istek gönderiliyor...");
      const res = await fetch('https://api.karacabeygazetesi.com/main.php?url=upload', {
        method: 'POST',
        body: data // FormData automatically sets Content-Type: multipart/form-data
      });

      console.log("Fetch isteği tamamlandı. HTTP yanıt durumu:", res.status, res.statusText);

      if (!res.ok) { // Check if HTTP status is 2xx
        const errorData = await res.json(); // Attempt to parse error response
        console.error("Yükleme API hatası (HTTP hata kodu):", errorData);
        throw new Error(errorData.detail || "Resim yüklenirken sunucu hatası (HTTP " + res.status + ").");
      }

      const jsonResponse = await res.json(); // Parse successful JSON response
      console.log("PHP API'den gelen BAŞARILI JSON yanıtı:", jsonResponse);

      // --- CRITICAL PART: Check the key from PHP response ---
      // Your PHP code returns 'path'. So we must use jsonResponse.path
      if (jsonResponse.path) {
        console.log("Yüklenen resim yolu (jsonResponse.path):", jsonResponse.path);
        return jsonResponse.path; // This is the path we need (e.g., "uploads/uniqueid.webp")
      } else {
        console.error("PHP yanıtında 'path' anahtarı bulunamadı. Yanıt objesi:", jsonResponse);
        throw new Error("PHP'den beklenen dosya yolu alınamadı.");
      }

    } catch (error) {
      console.error("Resim yükleme sırasında genel hata (catch bloğu):", error);
      // Fallback in case of any error during upload
      return form.image || "https://api.karacabeygazetesi.com/main.php?url=uploads/ifnoimage.png";
    } finally {
      setUploading(false); // End uploading state
      console.log("--- uploadImage fonksiyonu bitti ---");
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
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("--- handleSubmit fonksiyonu başladı ---");

    try {
      // 1. Resmi yükle (veya mevcut yolu al)
      const imageUrl = await uploadImage();
      console.log("uploadImage'dan dönen SON imageUrl:", imageUrl); // Critical check!

      // Eğer imageUrl hala boş/varsayılan ise ve kullanıcı resim seçtiyse uyarı verilebilir.
      if (!imageUrl || imageUrl.includes('ifnoimage.png')) {
        console.warn("Haber kaydediliyor ancak geçerli bir resim yolu alınamadı. 'image' alanı varsayılan veya boş olabilir.");
      }

      // 2. Haber payload'unu oluştur
      let finalImageUrl = imageUrl; // imageUrl from uploadImage()

      // Check if imageUrl is a relative path and convert it to a full URL
      // This handles both newly uploaded images and old images saved as relative paths
      if (finalImageUrl && !finalImageUrl.startsWith('http')) {
          finalImageUrl = `https://api.karacabeygazetesi.com/main.php?url=${finalImageUrl}`;
      }

      const payload = {
        ...form,
        slug: generateSlug(form.title),
        image: finalImageUrl, // Assign the potentially converted full URL
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
        subheadings: subheadings,
        username,
        password
      };
      console.log("Haber kaydı için hazırlanmış SON payload:", payload); // **YENİDEN KONTROL ET! image: undefined mi?**

      // 3. Haberi kaydet (PUT veya POST)
      const method = editPost ? 'PUT' : 'POST';
      const url = editPost
        ? `https://api.karacabeygazetesi.com/main.php?url=posts/${editPost.slug}`
        : 'https://api.karacabeygazetesi.com/main.php?url=posts';

      console.log(`Haber kaydediliyor: Method=${method}, URL=${url}`);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log("Haber kaydetme yanıtı:", response);

      if (!response.ok) {
        const errorResult = await response.json();
        console.error("Haber kaydetme API hatası (HTTP hata kodu):", errorResult);
        throw new Error(errorResult.error || 'Haber kaydedilemedi.');
      }

      const successResult = await response.json();
      console.log("Haber başarıyla kaydedildi:", successResult);
      alert('Haber başarıyla kaydedildi!');
      onPostSaved(); // Haberler listesini yenile
      setFile(null); // Reset file input after successful save
      setPreview(''); // Clear preview
      setEditPost(null); // Clear edit mode after save

    } catch (error) {
      console.error("handleSubmit'te haber kaydetme işlemi sırasında genel hata:", error);
      alert('Haber kaydedilirken bir hata oluştu: ' + error.message);
    } finally {
        console.log("--- handleSubmit fonksiyonu bitti ---");
    }
  };

  return (
    <div className="post-form">
      <h3>{editPost ? 'Haberi Düzenle' : 'Yeni Haber Oluştur'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Başlık:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">İçerik:</label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows="10"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="image">Resim Yükle:</label>
          <input
            type="file"
            id="image"
            name="image" // HTML name is not used by FormData directly, but good practice
            onChange={handleFile}
            accept="image/*"
          />
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Resim Önizleme" style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} />
            </div>
          )}
          {uploading && <p>Resim yükleniyor...</p>}
        </div>
        <div className="form-group">
          <label htmlFor="category">Kategori:</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Kategori Seçin</option>
            {cat.map((categoryName, index) => (
              <option key={index} value={categoryName}>
                {categoryName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="tags">Etiketler (virgülle ayırın):</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={form.tags}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="status">Durum:</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="publish_date">Yayın Tarihi:</label>
          <input
            type="datetime-local"
            id="publish_date"
            name="publish_date"
            value={form.publish_date}
            onChange={handleChange}
          />
        </div>

        {/* Alt Başlıklar Bölümü */}
        <div className="form-group subheadings-section">
          <label>Alt Başlıklar:</label>
          {subheadings.map((sub, index) => (
            <div key={index} className="subheading-item">
              <h4>{sub.title}</h4>
              <p>{sub.content}</p>
              <button type="button" onClick={() => removeSubheading(index)} className="remove-subheading-btn">
                Kaldır
              </button>
            </div>
          ))}
          {!showSubheadingForm && (
            <button type="button" onClick={() => setShowSubheadingForm(true)} className="add-subheading-toggle-btn">
              <FaPlus /> Alt Başlık Ekle
            </button>
          )}
          {showSubheadingForm && (
            <div className="new-subheading-form">
              <input
                type="text"
                name="title"
                placeholder="Alt Başlık Başlığı"
                value={newSubheading.title}
                onChange={handleSubheadingChange}
                required
              />
              <textarea
                name="content"
                placeholder="Alt Başlık İçeriği"
                value={newSubheading.content}
                onChange={handleSubheadingChange}
                required
              ></textarea>
              <button type="button" onClick={addSubheading}>Ekle</button>
              <button type="button" onClick={() => setShowSubheadingForm(false)}>İptal</button>
            </div>
          )}
        </div>

        <button type="submit" disabled={uploading}>
          {uploading ? 'Yükleniyor...' : (editPost ? 'Haber Güncelle' : 'Haber Oluştur')}
        </button>
      </form>
    </div>
  );
}

export default AdminDashboard;
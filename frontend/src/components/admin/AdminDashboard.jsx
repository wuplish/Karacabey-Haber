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
          <button onClick={() => setActiveTab("slider")} className={activeTab === "slider" ? "active" : ""}>Slider Ayarları</button>
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
        ) : activeTab == "slider" ? (
          <SliderSettings />
        ) : null}
      </div>
    );
  }

// Ana Uygulama bileşeni, artık SliderSettings olarak adlandırıldı
// Bu bir fonksiyonel React bileşenidir.
const SliderSettings = () => {
    // Slider verilerini tutan state
    const [sliders, setSliders] = useState([]);
    // Form verilerini tutan state (oluşturma ve düzenleme için)
    const [formData, setFormData] = useState({
        title: '',
        image: '', // Görselin URL'si veya yolu
        target_url: ''
    });
    // Düzenlenmekte olan slider'ı tutan state
    const [selectedSlider, setSelectedSlider] = useState(null);
    // Kullanıcıya gösterilecek mesajları tutan state (başarı/hata)
    const [message, setMessage] = useState('');
    // Yükleme durumunu gösteren state
    const [loading, setLoading] = useState(false);
    // Yüklenecek görsel dosyasını tutan state
    const [imageFile, setImageFile] = useState(null);

    // API'nizin temel URL'si. Kendi sunucu adresinize göre ayarlayın.
    // Örneğin: 'http://api.karacabeygazetesi.com/main.php?url='
    const API_BASE_URL = 'http://api.karacabeygazetesi.com/main.php?url='; 

    // Bileşen yüklendiğinde sliderları getir
    useEffect(() => {
        fetchSliders();
    }, []);

    // Tüm özel sliderları API'den çeken fonksiyon
    const fetchSliders = async () => {
        setLoading(true); // Yükleme durumunu başlat
        try {
            const response = await fetch(`${API_BASE_URL}special-sliders`);
            const data = await response.json();
            if (response.ok) {
                setSliders(data); // Sliderları state'e kaydet
            } else {
                setMessage(`Sliderlar getirilirken hata: ${data.error || 'Bilinmeyen hata'}`);
            }
        } catch (error) {
            setMessage(`Sliderlar getirilirken ağ hatası: ${error.message}`);
        } finally {
            setLoading(false); // Yükleme durumunu bitir
        }
    };

    // Form inputlarındaki değişiklikleri yöneten fonksiyon
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Dosya inputundaki değişiklikleri yöneten fonksiyon
    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]); // Seçilen dosyayı state'e kaydet
    };

    // Görseli sunucuya yükleyen fonksiyon
    const uploadImage = async () => {
        // Eğer yeni bir dosya seçilmediyse, mevcut görsel yolunu döndür
        if (!imageFile) return formData.image;

        setLoading(true);
        setMessage('Resim yükleniyor...');
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile); // Dosyayı FormData'ya ekle

        try {
            const response = await fetch(`${API_BASE_URL}upload`, {
                method: 'POST',
                body: uploadFormData, // FormData'yı doğrudan gönder
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Resim başarıyla yüklendi!');
                return data.file_path; // Sunucudan dönen dosya yolunu döndür (örn: 'uploads/image.jpg')
            } else {
                setMessage(`Resim yükleme hatası: ${data.error || 'Bilinmeyen hata'}`);
                return null; // Hata durumunda null döndür
            }
        } catch (error) {
            setMessage(`Resim yükleme ağ hatası: ${error.message}`);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Form gönderimini yöneten fonksiyon (oluşturma veya güncelleme)
    const handleSubmit = async (e) => {
        e.preventDefault(); // Varsayılan form gönderimini engelle
        setLoading(true);
        setMessage('');

        // Görseli yükle
        const uploadedImagePath = await uploadImage();
        // Eğer yeni bir görsel seçildi ve yükleme başarısız olduysa işlemi durdur
        if (imageFile && !uploadedImagePath) {
            setLoading(false);
            return;
        }

        // API'ye gönderilecek veriyi hazırla
        const dataToSend = {
            ...formData,
            image: uploadedImagePath || formData.image // Yeni yüklenen yol varsa onu kullan, yoksa mevcut yolu koru
        };

        // Metodu ve URL'yi belirle (güncelleme veya oluşturma)
        const method = selectedSlider ? 'PUT' : 'POST';
        const url = selectedSlider
            ? `${API_BASE_URL}special-sliders/${selectedSlider.id}`
            : `${API_BASE_URL}special-sliders`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json', // JSON veri gönderildiği için başlık ayarla
                },
                body: JSON.stringify(dataToSend), // Veriyi JSON string'e dönüştür
            });
            const result = await response.json();

            if (response.ok) {
                setMessage(result.message || 'İşlem başarıyla tamamlandı!');
                setFormData({ title: '', image: '', target_url: '' }); // Formu temizle
                setSelectedSlider(null); // Seçili slider'ı sıfırla
                setImageFile(null); // Görsel dosyasını sıfırla
                fetchSliders(); // Slider listesini yenile
            } else {
                setMessage(`Hata: ${result.error || 'Bilinmeyen bir hata oluştu.'}`);
            }
        } catch (error) {
            setMessage(`Ağ hatası: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Bir slider'ı düzenlemek için formu dolduran fonksiyon
    const handleEdit = (slider) => {
        setSelectedSlider(slider); // Düzenlenecek slider'ı seç
        setFormData({
            title: slider.title,
            image: slider.image,
            target_url: slider.target_url
        });
        setMessage(''); // Mesajı temizle
    };

    // Bir slider'ı silen fonksiyon
    const handleDelete = async (id) => {
        // Kullanıcıdan onay al
        if (!window.confirm('Bu sliderı silmek istediğinizden emin misiniz?')) {
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}special-sliders/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
                setMessage(result.message || 'Slider başarıyla silindi!');
                fetchSliders(); // Listeyi yenile
            } else {
                setMessage(`Hata: ${result.error || 'Bilinmeyen bir hata oluştu.'}`);
            }
        } catch (error) {
            setMessage(`Ağ hatası: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans antialiased">
            {/* Tailwind CSS CDN'i */}
            <script src="https://cdn.tailwindcss.com"></script>
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Özel Slider Yönetimi</h1>

                {/* Mesaj kutusu */}
                {message && (
                    <div className={`p-3 mb-4 rounded-md ${message.startsWith('Hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                {/* Yükleniyor göstergesi */}
                {loading && (
                    <div className="flex items-center justify-center mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-3 text-gray-700">Yükleniyor...</span>
                    </div>
                )}

                {/* Slider Oluştur/Güncelle Formu */}
                <div className="mb-8 p-6 border border-gray-200 rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">{selectedSlider ? 'Sliderı Düzenle' : 'Yeni Slider Oluştur'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Başlık</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Görsel Yükle</label>
                            <input
                                type="file"
                                id="imageFile"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {/* Mevcut görseli göster */}
                            {formData.image && (
                                <p className="mt-2 text-sm text-gray-500">Mevcut Görsel: <a href={formData.image.startsWith('http') ? formData.image : `${API_BASE_URL}${formData.image}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{formData.image.split('/').pop()}</a></p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="target_url" className="block text-sm font-medium text-gray-700">Hedef URL</label>
                            <input
                                type="url"
                                id="target_url"
                                name="target_url"
                                value={formData.target_url}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            {/* Düzenleme modundaysa iptal butonu */}
                            {selectedSlider && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedSlider(null);
                                        setFormData({ title: '', image: '', target_url: '' });
                                        setImageFile(null);
                                        setMessage('');
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    İptal
                                </button>
                            )}
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {selectedSlider ? 'Sliderı Güncelle' : 'Slider Oluştur'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Mevcut Slider Listesi */}
                <div className="p-6 border border-gray-200 rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Mevcut Sliderlar</h2>
                    {sliders.length === 0 && !loading ? (
                        <p className="text-gray-500">Henüz hiç özel slider yok.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Başlık
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Görsel
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hedef URL
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Yayın Tarihi
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sliders.map((slider) => (
                                        <tr key={slider.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {slider.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {slider.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {slider.image ? (
                                                    <a href={slider.image.startsWith('http') ? slider.image : `${API_BASE_URL}${slider.image}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        {/* Görsel boyutunu ve şeklini burada düzenledim */}
                                                        <img 
                                                            src={slider.image.startsWith('http') ? slider.image : `${API_BASE_URL}${slider.image}`} 
                                                            alt={slider.title} 
                                                            className="w-16 h-16 object-cover rounded-md" 
                                                            onError={(e) => e.target.src = 'https://placehold.co/64x64/cccccc/000000?text=No+Image'} 
                                                        />
                                                    </a>
                                                ) : 'Yok'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <a href={slider.target_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {slider.target_url}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(slider.publish_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(slider)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(slider.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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

  const [cat, setCategories] = useState([]); // Fetch edilen kategorileri tutar (sadece isimler)
  const [form, setForm] = useState({
    title: '', // Yeni gönderiler için başlık
    content: '',
    image: '', // Yüklemeden gelen veya mevcut resim yolu
    category: '',
    tags: '',
    status: 'draft',
    publish_date: '',
    is_slider: 0 // is_slider için varsayılan değer 0
  });
  
  const [file, setFile] = useState(null); // Yüklenecek gerçek dosya nesnesi
  const [uploading, setUploading] = useState(false); // Yükleme durumu
  const [preview, setPreview] = useState(''); // Resim önizlemesi için URL (yerel veya uzak)
  const [newSubheading, setNewSubheading] = useState({ title: '', content: '' }); // Yeni alt başlık formu verisi
  const [showSubheadingForm, setShowSubheadingForm] = useState(false); // Alt başlık ekleme formunun görünürlüğü
  const [username, setUsername] = useState(""); // Yönetici kullanıcı adı
  const [password, setPassword] = useState(""); // Yönetici şifresi
  const [message, setMessage] = useState(''); // Başarı/hata mesajları için

  // API'nizin temel URL'si. Kendi sunucu adresinize göre ayarlayın.
  const API_BASE_URL = 'https://api.karacabeygazetesi.com/main.php?url='; 

  // Kategorileri API'den çeker
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}category`);
        const namesOnly = response.data.map((item) => item.name);
        setCategories(namesOnly);
      } catch (error) {
        console.error("Kategori verisi alınamadı:", error);
      }
    };
    fetchCategories();
  }, [API_BASE_URL]); // API_BASE_URL değiştiğinde yeniden çalışır

  // Yönetici kimlik bilgilerini localStorage'dan yükler
  useEffect(() => {
    const savedCredentials = localStorage.getItem('adminCredentials');
    if (savedCredentials) {
      try {
        const parsedCredentials = JSON.parse(savedCredentials);
        if (parsedCredentials.username && parsedCredentials.password) {
          setUsername(parsedCredentials.username);
          setPassword(parsedCredentials.password);
        } else {
          console.warn("Geçersiz kimlik bilgisi formatı");
        }
      } catch (error) {
        console.error("JSON ayrıştırma hatası:", error);
        localStorage.removeItem('adminCredentials');
      }
    }
  }, []);

  // Düzenleme moduna girildiğinde formu doldurur veya yeni gönderi için sıfırlar
  useEffect(() => {
    if (editPost) {
      console.log("Düzenleme modu. Form şu veriyle başlatılıyor:", editPost);
      setForm({
        ...editPost,
        tags: editPost.tags?.join(',') || '', // Etiketleri virgülle ayrılmış stringe dönüştür
        publish_date: editPost.publish_date?.slice(0, 16) || '', // datetime-local formatına dönüştür
        is_slider: editPost.is_slider || 0 // is_slider değerini al, yoksa 0
      });
      // Mevcut resim için önizlemeyi ayarla
      if (editPost.image) {
        setPreview(editPost.image.startsWith('http') ? editPost.image : `${API_BASE_URL}${editPost.image}`); 
      } else {
        setPreview('');
      }
      setFile(null); // Henüz yeni dosya seçilmedi
      setSubheadings(editPost.subheadings || []); // Alt başlıkları başlat
    } else {
      console.log("Yeni gönderi modu. Form sıfırlanıyor.");
      setForm({
        title: '', content: '', image: '', category: '',
        tags: '', status: 'draft', publish_date: '',
        is_slider: 0 // Yeni gönderi için varsayılan 0
      });
      setPreview('');
      setFile(null);
      setSubheadings([]);
    }
  }, [editPost, setSubheadings, API_BASE_URL]); // Bağımlılık dizisine API_BASE_URL eklendi

  // Form inputlarındaki değişiklikleri yönetir
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Checkbox yerine select olduğu için type kontrolü kaldırıldı, değer doğrudan number'a çevrildi
    setForm({ ...form, [name]: name === 'is_slider' ? parseInt(value, 10) : value });
  };

  // Alt başlık formu inputlarındaki değişiklikleri yönetir
  const handleSubheadingChange = (e) => {
    setNewSubheading({ ...newSubheading, [e.target.name]: e.target.value });
  };

  // Yeni alt başlık ekler
  const addSubheading = () => {
    if (newSubheading.title.trim() && newSubheading.content.trim()) {
        setSubheadings([...subheadings, newSubheading]);
        setNewSubheading({ title: '', content: '' });
    } else {
        alert("Alt başlık ve içerik boş bırakılamaz."); // Kullanıcıya uyarı ver
    }
  };

  // Belirli bir alt başlığı kaldırır
  const removeSubheading = (index) => {
    const updated = [...subheadings];
    updated.splice(index, 1);
    setSubheadings(updated);
  };

  // Dosya seçildiğinde tetiklenir
  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    console.log("handleFile: Seçilen dosya:", selectedFile);
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Anında önizleme için yerel URL oluştur
    } else {
      setFile(null);
      // Dosya seçilmezse, düzenleme modundaysa mevcut resme geri dön
      setPreview(editPost && editPost.image ? (editPost.image.startsWith('http') ? editPost.image : `${API_BASE_URL}${editPost.image}`) : '');
    }
  };

  // Resmi sunucuya yükler veya mevcut yolu döndürür
  const uploadImage = async () => {
    console.log("--- uploadImage fonksiyonu başladı ---");
    console.log("Mevcut 'file' state (dosya seçili mi?):", file);

    // Yeni dosya seçilmediyse, mevcut resim yolunu veya varsayılanı döndür
    if (!file) {
      const existingImagePath = form.image; 
      const defaultImagePath = `${API_BASE_URL}uploads/ifnoimage.png`; // Varsayılan resim
      console.log("Yeni dosya seçilmedi. Mevcut resim yolu ('form.image'):", existingImagePath);
      console.log("Varsayılan resim yolu:", defaultImagePath);
      return existingImagePath || defaultImagePath;
    }

    // Yeni bir dosya seçildiyse, yükleme işlemine devam et
    const data = new FormData();
    data.append('file', file); // PHP tarafında 'file' anahtarı bekleniyor
    console.log("FormData oluşturuldu. 'file' eklendi.");
    setUploading(true); // Yükleme durumunu başlat

    try {
      console.log("PHP /upload API'ye istek gönderiliyor...");
      const res = await fetch(`${API_BASE_URL}upload`, {
        method: 'POST',
        body: data // FormData otomatik olarak Content-Type: multipart/form-data ayarlar
      });

      console.log("Fetch isteği tamamlandı. HTTP yanıt durumu:", res.status, res.statusText);

      if (!res.ok) { // HTTP durumu 2xx değilse hata var demektir
        const errorData = await res.json(); // Hata yanıtını ayrıştırmaya çalış
        console.error("Yükleme API hatası (HTTP hata kodu):", errorData);
        throw new Error(errorData.detail || `Resim yüklenirken sunucu hatası (HTTP ${res.status}).`);
      }

      const jsonResponse = await res.json(); // Başarılı JSON yanıtını ayrıştır
      console.log("PHP API'den gelen BAŞARILI JSON yanıtı:", jsonResponse);

      // PHP kodunuz 'file_path' anahtarını döndürüyor
      if (jsonResponse.file_path) {
        console.log("Yüklenen resim yolu (jsonResponse.file_path):", jsonResponse.file_path);
        return jsonResponse.file_path; // İhtiyacımız olan yol (örn: "uploads/uniqueid.webp")
      } else {
        console.error("PHP yanıtında 'file_path' anahtarı bulunamadı. Yanıt objesi:", jsonResponse);
        throw new Error("PHP'den beklenen dosya yolu alınamadı.");
      }

    } catch (error) {
      console.error("Resim yükleme sırasında genel hata (catch bloğu):", error);
      // Yükleme sırasında herhangi bir hata durumunda geri dönüş
      return form.image || `${API_BASE_URL}uploads/ifnoimage.png`;
    } finally {
      setUploading(false); // Yükleme durumunu bitir
      console.log("--- uploadImage fonksiyonu bitti ---");
    }
  };

  // Slug üretici fonksiyonu (URL dostu metin oluşturur)
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[çğıöşü]/g, c => ({
        ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u'
      }[c]))
      .replace(/[^a-z0-9\s-]/g, '') // Harf, rakam, boşluk ve tire dışındaki karakterleri kaldır
      .replace(/\s+/g, '-') // Birden fazla boşluğu tek tireye dönüştür
      .replace(/-+/g, '-') // Birden fazla tireyi tek tireye dönüştür
      .replace(/^-+|-+$/g, ''); // Başlangıç ve sondaki tireleri kaldır
  };

  // Form gönderimini yönetir (oluşturma veya güncelleme)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("--- handleSubmit fonksiyonu başladı ---");

    try {
      // 1. Resmi yükle (veya mevcut yolu al)
      const imageUrl = await uploadImage();
      console.log("uploadImage'dan dönen SON imageUrl:", imageUrl); 

      // Eğer imageUrl hala boş/varsayılan ise ve kullanıcı resim seçtiyse uyarı verilebilir.
      if (!imageUrl || imageUrl.includes('ifnoimage.png')) {
        console.warn("Haber kaydediliyor ancak geçerli bir resim yolu alınamadı. 'image' alanı varsayılan veya boş olabilir.");
      }

      // 2. Haber payload'unu oluştur
      let finalImageUrl = imageUrl; 

      // Eğer resim yolu göreceli ise (http ile başlamıyorsa) tam URL'ye dönüştür
      if (finalImageUrl && !finalImageUrl.startsWith('http')) {
          finalImageUrl = `${API_BASE_URL}${finalImageUrl}`;
      }

      const payload = {
        ...form,
        slug: generateSlug(form.title), // Başlıktan slug oluştur
        image: finalImageUrl, // Potansiyel olarak dönüştürülmüş tam URL'yi ata
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t), // Etiketleri diziye dönüştür
        subheadings: subheadings, // Alt başlıkları ekle
        username, // Yönetici kullanıcı adı
        password // Yönetici şifresi
      };
      console.log("Haber kaydı için hazırlanmış SON payload:", payload); 

      // 3. Haberi kaydet (PUT veya POST)
      const method = editPost ? 'PUT' : 'POST'; // Düzenleme ise PUT, yeni ise POST
      const url = editPost
        ? `${API_BASE_URL}posts/${editPost.slug}` // Düzenleme için slug kullan
        : `${API_BASE_URL}posts`; // Yeni gönderi için genel posts endpoint'i

      console.log(`Haber kaydediliyor: Metot=${method}, URL=${url}`);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' }, // JSON veri gönderildiği için başlık ayarla
        body: JSON.stringify(payload) // Veriyi JSON string'e dönüştür
      });

      console.log("Haber kaydetme yanıtı:", response);

      if (!response.ok) { // HTTP durumu 2xx değilse hata var demektir
        const errorResult = await response.json();
        console.error("Haber kaydetme API hatası (HTTP hata kodu):", errorResult);
        throw new Error(errorResult.error || 'Haber kaydedilemedi.');
      }

      const successResult = await response.json();
      console.log("Haber başarıyla kaydedildi:", successResult);
      alert('Haber başarıyla kaydedildi!'); // Kullanıcıya başarı mesajı göster
      onPostSaved(); // Haberler listesini yenilemek için callback çağır
      setFile(null); // Dosya inputunu sıfırla
      setPreview(''); // Önizlemeyi temizle
      setEditPost(null); // Düzenleme modunu kapat

    } catch (error) {
      console.error("handleSubmit'te haber kaydetme işlemi sırasında genel hata:", error);
      alert('Haber kaydedilirken bir hata oluştu: ' + error.message); // Kullanıcıya hata mesajı göster
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
            name="image" 
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

        {/* is_slider select butonu */}
        <div className="form-group">
          <label htmlFor="is_slider">Sliderda Göster:</label>
          <select
            id="is_slider"
            name="is_slider"
            value={form.is_slider} // is_slider değeri 0 veya 1 olacak
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value={0}>Hayır</option>
            <option value={1}>Evet</option>
          </select>
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
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import "./InfoPage.css";

const sectionTitles = {
  kunye: "Künye",
  kurumsal: "Kurumsal",
  gizlilik: "Gizlilik Politikası",
  kvkk: "KVKK",
  iletisim: "İletişim",
  abonelik: "Abonelik Planları",
};

const InfoPage = ({ section }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for iletişim
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Form gönderme durumu
  const [formStatus, setFormStatus] = useState({
    loading: false,
    error: null,
    success: null,
  });

  useEffect(() => {
    axios
      .get("http://api.karacabeygazatesi.com/settings/footer")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Veri alınamadı: " + err.message);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: null, success: null });

    try {
      // Örnek POST isteği - backend'de bunu karşılayacak endpoint olmalı
      await axios.post("https://api.karacabeygazatesi.com/contact", formData);

      setFormStatus({ loading: false, error: null, success: "Mesajınız gönderildi!" });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setFormStatus({
        loading: false,
        error: "Mesaj gönderilirken hata oluştu. Lütfen tekrar deneyin.",
        success: null,
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  let content;

  if (section === "abonelik") {
    content = (
      <div className="plans-grid">
        {data.plans.map((plan, i) => (
          <div key={i} className="card">
            <h3 className="card-title">{plan.name}</h3>
            <p className="card-description">{plan.description}</p>
            <p className="card-price">Fiyat: {plan.price}</p>
            <ul className="card-features">
              {plan.features.split(",").map((feature, idx) => (
                <li key={idx}>{feature.trim()}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  } else if (section === "iletisim") {
    content = (
      <div className="contact-grid">
        <div className="card contact-info">
          <h3 className="card-title">İletişim Bilgileri</h3>
          <p>
            <strong>Adres:</strong> {data.iletisim?.adres}
          </p>
          <p>
            <strong>Telefon:</strong> {data.iletisim?.telefon}
          </p>
          <p>
            <strong>Email:</strong> {data.iletisim?.email}
          </p>
        </div>
        <div className="card contact-form">
          <h3 className="card-title">Mesaj Gönder</h3>
          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Adınız"
              required
              value={formData.name}
              onChange={handleInputChange}
              disabled={formStatus.loading}
            />
            <input
              type="email"
              name="email"
              placeholder="E-posta"
              required
              value={formData.email}
              onChange={handleInputChange}
              disabled={formStatus.loading}
            />
            <textarea
              name="message"
              placeholder="Mesajınız"
              rows="5"
              required
              value={formData.message}
              onChange={handleInputChange}
              disabled={formStatus.loading}
            ></textarea>
            <button type="submit" disabled={formStatus.loading}>
              {formStatus.loading ? "Gönderiliyor..." : "Gönder"}
            </button>
          </form>
          {formStatus.error && <p className="error-text">{formStatus.error}</p>}
          {formStatus.success && <p className="success-text">{formStatus.success}</p>}
        </div>
      </div>
    );
  } else {
    content = (
      <div className="text-section">
        {data.links[section]?.split("##").map((item, i) => {
          const [title, ...bodyLines] = item.split("\n");
          const body = bodyLines.join("\n");
          return (
            <div key={i} className="card">
              <h3 className="card-title">{title}</h3>
              <p className="card-text">{body}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <main className="container">
      <Helmet>
        <title>{sectionTitles[section]} | Site Adı</title>
        <meta
          name="description"
          content={`${sectionTitles[section]} hakkında bilgiler`}
        />
      </Helmet>
      <h1 className="page-title">{sectionTitles[section]}</h1>
      <section className="content-area">{content}</section>
    </main>
  );
};

export default InfoPage;

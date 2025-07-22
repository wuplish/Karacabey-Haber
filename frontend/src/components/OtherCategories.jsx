// OtherCategories.js
import React from 'react';
import { Link } from 'react-router-dom';
import './OtherCategories.css';

const OtherCategories = () => {
  const categories = [
    {
      name: "Siyaset",
      path: "/siyaset",
      description: "Yerel ve ulusal siyaset haberleri, analizler ve gelişmeler"
    },
    {
      name: "Eğitim",
      path: "/egitim",
      description: "Okullar, kurslar, eğitim sistemindeki değişiklikler"
    },
    {
      name: "Sağlık",
      path: "/saglik",
      description: "Hastaneler, sağlık hizmetleri, koruyucu sağlık bilgileri"
    },
    {
      name: "Teknoloji",
      path: "/teknoloji",
      description: "Yeni teknolojiler, dijital dünyadan haberler"
    },
    {
      name: "Kültür-Sanat",
      path: "/kultur-sanat",
      description: "Sergiler, tiyatrolar, yerel sanat etkinlikleri"
    },
    {
      name: "Yaşam",
      path: "/yasam",
      description: "Günlük hayata dair pratik bilgiler, ipuçları"
    },
    {
      name: "Asayiş",
      path: "/asayis",
      description: "Güvenlik haberleri, polis faaliyetleri"
    },
    {
      name: "Tarım",
      path: "/tarim",
      description: "Çiftçi haberleri, tarımsal destekler, hasat durumu"
    },
    {
      name: "Belediye",
      path: "/belediye",
      description: "Belediye hizmetleri, projeler ve duyurular"
    }
  ];
  return (
    <div className="other-categories-container">
      <h1 className="page-title">Diğer Kategoriler</h1>
      <div className="categories-grid">
        {categories.map((category, index) => (
          <Link to={category.path} key={index} className="category-card">
            <h3 className="category-title">{category.name}</h3>
            <p className="category-description">{category.description}</p>
            <span className="read-more">Haberleri Gör &rarr;</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OtherCategories;
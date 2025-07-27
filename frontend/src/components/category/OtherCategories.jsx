import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './OtherCategories.css';

const OtherCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("https://api.karacabeygazetesi.com/index.php?url=category")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // header alanı true olanları çıkar, sadece header=false olanları al
          const filtered = data.filter(cat => !cat.header);
          setCategories(filtered);
        } else {
          console.error("Kategori verisi geçerli bir dizi değil.");
        }
      })
      .catch((err) => {
        console.error("Kategori verisi alınamadı:", err);
      });
  }, []);

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

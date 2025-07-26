import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [query, setQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const sliderWrapper = document.querySelector('.mobile-slider-wrapper');
    if (sliderWrapper) {
      sliderWrapper.style.display = showMobileMenu ? 'none' : '';
    }
  }, [showMobileMenu]);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/category");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Kategori alınamadı:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/ara/${encodeURIComponent(query.trim())}`);
      setQuery("");
      setShowMobileMenu(false);
    }
  };

  const toggleMobileMenu = () => {
    const newState = !showMobileMenu;
    setShowMobileMenu(newState);
    document.body.style.overflow = newState ? 'hidden' : 'auto';
    const sliderWrapper = document.querySelector('.mobile-slider-wrapper');
    if (sliderWrapper) {
      sliderWrapper.style.display = newState ? 'none' : '';
    }
  };


  const mainCategories = categories.slice(0, 4);
  const otherCategories = categories.slice(4);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`} role="banner">
      <div className="header-container">
        <Link to="/" className="logo-link" aria-label="Ana sayfaya dön">
          <h1 className="logo">
            <span className="logo-first">KARACABEY</span>
            <span className="logo-second">HABER</span>
          </h1>
        </Link>

        <form
          onSubmit={handleSearch}
          className={`search-form ${showMobileMenu ? 'active' : ''}`}
          role="search"
          aria-label="Site içi arama"
        >
          <div className="search-container">
            <input
              type="search"
              placeholder="Haber ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
              aria-label="Arama kelimelerini girin"
              name="searchQuery"
            />
            <button type="submit" className="search-button" aria-label="Arama yap">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>

        <nav
          className={`nav-links ${showMobileMenu ? 'mobile-show' : ''}`}
          aria-label="Ana menü"
          id="main-navigation"
        >
          <Link
            to="/"
            className="nav-link"
            onClick={() => setShowMobileMenu(false)}
            aria-current={window.location.pathname === '/' ? "page" : undefined}
          >
            Anasayfa
          </Link>

          {mainCategories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.path}
              className="nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              {cat.name}
            </Link>
          ))}

          <Link 
            to="/diger" 
            className="nav-link" 
            onClick={() => setShowMobileMenu(false)}
          >
            Diğer Kategoriler
          </Link>
        </nav>

        <button
          className={`mobile-menu-button ${showMobileMenu ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Menüyü aç/kapat"
          aria-expanded={showMobileMenu}
          aria-controls="main-navigation"
        >
          <span className="menu-line"></span> 
          <span className="menu-line"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;

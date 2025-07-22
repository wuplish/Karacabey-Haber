// Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [query, setQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    setShowMobileMenu(!showMobileMenu);
    document.body.style.overflow = showMobileMenu ? 'auto' : 'hidden';
  };

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
            aria-current={window.location.pathname === '/' ? "page" : undefined} // Düzeltme
          >
            Anasayfa
          </Link>
          <Link 
            to="/gundem" 
            className="nav-link" 
            onClick={() => setShowMobileMenu(false)}
          >
            Gündem
          </Link>
          <Link 
            to="/spor" 
            className="nav-link" 
            onClick={() => setShowMobileMenu(false)}
          >
            Spor
          </Link>
          <Link 
            to="/magazin" 
            className="nav-link" 
            onClick={() => setShowMobileMenu(false)}
          >
            Magazin
          </Link>
          <Link 
            to="/ekonomi" 
            className="nav-link" 
            onClick={() => setShowMobileMenu(false)}
          >
            Ekonomi
          </Link>
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
          <span className="menu-line"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <a
      href="https://www.aytuncbaskan.com"
      target="_blank"
      rel="noopener noreferrer"
      className="footer-logo-link"
    >
      <img
        src="https://www.aytuncbaskan.com/wp-content/uploads/2025/04/Adsiz-tasarim-2022-12-09T014101.358-scaled.png"
        alt="Aytunç Baskan Creative Agency Logo"
        className="footer-logo"
      />
    </a>
    <p className="footer-text">
      Bu site{" "}
      <a
        href="https://www.aytuncbaskan.com"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-agency-link"
      >
        Aytunç Baskan Creative Agency
      </a>
      ® tarafından gelişmiş altyapı sistemleri kullanılarak hazırlanmıştır.
    </p>
  </footer>
);

export default Footer;
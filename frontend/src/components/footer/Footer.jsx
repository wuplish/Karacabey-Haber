import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import googlePlayIcon from '../footer/assets/goolgle-play-icon.png';
import appStoreIcon from '../footer/assets/app-store-icon.png';
import huaweiAppGalleryIcon from '../footer/assets/huawei-app-gallery-icon.png';

const Footer = () => {
  const [appLinks, setAppLinks] = useState({
    playstore: '',
    appstore: '',
    huaweistore: '',
  });

  useEffect(() => {
    const fetchAppLinks = async () => {
      try {
        const res = await fetch('https://api.karacabeygazatesi.com/settings/apps');
        const data = await res.json();
        setAppLinks(data);
      } catch (error) {
        console.error('Mobil uygulama linkleri alınamadı:', error);
      }
    };

    fetchAppLinks();
  }, []);

  const links = [
    { to: '/kunye', label: 'Künye' },
    { to: '/kurumsal', label: 'Kurumsal' },
    { to: '/abonelik', label: 'Abonelik Planları' },
    { to: '/gizlilik', label: 'Gizlilik Politikası' },
    { to: '/kvkk', label: 'KVKK' },
    { to: '/iletisim', label: 'İletişim' },
  ];

  const storeImages = [
    { src: googlePlayIcon, alt: 'Google Play Store', href: appLinks.playstore },
    { src: appStoreIcon, alt: 'Apple App Store', href: appLinks.appstore },
    { src: huaweiAppGalleryIcon, alt: 'Huawei AppGallery', href: appLinks.huaweistore },
  ];

  return (
    <footer className="footer">
      <nav className="footer-nav">
        {links.map((link, index) => (
          <React.Fragment key={link.to}>
            <Link to={link.to} className="footer-link">
              {link.label}
            </Link>
            {index < links.length - 1 && <span className="separator">|</span>}
          </React.Fragment>
        ))}
      </nav>

      <div className="store-images">
        {storeImages.map(({ src, alt, href }, i) => (
          href && (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="store-link">
              <img src={src} alt={alt} className="store-icon" />
            </a>
          )
        ))}
      </div>

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
        Bu site{' '}
        <a
          href="https://www.aytuncbaskan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-agency-link"
        >
          Aytunç Baskan Creative Agency
        </a>
        ® tarafından hazırlanmıştır.
      </p>
    </footer>
  );
};

export default Footer;

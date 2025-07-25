import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import './BreakingNewsBanner.css';

const BreakingNewsBanner = ({ breaking }) => {
  const [index, setIndex] = useState(0);
  const [animClass, setAnimClass] = useState('animate-slide-in');

  useEffect(() => {
    if (!breaking || breaking.length === 0) return;

    const interval = setInterval(() => {
      setAnimClass('animate-slide-out');

      setTimeout(() => {
        setIndex(prev => (prev + 1) % breaking.length);
        setAnimClass('animate-slide-in');
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [breaking]);

  if (!breaking || breaking.length === 0) return null;

  const currentNews = breaking[index];

  return (
    <div className="breaking-banner">
      <strong className="breaking-label">SON DAKİKA:&nbsp;</strong>

      <Link 
        to={`/post/${currentNews.id}`} 
        className={`breaking-text ${animClass}`} 
      >
        {currentNews.title}
      </Link>

      <div className="social-icons">
        <a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <FaFacebookF />
        </a>
        <a href="https://instagram.com/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <FaInstagram />
        </a>
        <a href="https://twitter.com/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
          <FaTwitter />
        </a>
      </div>
    </div>
  );
};

export default BreakingNewsBanner;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import './BreakingNewsBanner.css';

const BreakingNewsBanner = ({ breaking }) => {
  const [index, setIndex] = useState(0);
  const [animClass, setAnimClass] = useState('animate-slide-in');
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: ''
  });

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

  // Sosyal medya linklerini fetch et
  useEffect(() => {
    async function fetchSocialLinks() {
      try {
        const res = await fetch('http://localhost:5000/socialmedia');
        if (!res.ok) throw new Error('Sosyal medya linkleri alınamadı');
        const data = await res.json();
        setSocialLinks({
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          twitter: data.twitter || ''
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchSocialLinks();
  }, []);

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
        {socialLinks.facebook && (
          <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebookF />
          </a>
        )}
        {socialLinks.instagram && (
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
        )}
        {socialLinks.twitter && (
          <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter />
          </a>
        )}
      </div>
    </div>
  );
};

export default BreakingNewsBanner;

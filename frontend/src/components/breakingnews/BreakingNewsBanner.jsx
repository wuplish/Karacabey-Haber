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

  // Effect for cycling breaking news
  useEffect(() => {
    // If there's no breaking news or it's empty, we don't need to set up the interval.
    // Also, reset index to 0 in case 'breaking' becomes empty after previously having data.
    if (!breaking || breaking.length === 0) {
      setIndex(0);
      return;
    }

    const interval = setInterval(() => {
      // Start slide-out animation
      setAnimClass('animate-slide-out');

      // After animation, update index and start slide-in animation for next news
      setTimeout(() => {
        setIndex(prev => (prev + 1) % breaking.length);
        setAnimClass('animate-slide-in');
      }, 300); // This should match your CSS transition duration
    }, 5000); // Cycle every 5 seconds

    // Cleanup the interval when the component unmounts or 'breaking' prop changes
    return () => clearInterval(interval);
  }, [breaking]); // Re-run effect if 'breaking' array changes

  // Effect for fetching social media links once on mount
  useEffect(() => {
    async function fetchSocialLinks() {
      try {
        // Ensure this URL matches your backend's routing for social media
        // If you implemented the '?url=' fix in main.php, this is correct.
        const res = await fetch('https://api.karacabeygazetesi.com/index.php?url=socialmedia');
        
        if (!res.ok) {
          // Throw an error if the network response was not ok (e.g., 404, 500)
          throw new Error(`Failed to fetch social media links: ${res.statusText}`);
        }
        
        const data = await res.json();
        setSocialLinks({
          facebook: data.facebook || '', // Use empty string if data.facebook is null/undefined
          instagram: data.instagram || '',
          twitter: data.twitter || ''
        });
      } catch (err) {
        console.error("Error fetching social media links:", err);
      }
    }
    fetchSocialLinks();
  }, []); // Empty dependency array means this runs only once on component mount

  // --- Crucial defensive checks to prevent "undefined" errors ---
  // If 'breaking' prop is null, undefined, or an empty array, don't render the banner.
  if (!breaking || breaking.length === 0) {
    return null; 
  }

  // Get the current news item based on the 'index' state.
  // We are sure 'breaking' has at least one item here because of the above check.
  const currentNews = breaking[index];

  // Additional defensive check for 'currentNews' itself.
  // This handles very rare edge cases where 'currentNews' might still be undefined
  // even if 'breaking' is not empty (e.g., if 'index' somehow got an invalid value
  // temporarily, though your modulo arithmetic should generally prevent this).
  if (!currentNews) {
    console.warn("currentNews is undefined, possibly due to a timing issue or invalid index. Not rendering banner content.");
    return null; // Or you could render a loading spinner or placeholder here.
  }

  return (
    <div className="breaking-banner">
      <strong className="breaking-label">SON DAKİKA:&nbsp;</strong>

      {/* Link to the current breaking news post */}
      <Link 
        to={`/post/${currentNews.slug}`} 
        className={`breaking-text ${animClass}`} 
      >
        {currentNews.title}
      </Link>

      <div className="social-icons">
        {/* Render Facebook icon if link exists */}
        {socialLinks.facebook && (
          <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebookF />
          </a>
        )}
        {/* Render Instagram icon if link exists */}
        {socialLinks.instagram && (
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
        )}
        {/* Render Twitter icon if link exists */}
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
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './BreakingNewsBanner.css'

const BreakingNewsBanner = ({ breaking }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!breaking || breaking.length === 0) return;

    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % breaking.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [breaking]);

  if (!breaking || breaking.length === 0) return null;

  const currentNews = breaking[index];

  return (
    <Link to={`/post/${currentNews.id}`} className="breaking-banner">
      <strong>SON DAKİKA:&nbsp;</strong>
      <span>{currentNews.title}</span>
    </Link>
    
  );
};

export default BreakingNewsBanner;
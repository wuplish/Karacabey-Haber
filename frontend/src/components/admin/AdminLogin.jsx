import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCredentials = localStorage.getItem('adminCredentials');
    if (savedCredentials) {
      const { username: savedUser, password: savedPass } = JSON.parse(savedCredentials);
      setUsername(savedUser);
      setPassword(savedPass);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("https://api.karacabeygazetesi.com/index.php?url=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        localStorage.setItem('adminCredentials', JSON.stringify({ username, password }));
        onLogin(true);
        navigate('/admin/dashboard');
      } else {
        setError("Kullanıcı adı veya şifre hatalı");
      }
    } catch (err) {
      setError("Sunucu hatası. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <h2>Admin Paneli Giriş</h2>
          <div className="logo">
            <span className="logo-primary">KARACABEY</span>
            <span className="logo-secondary">HABER</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@karacabeyhaber.com"
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </form>
        
        <div className="login-footer">
          <p>© {new Date().getFullYear()} Karacabey Haber Admin Paneli</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
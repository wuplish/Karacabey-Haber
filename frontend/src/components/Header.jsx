import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/ara/${encodeURIComponent(query.trim())}`)
      setQuery("")
    }
  }

  return (
    <header className="header flex flex-col items-center p-4 bg-white shadow-md">
      <h1 className="logo text-2xl font-bold mb-2">KARACABEY HABER</h1>


        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Haber ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Ara</button>
        </form>

      <nav className="nav-links flex gap-4">
        <Link to="/">Anasayfa</Link>
        <Link to="/gundem">Gündem</Link>
        <Link to="/spor">Spor</Link>
        <Link to="/magazin">Magazin</Link>
        <Link to="/ekonomi">Ekonomi</Link>
      </nav>
    </header>
  )
}

export default Header

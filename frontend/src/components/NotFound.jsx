import React from 'react'
import { Link,useLocation  } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
    const location = useLocation()
    if (location.pathname.startsWith('/admin')) {
        return null
    }
    return (
        <div className="not-found">
        <h1>404 - Sayfa Bulunamadı</h1>
        <p>Aradığınız sayfa bulunamadı veya kaldırılmış olabilir.</p>
        <Link to="/">Anasayfaya Dön</Link>
        </div>
    )
}

export default NotFound

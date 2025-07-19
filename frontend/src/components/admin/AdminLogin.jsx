import React, { useState } from 'react'

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)


  
  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })

    if (res.ok) {
      onLogin(true)
    } else {
      setError("Kullanıcı adı veya şifre hatalı")
    }
  }

  return (
    <div className="admin-login">
      <h2>Admin Giriş</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Kullanıcı adı" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Giriş Yap</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default AdminLogin

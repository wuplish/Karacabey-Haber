import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './components/admin/AdminLogin'
import AdminDashboard from './components/admin/AdminDashboard'

function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <Routes>
      <Route path="/karacabeyadminpanel" element={
        isAuthenticated ? <Navigate to="/karacabeyadminpanel/dashboard" /> : <AdminLogin onLogin={setIsAuthenticated} />
      } />
      <Route path="/karacabeyadminpanel/dashboard" element={
        isAuthenticated ? <AdminDashboard /> : <Navigate to="/karacabeyadminpanel" />
      } />
    </Routes>
  )
}

export default AdminPanel

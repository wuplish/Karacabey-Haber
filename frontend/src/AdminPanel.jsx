import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './components/admin/AdminLogin'
import AdminDashboard from './components/admin/AdminDashboard'

function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <Routes>
      <Route path="/admin" element={
        isAuthenticated ? <Navigate to="/admin/dashboard" /> : <AdminLogin onLogin={setIsAuthenticated} />
      } />
      <Route path="/admin/dashboard" element={
        isAuthenticated ? <AdminDashboard /> : <Navigate to="/admin" />
      } />
    </Routes>
  )
}

export default AdminPanel

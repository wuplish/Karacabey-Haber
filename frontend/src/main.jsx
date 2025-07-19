import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import AdminPanel from './AdminPanel.jsx'
import './style/styles.css'
import './components/socialmedia/style.css'
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <BrowserRouter>
    <>
      <App />
      <AdminPanel />
    </>
  </BrowserRouter>
)

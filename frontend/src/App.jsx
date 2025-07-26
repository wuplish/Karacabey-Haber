import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CategoryPage from './components/CategoryPage'
import PostDetail from './components/PostDetail'
import BreakingNewsBanner from './components/breakingnews/BreakingNewsBanner.jsx'
import NotFound from './components/NotFound'
import Instagram from './components/socialmedia/Instagram'
import Twitter from './components/socialmedia/Twitter'
import Facebook from './components/socialmedia/Facebook'
import SearchResults from './components/SearchResults'
import Home from './components/Home'
import OtherCategories from './components/OtherCategories'
import AdminPanel from './AdminPanel.jsx'

function App() {
  const [breaking, setBreaking] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/breaking")
      .then(res => res.json())
      .then(data => setBreaking(data));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/category")
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  return (
    <>
      <Header breaking={breaking} />
      <BreakingNewsBanner breaking={breaking} />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ara/:query" element={<SearchResults />} />
          <Route path="/facebook" element={<Facebook />} />
          <Route path="/instagram" element={<Instagram />} />
          <Route path="/twitter" element={<Twitter />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/diger" element={<OtherCategories />} />
          {categories.map((cat, i) => (
            <Route
              key={i}
              path={cat.path}
              element={
                cat.path === "/diger" ? (
                  <OtherCategories />
                ) : (
                  <CategoryPage category={cat.name} />
                )
              }
            />
          ))}

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <AdminPanel />
      <Footer />
    </>
  )
}

export default App

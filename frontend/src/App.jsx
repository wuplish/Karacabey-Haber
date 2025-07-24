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

  useEffect(() => {
    fetch("http://localhost:5000/breaking")
      .then(res => res.json())
      .then(data => setBreaking(data));
  }, []);

  return (
    <>
      <Header breaking={breaking} />
      <BreakingNewsBanner breaking={breaking} />
      <main className="content">
        <Routes>
          <Route path="/ara/:query" element={<SearchResults />} />
          <Route path="/" element={<Home />} />
          <Route path="/facebook" element={<Facebook />} />
          <Route path="/instagram" element={<Instagram />} />
          <Route path="/twitter" element={<Twitter />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/gundem" element={<CategoryPage category="Gündem" />} />
          <Route path="/spor" element={<CategoryPage category="Spor" />} />
          <Route path="/ekonomi" element={<CategoryPage category="Ekonomi" />} />
          <Route path="/magazin" element={<CategoryPage category="Magazin" />} />
          <Route path="/siyaset" element={<CategoryPage category="Siyaset" />} />
          <Route path="/egitim" element={<CategoryPage category="Eğitim" />} />
          <Route path="/saglik" element={<CategoryPage category="Sağlık" />} />
          <Route path="/teknoloji" element={<CategoryPage category="Teknoloji" />} />
          <Route path="/kultur-sanat" element={<CategoryPage category="Kültür ve Sanat" />} />
          <Route path="/resmi-ilanlar" element={<CategoryPage category="Resmi İlanlar" />} />
          <Route path="/yasam" element={<CategoryPage category="Yaşam" />} />
          <Route path="/asayis" element={<CategoryPage category="Asayiş" />} />
          <Route path="/tarim" element={<CategoryPage category="Tarım" />} />
          <Route path="/belediye" element={<CategoryPage category="Belediye" />} />
          <Route path="/diger" element={<OtherCategories/>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <AdminPanel />
      <Footer />
    </>
  )
}

export default App

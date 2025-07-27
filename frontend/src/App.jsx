import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/header/Header.jsx'
import Footer from './components/footer/Footer.jsx'
import CategoryPage from './components/category/CategoryPage.jsx'
import PostDetail from './components/post/PostDetail.jsx'
import BreakingNewsBanner from './components/breakingnews/BreakingNewsBanner.jsx'
import NotFound from './components/notfound/NotFound.jsx'
import Instagram from './components/socialmedia/Instagram'
import Twitter from './components/socialmedia/Twitter'
import Facebook from './components/socialmedia/Facebook'
import SearchResults from './components/search/SearchResults.jsx'
import Home from './components/Home'
import OtherCategories from './components/category/OtherCategories.jsx'
import AdminPanel from './AdminPanel.jsx'
import InfoPage from './components/post/InfoPage.jsx'
function App() {
  const [breaking, setBreaking] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("https://api.karacabeygazetesi.com/index.php?url=breaking")
      .then(res => res.json())
      .then(data => setBreaking(data));
  }, []);

  useEffect(() => {
    fetch("https://api.karacabeygazetesi.com/index.php?url=category")
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
          <Route path="/kunye" element={<InfoPage section="kunye" />} />
          <Route path="/kurumsal" element={<InfoPage section="kurumsal" />} />
          <Route path="/abonelik" element={<InfoPage section="abonelik" />} />
          <Route path="/gizlilik" element={<InfoPage section="gizlilik" />} />
          <Route path="/kvkk" element={<InfoPage section="kvkk" />} />
          <Route path="/iletisim" element={<InfoPage section="iletisim" />} />
          <Route path="/ara/:query" element={<SearchResults />} />
          <Route path="/facebook" element={<Facebook />} />
          <Route path="/instagram" element={<Instagram />} />
          <Route path="/twitter" element={<Twitter />} />
          <Route path="/post/:slug" element={<PostDetail />} />
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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <AdminPanel />
      <Footer />
    </>
  )
}

export default App

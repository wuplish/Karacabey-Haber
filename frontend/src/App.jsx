import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CategoryPage from './components/CategoryPage'
import PostDetail from './components/PostDetail'
import BreakingNewsBanner from './components/BreakingNewsBanner'
import NotFound from './components/NotFound'
import Instagram from './components/socialmedia/Instagram'
import Twitter from './components/socialmedia/Twitter'
import Facebook from './components/socialmedia/Facebook'
import SearchResults from './components/SearchResults'
function App() {
  return (
    <>
      <BreakingNewsBanner />
      <Header />
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
          <Route path="/magazin" element={<CategoryPage category="Magazin" />} />
          <Route path="/ekonomi" element={<CategoryPage category="Ekonomi" />} />,
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

const Home = () => (
  <section className="home">
    <h2>Son Haberler</h2>
    <p>En güncel gelişmeler burada yer alacak.</p>
  </section>
)

export default App

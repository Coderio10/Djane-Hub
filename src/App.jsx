import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/LandingPage'
import Shop from './pages/ShopPage'
import ProductPage from './pages/ProductPage'

// Temporary placeholder component until we build each page
const ComingSoon = ({ name }) => (
  <div className="min-h-screen flex items-center justify-center bg-orange-50">
    <p className="text-2xl font-semibold text-orange-400">{name} — coming soon</p>
  </div>
)

function App() {

    // useEffect runs AFTER the component renders
  // The empty [] means "run this once, when the app first loads"
  // Perfect for one-time setup like loading fonts
  useEffect(() => {
    const fonts = [
      'Playfair+Display',
      'Dancing+Script',
      'Oswald',
      'Courier+Prime',
      'Pacifico',
      'Raleway',
    ].join('|')

    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`
    document.head.appendChild(link)
  }, [])   // <-- the empty array is the "dependency array"


  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route popath="/product/:id" element={<ProductPage name="Product Page" />} />
      <Route path="/checkout" element={<ComingSoon name="Checkout" />} />
      <Route path="/admin" element={<ComingSoon name="Admin" />} />
    </Routes>
  )
}

export default App

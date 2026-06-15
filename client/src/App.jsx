import { Routes, Route } from 'react-router-dom'
import Home from './pages/LandingPage'
import Shop from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CheckoutPage     from './pages/CheckoutPage'
import OrderConfirmPage from './pages/OrderConfirmPage'

// Temporary placeholder component until we build each page
const ComingSoon = ({ name }) => (
  <div className="min-h-screen flex items-center justify-center bg-orange-50">
    <p className="text-2xl font-semibold text-orange-400">{name} — coming soon</p>
  </div>
)

function App() {
  return (
    <Routes>
      <Route path="/" element={<Shop />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirm" element={<OrderConfirmPage />} />
      <Route path="/admin" element={<ComingSoon name="Admin" />} />
    </Routes>
  )
}

export default App

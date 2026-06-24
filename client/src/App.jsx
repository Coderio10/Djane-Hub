import { Routes, Route } from 'react-router-dom'
import Shop from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CheckoutPage     from './pages/CheckoutPage'
import OrderConfirmPage from './pages/OrderConfirmPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Shop />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirm" element={<OrderConfirmPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

export default App

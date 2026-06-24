// src/pages/OrderConfirmPage.jsx
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { formatNaira } from '../utils/pricingEngine'
import { deliverySummary } from '../utils/deliveryDate'

function OrderConfirmPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()

  if (!state) return <Navigate to="/shop" replace />

  const { orderData, total, delivery } = state

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-orange-100 p-8 text-center space-y-6">

        <div className="text-6xl">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900">Order placed!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Thank you, <span className="font-semibold text-gray-800">
            {orderData.name}
          </span>! Once we confirm your transfer, your order is on its way.
        </p>

        <div className="bg-orange-50 rounded-xl p-4 text-left space-y-2 border border-orange-100">
          <p className="text-sm font-medium text-gray-700">
            📅 {deliverySummary(delivery)}
          </p>
          <p className="text-sm font-medium text-gray-700">
            📍 {delivery.location ?? orderData.address}
          </p>
          <p className="text-sm font-bold text-orange-600">
            Total: {formatNaira(total)}
          </p>
        </div>

        <p className="text-xs text-gray-400">
          A confirmation email is on its way to {orderData.email}
        </p>

        <button
          onClick={() => navigate('/shop')}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          Back to Shop
        </button>
      </div>
    </div>
  )
}

export default OrderConfirmPage

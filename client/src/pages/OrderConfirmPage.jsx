// src/pages/OrderConfirmPage.jsx
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { formatNaira } from '../utils/pricingEngine'
import { deliverySummary } from '../utils/deliveryDate'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function IconCheck() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IconPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

function OrderConfirmPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()

  if (!state) return <Navigate to="/shop" replace />

  const { orderData, total, delivery } = state

  return (
    <div className="confirm-shell">
      <Navbar />

      <main className="confirm-page">

        {/* Success card */}
        <div className="confirm-card">

          {/* Animated checkmark */}
          <div className="confirm-icon">
            <IconCheck />
          </div>

          <h1 className="confirm-title">Order Placed!</h1>
          <p className="confirm-sub">
            Thank you, <strong>{orderData.name}</strong>! Once we confirm your
            transfer, your order is on its way.
          </p>

          {/* Delivery details */}
          <div className="confirm-details">
            <h3>Delivery details</h3>
            <div className="confirm-detail-row">
              <span className="confirm-detail-row__icon"><IconCalendar /></span>
              <span>{deliverySummary(delivery)}</span>
            </div>
            <div className="confirm-detail-row">
              <span className="confirm-detail-row__icon"><IconPin /></span>
              <span>{delivery.location ?? orderData.address ?? 'Your delivery address'}</span>
            </div>
            <div className="confirm-detail-row">
              <span className="confirm-detail-row__icon"><IconMail /></span>
              <span>Confirmation email sent to {orderData.email}</span>
            </div>
          </div>

          {/* Total */}
          <div className="confirm-total">
            <span>Order total</span>
            <span className="confirm-total__amount">{formatNaira(total)}</span>
          </div>

          {/* Actions */}
          <div className="confirm-actions">
            <button className="btn btn--orange" onClick={() => navigate('/shop')}>
              Continue Shopping
            </button>
            <a
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--light"
            >
              WhatsApp Support
            </a>
          </div>

          <p className="confirm-note">
            Questions? WhatsApp Djane at{' '}
            <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer">
              +234 800 000 0000
            </a>
          </p>
        </div>

      </main>

      <Footer />
    </div>
  )
}

export default OrderConfirmPage

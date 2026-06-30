// src/components/OrderSummary.jsx
import { formatNaira } from '../utils/pricingEngine'
import { deliverySummary } from '../utils/deliveryDate'

// Icons
function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IconDelivery() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IconPin() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

function OrderSummary({ lineItems, total, delivery, address }) {
  return (
    <div className="order-summary">
      <h2 className="order-summary__title">Order Summary</h2>

      {/* Product image if available — first line item has product info */}
      {/* Line items */}
      <div className="order-summary__lines">
        {lineItems.map((item, i) => (
          <div key={i} className="order-summary__line">
            <span className="order-summary__line-label">{item.label}</span>
            <span className={`order-summary__line-amount ${item.amount === 0 ? 'is-free' : ''}`}>
              {item.note ?? formatNaira(item.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="order-summary__total">
        <span>Total</span>
        <span className="order-summary__total-amount">{formatNaira(total)}</span>
      </div>

      {/* Delivery info */}
      <div className="order-summary__delivery">
        <p className="order-summary__delivery-label">Delivery details</p>
        <div className="order-summary__delivery-row">
          <IconCalendar />
          <p>{deliverySummary(delivery)}</p>
        </div>
        <div className="order-summary__delivery-row">
          <IconPin />
          <p>{delivery.location ?? (address || 'Your delivery address')}</p>
        </div>
        <div className="order-summary__delivery-row">
          <IconDelivery />
          <p>{delivery.location ? 'Free delivery (within FUTA)' : 'Delivery fee: ₦1,000'}</p>
        </div>
      </div>

      {/* Trust points */}
      <ul className="order-summary__trust">
        {[
          'Payment only after you place your order',
          'Order confirmed once transfer is received',
          'WhatsApp support available anytime',
        ].map(point => (
          <li key={point}>
            <span className="order-summary__trust-icon"><IconCheck /></span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OrderSummary

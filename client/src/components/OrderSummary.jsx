// src/components/OrderSummary.jsx
import { formatNaira } from '../utils/pricingEngine'
import { deliverySummary } from '../utils/deliveryDate'

function OrderSummary({ lineItems, total, delivery, address }) {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-6 space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Order summary</h2>

      {/* Line items */}
      <div className="space-y-3">
        {lineItems.map((item, i) => (
          <div key={i} className="flex justify-between items-start">
            <span className="text-sm text-gray-600 flex-1 pr-4 leading-snug">
              {item.label}
            </span>
            <span className={`text-sm font-semibold flex-shrink-0 ${
              item.amount === 0 ? 'text-green-600' : 'text-gray-800'
            }`}>
              {item.note ?? formatNaira(item.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-900 text-base">Total</span>
          <span className="font-bold text-orange-500 text-xl">
            {formatNaira(total)}
          </span>
        </div>
      </div>

      {/* Delivery info */}
      <div className="bg-orange-50 rounded-xl p-4 space-y-2 border border-orange-100">
        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
          Delivery details
        </p>
        <p className="text-sm font-medium text-gray-800">
          📅 {deliverySummary(delivery)}
        </p>
        <p className="text-sm text-gray-600">
          📍 {delivery.location ?? (address || 'Your delivery address')}
        </p>
      </div>

      {/* Reassurance */}
      <div className="space-y-2">
        {[
          'Payment only after you place your order',
          'Order confirmed once transfer is received',
          'WhatsApp support available anytime',
        ].map((point) => (
          <div key={point} className="flex items-start gap-2">
            <span className="text-green-500 text-xs mt-0.5">✓</span>
            <p className="text-xs text-gray-500">{point}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderSummary

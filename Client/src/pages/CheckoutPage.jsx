// src/pages/CheckoutPage.jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { calculateOrder, formatNaira } from '../utils/pricingEngine'
import { calculateDeliveryDate, deliverySummary } from '../utils/deliveryDate'
import OrderSummary from '../components/OrderSummary'

function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Retrieve the order data passed from ProductPage
  // If someone navigates directly to /checkout, orderData will be undefined
  const orderData = location.state?.orderData

  // ── Customer form state ──
  const [form, setForm] = useState({
    name:        '',
    phone:       '',
    email:       '',
    locationType:'futa',     // 'futa' | 'outside'
    address:     '',         // only required if outside FUTA
    isUrgent:    false,
  })

  // ── UI state ──
  const [errors,      setErrors]      = useState({})
  const [showTransfer,setShowTransfer]= useState(false)
  const [confirmed,   setConfirmed]   = useState(false)

  // Guard: if there's no order, send them to the shop.
  // Keep this after hooks so React sees the same hook order on every render.
  if (!orderData) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold text-gray-700">No order found.</p>
        <button
          onClick={() => navigate('/shop')}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold"
        >
          Go to Shop
        </button>
      </div>
    )
  }

  // ── Derived values — recalculate whenever form changes ──
  // These aren't stored in state — they're computed fresh on every render
  // This is the "derive don't duplicate" principle
  const enrichedOrder = { ...orderData, ...form }
  const { lineItems, total } = calculateOrder(enrichedOrder)
  const delivery = calculateDeliveryDate({
    productType:  orderData.product.id.startsWith('journal') ? 'journal' : 'tshirt',
    isUrgent:     form.isUrgent,
    locationType: form.locationType,
  })

  // ── Form field handler ──
  // One handler for all fields — avoids writing onChange for every input
  function handleField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear the error for this field as soon as the user starts fixing it
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  // ── Validation ──
  function validate() {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = 'Please enter your full name.'
    }

    // Nigerian phone: starts with 07, 08, or 09, followed by 9 digits
    // The regex /^0[789]\d{9}$/ means:
    // ^ = start, 0 = literal 0, [789] = one of 7/8/9,
    // \d{9} = exactly 9 more digits, $ = end
    const phoneClean = form.phone.replace(/\s|-/g, '')  // strip spaces and dashes
    if (!phoneClean || !/^0[789]\d{9}$/.test(phoneClean)) {
      newErrors.phone = 'Please enter a valid Nigerian phone number (e.g. 08012345678).'
    }

    // Basic email check — the HTML email input handles most validation
    // but we add a quick sanity check
    if (!form.email.trim() || !form.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (form.locationType === 'outside' && !form.address.trim()) {
      newErrors.address = 'Please enter your delivery address.'
    }

    setErrors(newErrors)

    // Returns true if there are no errors
    return Object.keys(newErrors).length === 0
  }

  // ── Place order ──
  function handlePlaceOrder() {
    if (!validate()) {
      // Scroll to the first error smoothly
      const firstError = document.querySelector('[data-error]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    // Show bank transfer details
    setShowTransfer(true)
    // Scroll down to reveal them
    setTimeout(() => {
      document.getElementById('transfer-section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  // ── Confirm transfer (final submission) ──
  async function handleConfirmTransfer() {
    setConfirmed(true)
    // In Phase 4, this calls the backend API
    // For now, navigate to the confirmation page with the full order
    navigate('/order-confirm', {
      state: {
        orderData: enrichedOrder,
        lineItems,
        total,
        delivery,
      }
    })
  }

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-orange-500 text-sm font-medium mb-4 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Review your order and enter your details.</p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT: Customer form ── */}
          <div className="space-y-6">

            {/* Personal details */}
            <div className="bg-white rounded-2xl border border-orange-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Your details</h2>

              {/* Full name */}
              <div className="mb-4" data-error={errors.name ? true : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleField('name', e.target.value)}
                  placeholder="e.g. Amina Johnson"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="mb-4" data-error={errors.phone ? true : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleField('phone', e.target.value)}
                  placeholder="e.g. 08012345678"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.phone
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div data-error={errors.email ? true : undefined}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleField('email', e.target.value)}
                  placeholder="e.g. amina@gmail.com"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-100'
                      : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Delivery location */}
            <div className="bg-white rounded-2xl border border-orange-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Delivery location</h2>

              <div className="flex flex-col gap-3 mb-4">
                {[
                  {
                    value:    'futa',
                    label:    '📍 Within FUTA',
                    sublabel: 'Free delivery · SUB Frontage',
                  },
                  {
                    value:    'outside',
                    label:    '🚚 Outside FUTA',
                    sublabel: 'Delivery fee: ₦1,000',
                  },
                ].map(({ value, label, sublabel }) => (
                  <button
                    key={value}
                    onClick={() => handleField('locationType', value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      form.locationType === value
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    {/* Radio circle */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      form.locationType === value
                        ? 'border-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {form.locationType === value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{sublabel}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Address field — only for outside FUTA */}
              {form.locationType === 'outside' && (
                <div data-error={errors.address ? true : undefined}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Delivery address <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => handleField('address', e.target.value)}
                    placeholder="Enter your full delivery address"
                    rows={3}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none transition-colors ${
                      errors.address
                        ? 'border-red-300 focus:ring-red-100'
                        : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.address}</p>
                  )}
                </div>
              )}
            </div>

            {/* Urgent toggle */}
            <div className="bg-white rounded-2xl border border-orange-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Urgent delivery</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Need it faster? An extra ₦1,500 applies.
                    Delivery prioritised by 1 business day.
                  </p>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={() => handleField('isUrgent', !form.isUrgent)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 mt-1 ${
                    form.isUrgent ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                    form.isUrgent ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Place Order button */}
            {!showTransfer && (
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors shadow-sm"
              >
                Place Order →
              </button>
            )}

            {/* ── Transfer reveal ── */}
            {showTransfer && (
              <div
                id="transfer-section"
                className="bg-white rounded-2xl border-2 border-orange-300 p-6 space-y-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏦</span>
                  <h2 className="text-lg font-bold text-gray-900">
                    Complete your payment
                  </h2>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Transfer <span className="font-bold text-orange-600 text-base">
                    {formatNaira(total)}
                  </span> to the account below.
                  Use your <span className="font-semibold">phone number</span> as
                  the transfer reference.
                </p>

                {/* Bank details */}
                <div className="bg-orange-50 rounded-xl p-4 space-y-2">
                  {[
                    { label: 'Bank',           value: 'First Bank Nigeria' },
                    { label: 'Account Number', value: '0123456789' },
                    { label: 'Account Name',   value: "Djane's Hub" },
                    { label: 'Amount',         value: formatNaira(total) },
                    { label: 'Reference',      value: form.phone || 'Your phone number' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleConfirmTransfer}
                  disabled={confirmed}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-base transition-colors"
                >
                  {confirmed ? 'Processing...' : "✅ I've made the transfer"}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Your order will be confirmed once payment is received.
                </p>
              </div>
            )}

          </div>

          {/* ── RIGHT: Order Summary (sticky) ── */}
          <div className="lg:sticky lg:top-8">
            <OrderSummary
              lineItems={lineItems}
              total={total}
              delivery={delivery}
              locationType={form.locationType}
              address={form.address}
            />
          </div>

        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

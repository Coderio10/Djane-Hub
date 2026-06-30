// src/pages/CheckoutPage.jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { calculateOrder, formatNaira } from '../utils/pricingEngine'
import { calculateDeliveryDate } from '../utils/deliveryDate'
import OrderSummary from '../components/OrderSummary'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ── Icons ──
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function IconMapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
function IconZap() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}
function IconBank() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
      <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
      <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

// Step indicator
function StepBar({ step }) {
  const steps = ['Your details', 'Delivery', 'Payment']
  return (
    <div className="checkout-steps" aria-label="Checkout progress">
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < step
        const active = num === step
        return (
          <div key={label} className={`checkout-step ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}>
            <div className="checkout-step__circle">
              {done ? <IconCheck /> : <span>{num}</span>}
            </div>
            <span className="checkout-step__label">{label}</span>
            {i < steps.length - 1 && <div className="checkout-step__line" aria-hidden="true" />}
          </div>
        )
      })}
    </div>
  )
}

// Field wrapper
function Field({ label, required, error, children }) {
  return (
    <div className={`checkout-field ${error ? 'has-error' : ''}`} data-error={error ? true : undefined}>
      <label className="checkout-field__label">
        {label}
        {required && <span className="checkout-field__req" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p className="checkout-field__error" role="alert">{error}</p>}
    </div>
  )
}

function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const orderData = location.state?.orderData

  const [form, setForm] = useState({
    name:         '',
    phone:        '',
    email:        '',
    locationType: 'futa',
    address:      '',
    isUrgent:     false,
  })
  const [errors,       setErrors]       = useState({})
  const [showTransfer, setShowTransfer] = useState(false)
  const [confirmed,    setConfirmed]    = useState(false)

  if (!orderData) {
    return (
      <div className="checkout-shell">
        <Navbar />
        <div className="checkout-empty">
          <span className="checkout-empty__icon">🛒</span>
          <h2>No order found</h2>
          <p>Head to the shop to pick something out first.</p>
          <button className="btn btn--orange" onClick={() => navigate('/shop')}>
            Go to Shop
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const enrichedOrder = { ...orderData, ...form }
  const { lineItems, total } = calculateOrder(enrichedOrder)
  const delivery = calculateDeliveryDate({
    productType:  orderData.product.id.startsWith('journal') ? 'journal' : 'tshirt',
    isUrgent:     form.isUrgent,
    locationType: form.locationType,
  })

  const step = showTransfer ? 3 : form.name || form.phone || form.email ? 2 : 1

  function handleField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())  e.name = 'Please enter your full name.'
    const phoneClean = form.phone.replace(/\s|-/g, '')
    if (!phoneClean || !/^0[789]\d{9}$/.test(phoneClean))
      e.phone = 'Please enter a valid Nigerian phone number (e.g. 08012345678).'
    if (!form.email.trim() || !form.email.includes('@'))
      e.email = 'Please enter a valid email address.'
    if (form.locationType === 'outside' && !form.address.trim())
      e.address = 'Please enter your delivery address.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handlePlaceOrder() {
    if (!validate()) {
      document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setShowTransfer(true)
    setTimeout(() => {
      document.getElementById('transfer-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  async function handleConfirmTransfer() {
    setConfirmed(true)
    try {
      const payload = {
        customerName:     form.name,
        customerPhone:    form.phone,
        customerEmail:    form.email,
        productType:      orderData.product.id.startsWith('journal') ? 'journal' : 'tshirt',
        productId:        orderData.product.id,
        productName:      orderData.product.name,
        productColor:     orderData.selectedColor,
        size:             orderData.selectedSize ?? null,
        withPen:          orderData.withPen,
        isCustomized:     orderData.isCustomized,
        customType:       orderData.customType,
        customText:       orderData.customText,
        customFont:       orderData.selectedFont,
        logoUrl:          null,
        quantity:         orderData.quantity,
        locationType:     form.locationType,
        deliveryAddress:  form.address,
        isUrgent:         form.isUrgent,
        lineItems,
        total,
        deliveryDate:     delivery.dateString,
        deliveryTime:     delivery.timeSlot,
        deliveryLocation: delivery.location,
      }
      const result = await api.createOrder(payload)
      navigate('/order-confirm', {
        state: { orderData: { ...enrichedOrder }, lineItems, total, delivery, orderId: result.orderId }
      })
    } catch (err) {
      alert(`Something went wrong: ${err.message}. Please try again.`)
      setConfirmed(false)
    }
  }

  return (
    <div className="checkout-shell">
      <Navbar />

      <div className="checkout-page">
        {/* Breadcrumb */}
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
          <button onClick={() => navigate('/')}>Home</button>
          <IconChevronRight />
          <button onClick={() => navigate('/shop')}>Shop</button>
          <IconChevronRight />
          <span>Checkout</span>
        </nav>

        <h1 className="checkout-title">Checkout</h1>

        <StepBar step={step} />

        <div className="checkout-layout">

          {/* ── LEFT: Form ── */}
          <div className="checkout-form-col">

            {/* Personal details card */}
            <div className="checkout-card">
              <div className="checkout-card__head">
                <span className="checkout-card__icon"><IconUser /></span>
                <h2>Your details</h2>
              </div>

              <Field label="Full name" required error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleField('name', e.target.value)}
                  placeholder="e.g. Amina Johnson"
                  className={errors.name ? 'has-error' : ''}
                  autoComplete="name"
                />
              </Field>

              <Field label="Phone number" required error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => handleField('phone', e.target.value)}
                  placeholder="e.g. 08012345678"
                  className={errors.phone ? 'has-error' : ''}
                  autoComplete="tel"
                />
              </Field>

              <Field label="Email address" required error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleField('email', e.target.value)}
                  placeholder="e.g. amina@gmail.com"
                  className={errors.email ? 'has-error' : ''}
                  autoComplete="email"
                />
              </Field>
            </div>

            {/* Delivery card */}
            <div className="checkout-card">
              <div className="checkout-card__head">
                <span className="checkout-card__icon"><IconMapPin /></span>
                <h2>Delivery location</h2>
              </div>

              <div className="checkout-location-options">
                {[
                  { value: 'futa',    label: 'Within FUTA',  sub: 'Free delivery · SUB Frontage',  icon: '📍' },
                  { value: 'outside', label: 'Outside FUTA', sub: 'Delivery fee: ₦1,000',           icon: '🚚' },
                ].map(({ value, label, sub, icon }) => (
                  <button
                    key={value}
                    className={`checkout-location-btn ${form.locationType === value ? 'is-selected' : ''}`}
                    onClick={() => handleField('locationType', value)}
                    aria-pressed={form.locationType === value}
                  >
                    <span className="checkout-location-btn__radio" aria-hidden="true">
                      {form.locationType === value && <span />}
                    </span>
                    <span className="checkout-location-btn__icon">{icon}</span>
                    <div>
                      <p className="checkout-location-btn__label">{label}</p>
                      <p className="checkout-location-btn__sub">{sub}</p>
                    </div>
                    {form.locationType === value && (
                      <span className="checkout-location-btn__check">
                        <IconCheck />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {form.locationType === 'outside' && (
                <Field label="Delivery address" required error={errors.address}>
                  <textarea
                    value={form.address}
                    onChange={e => handleField('address', e.target.value)}
                    placeholder="Enter your full delivery address"
                    rows={3}
                    className={errors.address ? 'has-error' : ''}
                  />
                </Field>
              )}
            </div>

            {/* Urgent toggle card */}
            <div className="checkout-card checkout-card--urgent">
              <div className="checkout-card__head">
                <span className="checkout-card__icon"><IconZap /></span>
                <h2>Urgent delivery</h2>
                <button
                  className={`checkout-toggle ${form.isUrgent ? 'is-on' : ''}`}
                  onClick={() => handleField('isUrgent', !form.isUrgent)}
                  aria-pressed={form.isUrgent}
                  aria-label={`Urgent delivery ${form.isUrgent ? 'enabled' : 'disabled'}`}
                >
                  <span />
                </button>
              </div>
              <p className="checkout-card__sub">
                Need it faster? An extra ₦1,500 applies. Delivery prioritised by 1 business day.
              </p>
              {form.isUrgent && (
                <p className="checkout-urgent-note">
                  ⚡ Urgent processing is active — your order will be prioritised.
                </p>
              )}
            </div>

            {/* Place order CTA */}
            {!showTransfer && (
              <button className="btn btn--orange checkout-cta" onClick={handlePlaceOrder}>
                Place Order
                <IconChevronRight />
              </button>
            )}

            {/* Transfer section */}
            {showTransfer && (
              <div id="transfer-section" className="checkout-transfer">
                <div className="checkout-transfer__head">
                  <span className="checkout-transfer__icon"><IconBank /></span>
                  <div>
                    <h2>Complete your payment</h2>
                    <p>Transfer to the account below, then confirm below.</p>
                  </div>
                </div>

                <p className="checkout-transfer__amount">
                  Transfer <strong>{formatNaira(total)}</strong> — use your{' '}
                  <strong>phone number</strong> as reference.
                </p>

                <div className="checkout-bank-details">
                  {[
                    { label: 'Bank',           value: 'First Bank Nigeria' },
                    { label: 'Account Number', value: '0123456789' },
                    { label: 'Account Name',   value: "Djane's Hub" },
                    { label: 'Amount',         value: formatNaira(total) },
                    { label: 'Reference',      value: form.phone || 'Your phone number' },
                  ].map(({ label, value }) => (
                    <div key={label} className="checkout-bank-row">
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                <button
                  className="btn checkout-confirm-btn"
                  onClick={handleConfirmTransfer}
                  disabled={confirmed}
                >
                  {confirmed
                    ? 'Processing your order…'
                    : <><IconCheck /> I've made the transfer</>
                  }
                </button>

                <p className="checkout-transfer__note">
                  Your order is confirmed once payment is received.
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Order summary (sticky) ── */}
          <div className="checkout-summary-col">
            {/* Product preview */}
            <div className="checkout-product-preview">
              <img
                src={orderData.product.image}
                alt={orderData.product.name}
                className="checkout-product-preview__img"
                onError={e => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544816565-c7dd5cc1e3da?auto=format&fit=crop&w=300&q=70'
                }}
              />
              <div>
                <p className="checkout-product-preview__name">{orderData.product.name}</p>
                <p className="checkout-product-preview__meta">
                  Qty: {orderData.quantity}
                  {orderData.selectedSize ? ` · Size: ${orderData.selectedSize}` : ''}
                </p>
              </div>
            </div>

            <OrderSummary
              lineItems={lineItems}
              total={total}
              delivery={delivery}
              address={form.address}
            />
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}

export default CheckoutPage

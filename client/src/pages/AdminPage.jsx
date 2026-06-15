// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react'
import { api } from '../utils/api'

// ── Section identifiers for tab navigation ──
const TABS = {
  ORDERS:   'orders',
  SLOT:     'slot',
  BROADCAST:'broadcast',
}

// ─────────────────────────────────────────────
// Password Gate
// ─────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(false)
  const [shake,    setShake]    = useState(false)

  function handleSubmit(e) {
    e.preventDefault()

    // import.meta.env reads Vite environment variables
    const correct = import.meta.env.VITE_ADMIN_PASSWORD

    if (password === correct) {
      // Store in sessionStorage — stays unlocked for this browser tab session
      // Closes automatically when the tab closes
      sessionStorage.setItem('admin_unlocked', 'true')
      onUnlock()
    } else {
      setError(true)
      setShake(true)
      setPassword('')
      // Remove shake class after animation completes
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className={`bg-white rounded-2xl border border-orange-100 p-8 w-full max-w-sm shadow-sm ${shake ? 'animate-bounce' : ''}`}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-1">Djane's Hub — Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false) }}
              placeholder="Enter admin password"
              autoFocus
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
                error
                  ? 'border-red-300 focus:ring-red-100'
                  : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
              }`}
            />
            {error && (
              <p className="text-xs text-red-500 mt-1.5">
                Incorrect password. Try again.
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Orders Table
// ─────────────────────────────────────────────
function OrdersPanel() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [expanded,setExpanded]= useState(null)  // which order row is open

  // Load orders when the panel mounts
  useEffect(() => {
    async function load() {
      try {
        const data = await api.getOrders()
        setOrders(data.orders)
      } catch (err) {
        setError(err.message)
      } finally {
        // finally always runs — perfect for turning off loading states
        setLoading(false)
      }
    }
    load()
  }, [])

  // Update a single order's status in the DB and reflect it locally
  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.updateStatus(orderId, newStatus)

      // Update local state so UI reflects the change immediately
      // without needing a full re-fetch — this is "optimistic update"
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
      )
    } catch (err) {
      alert(`Failed to update status: ${err.message}`)
    }
  }

  const formatNaira = (n) => `₦${n?.toLocaleString('en-NG') ?? 0}`

  const statusColors = {
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 text-sm">Loading orders...</div>
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
      Failed to load orders: {error}
    </div>
  )

  if (orders.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-4xl mb-3">📭</p>
      <p className="font-medium">No orders yet</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">All Orders</h2>
        <span className="text-sm text-gray-500">{orders.length} total</span>
      </div>

      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl border border-orange-100 overflow-hidden"
        >
          {/* Summary row — always visible */}
          <div
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-orange-50 transition-colors"
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
          >
            {/* Status badge */}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColors[order.status]}`}>
              {order.status}
            </span>

            {/* Customer + product */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {order.customer_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {order.product_name} · {order.delivery_date}
              </p>
            </div>

            {/* Total */}
            <span className="text-sm font-bold text-orange-500 flex-shrink-0">
              {formatNaira(order.total_amount)}
            </span>

            {/* Chevron */}
            <span className={`text-gray-400 text-sm transition-transform ${expanded === order.id ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>

          {/* Expanded details */}
          {expanded === order.id && (
            <div className="border-t border-orange-50 p-4 bg-orange-50/30 space-y-4">

              {/* Customer details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Phone',    order.customer_phone],
                  ['Email',    order.customer_email],
                  ['Location', order.location_type === 'futa'
                    ? 'Within FUTA'
                    : `Outside — ${order.delivery_address}`],
                  ['Urgent',   order.is_urgent ? '⚡ Yes' : 'No'],
                  ['Pen',      order.with_pen ? 'Yes' : 'No'],
                  ['Custom',   order.is_customized
                    ? `${order.custom_type}${order.custom_text ? `: "${order.custom_text}"` : ''}`
                    : 'No'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-700">{value}</p>
                  </div>
                ))}
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <p className="text-xs text-orange-600 font-semibold mb-1">Delivery</p>
                <p className="text-sm text-gray-700">
                  {order.delivery_date} · {order.delivery_time}
                </p>
              </div>

              {/* Status updater */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Update status</p>
                <div className="flex gap-2">
                  {['pending', 'confirmed', 'delivered'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(order.id, status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        order.status === status
                          ? `${statusColors[status]} border-transparent`
                          : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order ID */}
              <p className="text-xs text-gray-300 font-mono truncate">
                ID: {order.id}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Delivery Slot Setter
// ─────────────────────────────────────────────
function SlotPanel() {
  const [weekStart, setWeekStart] = useState('')
  const [timeSlot,  setTimeSlot]  = useState('12:00 PM – 3:00 PM')
  const [notes,     setNotes]     = useState('')
  const [current,   setCurrent]   = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)

  // Load the current slot on mount
  useEffect(() => {
    api.getDeliverySlot()
      .then((data) => setCurrent(data.slot))
      .catch(() => {})  // silently ignore — no slot is fine
  }, [])

  async function handleSave() {
    if (!weekStart || !timeSlot) return

    setSaving(true)
    try {
      const result = await api.setDeliverySlot({
        weekStartDate: weekStart,
        timeSlot,
        notes,
      })
      setCurrent(result.slot)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const PRESET_SLOTS = [
    '10:00 AM – 1:00 PM',
    '12:00 PM – 3:00 PM',
    '2:00 PM – 5:00 PM',
    '4:00 PM – 7:00 PM',
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Weekly Delivery Slot</h2>

      {/* Current slot */}
      {current && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-orange-600 mb-1">Current slot</p>
          <p className="text-sm font-medium text-gray-800">
            Week of {current.week_start_date} · {current.time_slot}
          </p>
          {current.notes && (
            <p className="text-xs text-gray-500 mt-1">{current.notes}</p>
          )}
        </div>
      )}

      {/* Set new slot */}
      <div className="bg-white rounded-xl border border-orange-100 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Week starting
          </label>
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery time slot
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {PRESET_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => setTimeSlot(slot)}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  timeSlot === slot
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-600 hover:border-orange-200'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            placeholder="Or type a custom slot..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Campus gate closed — use side entrance"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !weekStart || !timeSlot}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Delivery Slot'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Broadcast Email
// ─────────────────────────────────────────────
function BroadcastPanel() {
  const [subject,  setSubject]  = useState('')
  const [body,     setBody]     = useState('')
  const [sending,  setSending]  = useState(false)
  const [result,   setResult]   = useState(null)

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return

    const confirmed = window.confirm(
      `Send this email to all your leads?\n\nSubject: ${subject}`
    )
    if (!confirmed) return

    setSending(true)
    setResult(null)

    try {
      const data = await api.sendBroadcast(subject, body)
      setResult({ success: true, message: data.message })
      setSubject('')
      setBody('')
    } catch (err) {
      setResult({ success: false, message: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Send Email to All Leads</h2>
        <p className="text-sm text-gray-500 mt-1">
          This sends to every customer who has ever placed an order.
        </p>
      </div>

      {result && (
        <div className={`rounded-xl p-4 text-sm font-medium ${
          result.success
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {result.success ? '✅' : '❌'} {result.message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-orange-100 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Subject line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New journal designs just dropped! 📓"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder={`Hi there!\n\nWe've just dropped some exciting new designs...\n\nShop now at djaneshub.com\n\nWarm regards,\nDjane 🧡`}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none font-sans"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          {sending ? 'Sending...' : '📨 Send to All Leads'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main AdminPage component
// ─────────────────────────────────────────────
function AdminPage() {
  // Check if already unlocked this session
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem('admin_unlocked') === 'true'
  )
  const [activeTab, setActiveTab] = useState(TABS.ORDERS)

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  const tabs = [
    { id: TABS.ORDERS,    label: '📋 Orders' },
    { id: TABS.SLOT,      label: '📅 Delivery Slot' },
    { id: TABS.BROADCAST, label: '📨 Email Leads' },
  ]

  return (
    <div className="min-h-screen bg-orange-50">

      {/* Top bar */}
      <div className="bg-white border-b border-orange-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Djane's Hub Admin</h1>
          <p className="text-xs text-gray-400 mt-0.5">Business dashboard</p>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('admin_unlocked')
            setUnlocked(false)
          }}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Lock
        </button>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-orange-100 px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {activeTab === TABS.ORDERS    && <OrdersPanel />}
        {activeTab === TABS.SLOT      && <SlotPanel />}
        {activeTab === TABS.BROADCAST && <BroadcastPanel />}
      </div>

    </div>
  )
}

export default AdminPage
// src/utils/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, options)
  const data     = await response.json()

  if (!response.ok) {
    const message = data.errors?.join(', ') || data.error || 'Request failed'
    throw new Error(message)
  }

  return data
}

export const api = {
  createOrder:     (orderData)      => request('POST',  '/api/orders',             orderData),
  getOrders:       ()               => request('GET',   '/api/orders'),
  updateStatus:    (id, status)     => request('PATCH', `/api/orders/${id}`,        { status }),
  getDeliverySlot: ()               => request('GET',   '/api/admin/delivery-slot'),
  setDeliverySlot: (slot)           => request('POST',  '/api/admin/delivery-slot', slot),
  sendBroadcast:   (subject, body)  => request('POST',  '/api/admin/broadcast',     { subject, body }),
}
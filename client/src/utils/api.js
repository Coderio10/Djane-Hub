// client/src/utils/api.js

// The base URL of your backend
// In development this is localhost:3001
// In production it will be your Railway URL — set via environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * A thin wrapper around fetch that:
 * - Always sends/receives JSON
 * - Throws on non-2xx responses with the server's error message
 * - Works for GET and POST
 */
async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, options)

  // Parse the JSON response regardless of status code
  // (error responses also have JSON bodies)
  const data = await response.json()

  // If the status code is not 2xx, throw with the server's error message
  if (!response.ok) {
    const message = data.errors?.join(', ') || data.error || 'Request failed'
    throw new Error(message)
  }

  return data
}

// Clean public API — these are what your components call
export const api = {
  createOrder:   (orderData) => request('POST', '/api/orders', orderData),
  getOrders:     ()          => request('GET',  '/api/orders'),
  updateStatus:  (id, status)=> request('PATCH',`/api/orders/${id}`, { status }),
}
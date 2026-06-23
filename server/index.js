// server/index.js

// dotenv MUST be the very first thing — it loads your .env file
// before any other code runs and tries to read environment variables
import 'dotenv/config'

import express from 'express'
import cors    from 'cors'

// ordersRouter is defined in routes/orders.js
import ordersRouter from './routes/orders.js'
import adminRouter  from './routes/admin.js'

// Delivery reminder background job
import { startDeliveryReminderJob } from './services/scheduler.js'

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──
// CORS: tells the browser "yes, requests from localhost:5173 are allowed"
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}))

// express.json() parses the request body from raw text into a JS object
app.use(express.json())

// ── Routes ──
app.use('/api/orders', ordersRouter)
app.use('/api/admin',  adminRouter)

// ── Health check ──
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: "Djane's Hub server is running 🚀" })
})

// ── Global error handler ──
app.use((err, _req, res, _next) => {
  console.error('Server error:', err.message)
  res.status(500).json({
    error: 'Something went wrong on our end. Please try again.'
  })
})

// ── Start the server ──
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  startDeliveryReminderJob()
})

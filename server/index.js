// server/index.js

// dotenv MUST be the very first thing — it loads your .env file
// before any other code runs and tries to read environment variables
require('dotenv').config()

const express = require('express')
const cors    = require('cors')

// ordersRouter is defined in routes/orders.js — we'll build it next
const ordersRouter = require('./routes/orders')
const adminRouter  = require('./routes/admin')

const app  = express()
const PORT = process.env.PORT || 3001

// Add at the top
const { startDeliveryReminderJob } = require('./services/scheduler')

// ── Middleware ──
// Middleware is a function that runs on EVERY request before your routes
// Think of it as a pipeline — request goes through each middleware in order

// CORS: tells the browser "yes, requests from localhost:5173 are allowed"
// Without this, your React app gets blocked with a CORS error
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}))

// express.json() parses the request body from raw text into a JS object
// Without this, req.body is undefined — you can't read what the frontend sent
app.use(express.json())

// ── Routes ──
// All routes starting with /api/orders go to ordersRouter
// All routes starting with /api/admin go to adminRouter
app.use('/api/orders', ordersRouter)
app.use('/api/admin',  adminRouter)

// ── Health check ──
// A simple route to confirm the server is running
// Visit http://localhost:3001/health in your browser to test
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: "Djane's Hub server is running 🚀" })
})

// ── Global error handler ──
// Express calls this when any route throws an error
// The 4 parameters (err, req, res, next) tell Express this is an error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(500).json({
    error: 'Something went wrong on our end. Please try again.'
  })
})

// ── Start the server ──
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)

  // Start background jobs after server is listening
  startDeliveryReminderJob()
})
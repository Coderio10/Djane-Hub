// server/routes/admin.js — full version
const express  = require('express')
const supabase = require('../services/supabase')
const { sendBroadcast } = require('../services/resend')

const router = express.Router()
// GET /api/admin/delivery-slot
// Returns the current week's delivery slot
router.get('/delivery-slot', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('delivery_slots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)     // most recent slot only
      .single()

    if (error && error.code !== 'PGRST116') throw error
    // PGRST116 = "no rows found" — not a real error, just no slot set yet

    res.json({ slot: data ?? null })

  } catch (err) { next(err) }
})

// POST /api/admin/delivery-slot
// Admin sets the delivery time slot for the week
router.post('/delivery-slot', async (req, res, next) => {
  try {
    const { weekStartDate, timeSlot, notes } = req.body

    if (!weekStartDate || !timeSlot) {
      return res.status(400).json({
        error: 'weekStartDate and timeSlot are required'
      })
    }

    const { data, error } = await supabase
      .from('delivery_slots')
      .insert([{
        week_start_date: weekStartDate,
        time_slot:       timeSlot,
        notes:           notes ?? null,
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ success: true, slot: data })

  } catch (err) { next(err) }
})

// POST /api/admin/broadcast
// Sends a marketing email to all unique customer emails
router.post('/broadcast', async (req, res, next) => {
  try {
    const { subject, body } = req.body

    if (!subject?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Subject and body are required' })
    }

    // Get all unique customer emails from the orders table
    const { data, error } = await supabase
      .from('orders')
      .select('customer_email')

    if (error) throw error

    // Deduplicate emails using a Set
    const uniqueEmails = [...new Set(data.map((o) => o.customer_email))]

    if (uniqueEmails.length === 0) {
      return res.json({ success: true, message: 'No leads found', sent: 0 })
    }

    const result = await sendBroadcast({ emails: uniqueEmails, subject, body })

    res.json({
      success: true,
      ...result,
      message: `Sent to ${result.succeeded} of ${result.total} leads`
    })

  } catch (err) { next(err) }
})

module.exports = router

// server/routes/admin.js — add these imports and routes
const supabase = require('../services/supabase')
const {
  sendOrderConfirmation,
  sendAdminAlert,
  sendDeliveryReminder,
} = require('../services/resend')

// Test route — sends a sample confirmation email
// Remove this before going to production
router.post('/test-email', async (req, res, next) => {
  try {
    // Build a fake order object that matches what the DB returns
    const fakeOrder = {
      id:               'test-order-123',
      customer_name:    req.body.name  || 'Test Customer',
      customer_email:   req.body.email || 'test@example.com',
      customer_phone:   '08012345678',
      product_name:     'Classic Journal',
      product_color:    'Midnight Black',
      with_pen:         true,
      is_customized:    true,
      custom_type:      'text',
      custom_text:      "Sarah's Journal 2025",
      custom_font:      'Playfair Display',
      quantity:         1,
      location_type:    'futa',
      delivery_address: null,
      is_urgent:        false,
      delivery_fee:     0,
      urgent_fee:       0,
      total_amount:     5000,
      delivery_date:    'Tuesday, 15 July 2025',
      delivery_time:    '12:00 PM – 3:00 PM',
      status:           'confirmed',
    }

    const type = req.body.type || 'confirmation'

    if (type === 'confirmation') await sendOrderConfirmation(fakeOrder)
    if (type === 'admin')        await sendAdminAlert(fakeOrder)
    if (type === 'reminder')     await sendDeliveryReminder(fakeOrder)

    res.json({ success: true, message: `${type} email sent` })

  } catch (err) {
    next(err)
  }
})
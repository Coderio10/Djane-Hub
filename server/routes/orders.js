// server/routes/orders.js
const express  = require('express')
const supabase = require('../services/supabase')

// Add at the top of orders.js
const {
  sendOrderConfirmation,
  sendAdminAlert,
} = require('../services/resend')

// Inside router.post('/') — after the Supabase insert succeeds:

    if (error) throw error

    // ── Send emails in parallel ──
    // We use Promise.allSettled so one email failing doesn't
    // block the order confirmation response
    // The customer and admin emails go out simultaneously
    const emailResults = await Promise.allSettled([
      sendOrderConfirmation(data),
      sendAdminAlert(data),
    ])

    // Log any email failures but don't fail the request
    emailResults.forEach((result, i) => {
      if (result.status === 'rejected') {
        const which = i === 0 ? 'confirmation' : 'admin alert'
        console.error(`Failed to send ${which} email:`, result.reason)
      }
    })

    res.status(201).json({
      success: true,
      orderId: data.id,
      message: 'Order placed successfully',
    })


// express.Router() creates a mini-app for just these routes
// It's mounted at /api/orders in index.js
// So a route defined as router.post('/') handles POST /api/orders
const router = express.Router()

// ─────────────────────────────────────────────
// POST /api/orders
// Creates a new order in the database
// Called by the frontend when user confirms transfer
// ─────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    // req.body contains what the frontend sent as JSON
    // We destructure exactly what we expect — never blindly trust input
    const {
      customerName,
      customerPhone,
      customerEmail,
      productType,
      productId,
      productName,
      productColor,
      size,
      withPen,
      isCustomized,
      customType,
      customText,
      customFont,
      logoUrl,
      quantity,
      locationType,
      deliveryAddress,
      isUrgent,
      lineItems,
      total,
      deliveryDate,
      deliveryTime,
      deliveryLocation,
    } = req.body

    // ── Server-side validation ──
    // Never trust the frontend alone — always validate on the server too
    // A user could bypass your React validation and send raw requests
    const errors = []

    if (!customerName?.trim())  errors.push('Customer name is required')
    if (!customerPhone?.trim()) errors.push('Customer phone is required')
    if (!customerEmail?.trim()) errors.push('Customer email is required')
    if (!productType)           errors.push('Product type is required')
    if (!total || total <= 0)   errors.push('Invalid order total')

    // If any validation fails, return 400 (Bad Request) with the errors
    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    // ── Extract individual fees from lineItems ──
    // lineItems is the array from pricingEngine — we parse it here
    // to store each fee component separately in the DB
    function getFee(label) {
      const item = lineItems?.find((i) =>
        i.label.toLowerCase().includes(label.toLowerCase())
      )
      return item?.amount ?? 0
    }

    // ── Insert into Supabase ──
    // .from('orders') selects the orders table
    // .insert([{}]) inserts one row
    // .select() returns the inserted row
    // .single() unwraps the array to a single object
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name:     customerName.trim(),
        customer_phone:    customerPhone.trim(),
        customer_email:    customerEmail.trim().toLowerCase(),
        product_type:      productType,
        product_id:        productId,
        product_name:      productName,
        product_color:     productColor ?? null,
        size:              size ?? null,
        with_pen:          withPen ?? false,
        is_customized:     isCustomized ?? false,
        custom_type:       customType ?? null,
        custom_text:       customText ?? null,
        custom_font:       customFont ?? null,
        logo_url:          logoUrl ?? null,
        quantity:          quantity ?? 1,
        location_type:     locationType,
        delivery_address:  deliveryAddress ?? null,
        is_urgent:         isUrgent ?? false,
        base_amount:       getFee(productName),
        pen_fee:           getFee('pen'),
        custom_fee:        getFee('printing'),
        design_fee:        getFee('design'),
        delivery_fee:      getFee('delivery'),
        urgent_fee:        getFee('urgent'),
        total_amount:      total,
        delivery_date:     deliveryDate,
        delivery_time:     deliveryTime,
        delivery_location: deliveryLocation ?? null,
        status:            'pending',
      }])
      .select()
      .single()

    // Supabase returns an error object if something goes wrong
    // We throw it so the catch block handles it
    if (error) throw error

    // ── Success ──
    // 201 = "Created" — the standard HTTP status for a new resource
    res.status(201).json({
      success: true,
      orderId: data.id,
      message: 'Order placed successfully',
    })

  } catch (err) {
    // Pass the error to Express's error handler in index.js
    next(err)
  }
})

// ─────────────────────────────────────────────
// GET /api/orders
// Returns all orders — used by the admin panel
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      // Most recent orders first
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ orders: data })

  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────────
// PATCH /api/orders/:id
// Updates an order's status — used by admin panel
// :id is a URL parameter — e.g. PATCH /api/orders/abc-123
// ─────────────────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const { id }     = req.params   // from the URL
    const { status } = req.body     // from the request body

    // Validate the status value
    const validStatuses = ['pending', 'confirmed', 'delivered']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      // .eq() is "WHERE id = ?" — filters to the specific row
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 404 if no row was found with that id
    if (!data) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ success: true, order: data })

  } catch (err) {
    next(err)
  }
})

module.exports = router
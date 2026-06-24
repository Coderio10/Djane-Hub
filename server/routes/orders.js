// server/routes/orders.js
import express from 'express'
import supabase from '../services/supabase.js'
import { sendOrderConfirmation, sendAdminAlert } from '../services/resend.js'
import { requireAdmin } from '../middleware/adminAuth.js'

const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    const {
      customerName, customerPhone, customerEmail,
      productType, productId, productName, productColor, size,
      withPen, isCustomized, customType, customText, customFont, logoUrl,
      quantity, locationType, deliveryAddress, isUrgent,
      lineItems, total, deliveryDate, deliveryTime, deliveryLocation,
    } = req.body

    const errors = []
    if (!customerName?.trim())  errors.push('Customer name is required')
    if (!customerPhone?.trim()) errors.push('Customer phone is required')
    if (!customerEmail?.trim()) errors.push('Customer email is required')
    if (!productType)           errors.push('Product type is required')
    if (!total || total <= 0)   errors.push('Invalid order total')

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    function getFee(label) {
      const item = lineItems?.find((i) => i.label.toLowerCase().includes(label.toLowerCase()))
      return item?.amount ?? 0
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        product_type: productType,
        product_id: productId,
        product_name: productName,
        product_color: productColor ?? null,
        size: size ?? null,
        with_pen: withPen ?? false,
        is_customized: isCustomized ?? false,
        custom_type: customType ?? null,
        custom_text: customText ?? null,
        custom_font: customFont ?? null,
        logo_url: logoUrl ?? null,
        quantity: quantity ?? 1,
        location_type: locationType,
        delivery_address: deliveryAddress ?? null,
        is_urgent: isUrgent ?? false,
        base_amount: getFee(productName),
        pen_fee: getFee('pen'),
        custom_fee: getFee('printing'),
        design_fee: getFee('design'),
        delivery_fee: getFee('delivery'),
        urgent_fee: getFee('urgent'),
        total_amount: total,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        delivery_location: deliveryLocation ?? null,
        status: 'pending',
      }])
      .select()
      .single()

    if (error) throw error

    const emailResults = await Promise.allSettled([
      sendOrderConfirmation(data),
      sendAdminAlert(data),
    ])

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

  } catch (err) {
    next(err)
  }
})

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json({ orders: data })

  } catch (err) {
    next(err)
  }
})

router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'confirmed', 'delivered']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Order not found' })

    res.json({ success: true, order: data })

  } catch (err) {
    next(err)
  }
})

export default router

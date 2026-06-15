// src/utils/pricingEngine.js

// ── All prices in Naira ──
// Keeping them in one object means you change a price in ONE place
// and it updates everywhere in the app automatically
export const PRICES = {
  journal:        3500,
  tshirt:         5000,
  pen:             500,
  customization:  1000,
  whatsappDesign: 6000,
  deliveryOutside:1000,
  urgentOrder:    1500,
}

/**
 * Takes the full order object from JournalCustomizer / ProductPage
 * Returns an array of line items and the final total.
 *
 * A "line item" is one row in the order summary:
 * { label: "Classic Journal × 2", amount: 7000 }
 */
export function calculateOrder(orderData) {
  const {
    product,
    quantity      = 1,
    withPen       = false,
    isCustomized  = false,
    customType    = null,
    locationType  = 'futa',   // 'futa' | 'outside'
    isUrgent      = false,
  } = orderData

  const lineItems = []

  // ── Base product price ──
  const baseTotal = product.basePrice * quantity
  lineItems.push({
    label:  `${product.name} × ${quantity}`,
    amount: baseTotal,
  })

  // ── Pen add-on ──
  if (withPen) {
    lineItems.push({
      label:  `Matching pen × ${quantity}`,
      amount: PRICES.pen * quantity,
    })
  }

  // ── Customization fee ──
  if (isCustomized && customType === 'text') {
    lineItems.push({
      label:  'Text printing (customization)',
      amount: PRICES.customization * quantity,
    })
  }

  if (isCustomized && customType === 'logo') {
    lineItems.push({
      label:  'Logo printing (customization)',
      amount: PRICES.customization * quantity,
    })
  }

  // ── WhatsApp design fee ──
  // Only one design fee regardless of quantity — Djane designs once
  if (isCustomized && customType === 'whatsapp') {
    lineItems.push({
      label:  'Custom design by Djane',
      amount: PRICES.whatsappDesign,
    })
  }

  // ── Delivery fee ──
  if (locationType === 'outside') {
    lineItems.push({
      label:  'Delivery (outside FUTA)',
      amount: PRICES.deliveryOutside,
    })
  } else {
    lineItems.push({
      label:  'Delivery (within FUTA)',
      amount: 0,
      note:   'Free',
    })
  }

  // ── Urgent order fee ──
  if (isUrgent) {
    lineItems.push({
      label:  'Urgent order',
      amount: PRICES.urgentOrder,
    })
  }

  // ── Total ──
  const total = lineItems.reduce((sum, item) => sum + item.amount, 0)

  return { lineItems, total }
}

/**
 * Formats a number as Nigerian Naira
 * 3500 → "₦3,500"
 */
export function formatNaira(amount) {
  if (amount === 0) return 'Free'
  return `₦${amount.toLocaleString('en-NG')}`
}
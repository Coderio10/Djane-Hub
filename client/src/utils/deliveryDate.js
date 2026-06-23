// src/utils/deliveryDate.js

// Day numbers in JavaScript's Date object:
// 0 = Sunday, 1 = Monday, 2 = Tuesday ... 6 = Saturday
const SUNDAY    = 0
const SATURDAY  = 6
const FRIDAY    = 5

// Business days each product type needs
const PROCESSING_DAYS = {
  journal: 2,
  tshirt:  3,
}

/**
 * Calculates the delivery date for an order.
 *
 * Rules:
 * - Journals: 2 business days
 * - Tee shirts: 3 business days
 * - Orders placed Friday/Saturday/Sunday: counting starts from Tuesday
 * - Urgent: subtract 1 day (minimum 1 business day)
 *
 * Returns:
 * {
 *   dateString: "Tuesday, 15 July 2025",
 *   timeSlot:   "12:00 PM – 3:00 PM",
 *   location:   "SUB Frontage, FUTA" | null
 * }
 */
export function calculateDeliveryDate({
  productType,          // 'journal' | 'tshirt'
  isUrgent = false,
  locationType = 'futa',
  orderDate = new Date(),   // defaults to right now
  adminTimeSlot = null,     // set by admin — we'll wire this in Phase 6
}) {

  // ── Step 1: Find the start date ──
  // If order is placed on Friday (5), Saturday (6), or Sunday (0),
  // we start counting from the following Tuesday
  let startDate = new Date(orderDate)
  const dayOfWeek = startDate.getDay()

  if (dayOfWeek === FRIDAY) {
    // Friday → add 4 days to reach Tuesday
    startDate.setDate(startDate.getDate() + 4)
  } else if (dayOfWeek === SATURDAY) {
    // Saturday → add 3 days to reach Tuesday
    startDate.setDate(startDate.getDate() + 3)
  } else if (dayOfWeek === SUNDAY) {
    // Sunday → add 2 days to reach Tuesday
    startDate.setDate(startDate.getDate() + 2)
  }
  // Monday–Thursday → start counting from today

  // ── Step 2: Calculate processing days ──
  let daysNeeded = PROCESSING_DAYS[productType] ?? 2

  // Urgent: 1 fewer day, minimum 1
  if (isUrgent) {
    daysNeeded = Math.max(1, daysNeeded - 1)
  }

  // ── Step 3: Add business days (skip weekends) ──
  let deliveryDate = new Date(startDate)
  let daysAdded = 0

  while (daysAdded < daysNeeded) {
    deliveryDate.setDate(deliveryDate.getDate() + 1)

    const day = deliveryDate.getDay()

    // Only count Monday–Friday as business days
    if (day !== SATURDAY && day !== SUNDAY) {
      daysAdded++
    }
  }

  // ── Step 4: Format the date ──
  // toLocaleDateString gives us "Tuesday, 15 July 2025"
  const dateString = deliveryDate.toLocaleDateString('en-NG', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  })

  // ── Step 5: Time slot ──
  // Use the admin's slot if set, otherwise default
  const timeSlot = adminTimeSlot ?? '12:00 PM – 3:00 PM'

  // ── Step 6: Delivery location ──
  const location = locationType === 'futa'
    ? 'SUB Frontage, FUTA'
    : null   // outside FUTA — customer provides their address

  return { dateString, timeSlot, location }
}

/**
 * Quick human-readable summary for the order summary panel.
 * e.g. "Arrives Tuesday, 15 July · 12:00 PM – 3:00 PM"
 */
export function deliverySummary(deliveryResult) {
  return `Arrives ${deliveryResult.dateString} · ${deliveryResult.timeSlot}`
}
// server/services/resend.js
const { Resend } = require('resend')

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY in environment variables')
}

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM    = process.env.FROM_EMAIL  || 'onboarding@resend.dev'
const ADMIN   = process.env.ADMIN_EMAIL || 'djane@gmail.com'

/**
 * Base send function — all email sends go through here.
 * Returns { success: true } or throws with the Resend error.
 */
async function sendEmail({ to, subject, html }) {
  const { data, error } = await resend.emails.send({
    from:    FROM,
    to,
    subject,
    html,
  })

  if (error) {
    // Log but don't crash the order flow if email fails
    // An order succeeding without an email is better than
    // an email failing and the order appearing to fail
    console.error('Resend error:', error)
    throw new Error(`Email failed: ${error.message}`)
  }

  console.log(`Email sent to ${to} — id: ${data.id}`)
  return { success: true, id: data.id }
}

// ─────────────────────────────────────────────
// Email 1 — Order confirmation to customer
// ─────────────────────────────────────────────
async function sendOrderConfirmation(order) {
  return sendEmail({
    to:      order.customer_email,
    subject: `Your Djane's Hub order is confirmed! 🎉`,
    html:    buildConfirmationEmail(order),
  })
}

// ─────────────────────────────────────────────
// Email 2 — New order alert to admin
// ─────────────────────────────────────────────
async function sendAdminAlert(order) {
  return sendEmail({
    to:      ADMIN,
    subject: `New order from ${order.customer_name} — ₦${order.total_amount.toLocaleString('en-NG')}`,
    html:    buildAdminAlertEmail(order),
  })
}

// ─────────────────────────────────────────────
// Email 3 — Delivery reminder to customer
// ─────────────────────────────────────────────
async function sendDeliveryReminder(order) {
  return sendEmail({
    to:      order.customer_email,
    subject: `Your Djane's Hub order arrives TODAY 📦`,
    html:    buildReminderEmail(order),
  })
}

// ─────────────────────────────────────────────
// Email 4 — Broadcast to all leads
// ─────────────────────────────────────────────
async function sendBroadcast({ emails, subject, body }) {
  // Send to all leads in parallel using Promise.allSettled
  // allSettled (not Promise.all) means one failure won't stop the rest
  const results = await Promise.allSettled(
    emails.map((email) =>
      sendEmail({ to: email, subject, html: buildBroadcastEmail(body) })
    )
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed    = results.filter((r) => r.status === 'rejected').length

  return { succeeded, failed, total: emails.length }
}

module.exports = {
  sendOrderConfirmation,
  sendAdminAlert,
  sendDeliveryReminder,
  sendBroadcast,
}
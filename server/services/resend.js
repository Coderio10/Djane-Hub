// server/services/resend.js
import { Resend } from 'resend'
import {
  buildConfirmationEmail,
  buildAdminAlertEmail,
  buildReminderEmail,
  buildBroadcastEmail,
} from './emailTemplates.js'   // .js extension is REQUIRED in ESM imports

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY in environment variables')
}

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.FROM_EMAIL  || 'onboarding@resend.dev'
const ADMIN  = process.env.ADMIN_EMAIL || 'djane@gmail.com'

async function sendEmail({ to, subject, html }) {
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })

  if (error) {
    console.error('Resend error:', error)
    throw new Error(`Email failed: ${error.message}`)
  }

  console.log(`Email sent to ${to} — id: ${data.id}`)
  return { success: true, id: data.id }
}

async function sendOrderConfirmation(order) {
  return sendEmail({
    to: order.customer_email,
    subject: `Your Djane's Hub order is confirmed! 🎉`,
    html: buildConfirmationEmail(order),
  })
}

async function sendAdminAlert(order) {
  return sendEmail({
    to: ADMIN,
    subject: `New order from ${order.customer_name} — ₦${order.total_amount.toLocaleString('en-NG')}`,
    html: buildAdminAlertEmail(order),
  })
}

async function sendDeliveryReminder(order) {
  return sendEmail({
    to: order.customer_email,
    subject: `Your Djane's Hub order arrives TODAY 📦`,
    html: buildReminderEmail(order),
  })
}

async function sendBroadcast({ emails, subject, body }) {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail({ to: email, subject, html: buildBroadcastEmail(body) }))
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed    = results.filter((r) => r.status === 'rejected').length

  return { succeeded, failed, total: emails.length }
}

export {
  sendOrderConfirmation,
  sendAdminAlert,
  sendDeliveryReminder,
  sendBroadcast,
}
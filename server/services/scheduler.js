// server/services/scheduler.js
const cron     = require('node-cron')
const supabase = require('./supabase')
const { sendDeliveryReminder } = require('./resend')

/**
 * Runs every day at 8:00 AM.
 * Finds all orders delivering today and sends reminder emails.
 *
 * Cron syntax: '0 8 * * *'
 * ┌─── minute (0)
 * │ ┌─── hour (8)
 * │ │ ┌─── day of month (* = every)
 * │ │ │ ┌─── month (* = every)
 * │ │ │ │ ┌─── day of week (* = every)
 * 0 8 * * *
 */
function startDeliveryReminderJob() {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running delivery reminder job:', new Date().toISOString())

    try {
      // Get today's date in YYYY-MM-DD format
      // We stored delivery dates as text strings like "Tuesday, 15 July 2025"
      // So we need to match the formatted string — see note below
      const today = new Date().toLocaleDateString('en-NG', {
        weekday: 'long',
        day:     'numeric',
        month:   'long',
        year:    'numeric',
      })

      // Find all confirmed orders delivering today
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_date', today)   // matches the formatted date string
        .eq('status', 'confirmed')    // only confirmed — not pending or delivered

      if (error) throw error

      if (!orders || orders.length === 0) {
        console.log('No deliveries scheduled for today.')
        return
      }

      console.log(`Sending delivery reminders to ${orders.length} customer(s)`)

      // Send a reminder to each customer
      // allSettled so one failure doesn't stop the rest
      const results = await Promise.allSettled(
        orders.map((order) => sendDeliveryReminder(order))
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled').length
      const failed    = results.filter((r) => r.status === 'rejected').length

      console.log(`Delivery reminders: ${succeeded} sent, ${failed} failed`)

    } catch (err) {
      console.error('Delivery reminder job error:', err.message)
    }
  })

  console.log('Delivery reminder cron job scheduled (runs daily at 8:00 AM)')
}

module.exports = { startDeliveryReminderJob }
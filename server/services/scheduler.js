// server/services/scheduler.js
import cron from 'node-cron'
import supabase from './supabase.js'
import { sendDeliveryReminder } from './resend.js'

export function startDeliveryReminderJob() {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running delivery reminder job:', new Date().toISOString())

    try {
      const today = new Date().toLocaleDateString('en-NG', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_date', today)
        .eq('status', 'confirmed')

      if (error) throw error

      if (!orders || orders.length === 0) {
        console.log('No deliveries scheduled for today.')
        return
      }

      console.log(`Sending delivery reminders to ${orders.length} customer(s)`)

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
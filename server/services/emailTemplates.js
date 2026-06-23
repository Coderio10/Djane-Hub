// server/services/emailTemplates.js

// Shared styles used across all emails
const COLORS = {
  orange:     '#F97316',
  orangeDark: '#EA580C',
  cream:      '#FEF3C7',
  dark:       '#1C1917',
  muted:      '#78716C',
  surface:    '#FFFBEB',
  border:     '#FED7AA',
}

// Reusable wrapper — every email uses this outer shell
function emailShell(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Djane's Hub</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF7ED;font-family:Georgia,serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#FFF7ED;padding:32px 16px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%">

          <!-- Header -->
          <tr>
            <td style="background-color:${COLORS.orange};border-radius:16px 16px 0 0;
                        padding:28px 32px;text-align:center">
              <h1 style="margin:0;color:#FFFFFF;font-family:Georgia,serif;
                          font-size:26px;font-weight:700;letter-spacing:-0.5px">
                Djane's Hub
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);
                         font-size:13px;font-family:Arial,sans-serif">
                Journals · Tee Shirts · Custom Designs
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#FFFFFF;padding:32px;
                        border-left:1px solid ${COLORS.border};
                        border-right:1px solid ${COLORS.border}">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${COLORS.surface};
                        border:1px solid ${COLORS.border};
                        border-top:none;
                        border-radius:0 0 16px 16px;
                        padding:20px 32px;text-align:center">
              <p style="margin:0;font-size:12px;color:${COLORS.muted};
                          font-family:Arial,sans-serif;line-height:1.6">
                Questions? WhatsApp Djane at
                <a href="https://wa.me/2348000000000"
                   style="color:${COLORS.orange};text-decoration:none;font-weight:600">
                  +234 800 000 0000
                </a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#A8A29E;
                          font-family:Arial,sans-serif">
                © 2025 Djane's Hub · Made with ❤️ in Nigeria
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// A reusable table row for order details
function detailRow(label, value, highlight = false) {
  return `
<tr>
  <td style="padding:8px 0;border-bottom:1px solid #FEF3C7;
              font-size:13px;color:${COLORS.muted};font-family:Arial,sans-serif;
              width:40%">
    ${label}
  </td>
  <td style="padding:8px 0;border-bottom:1px solid #FEF3C7;
              font-size:13px;font-family:Arial,sans-serif;text-align:right;
              font-weight:${highlight ? '700' : '500'};
              color:${highlight ? COLORS.orange : COLORS.dark}">
    ${value}
  </td>
</tr>`
}

// ─────────────────────────────────────────────
// Template 1 — Order confirmation
// ─────────────────────────────────────────────
function buildConfirmationEmail(order) {
  const isWithinFuta = order.location_type === 'futa'
  const location     = isWithinFuta
    ? 'SUB Frontage, FUTA'
    : order.delivery_address

  const content = `
    <h2 style="margin:0 0 6px;font-size:22px;color:${COLORS.dark};
                font-family:Georgia,serif">
      Order confirmed! 🎉
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:${COLORS.muted};
               font-family:Arial,sans-serif;line-height:1.6">
      Hi <strong style="color:${COLORS.dark}">${order.customer_name}</strong>,
      thank you for your order! We've received it and will get started right away.
    </p>

    <!-- Order details table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:24px">
      ${detailRow('Product',        order.product_name)}
      ${detailRow('Colour',         order.product_color  ?? '—')}
      ${order.size
        ? detailRow('Size',         order.size)
        : ''}
      ${order.with_pen
        ? detailRow('Pen included', 'Yes (+₦500)')
        : ''}
      ${order.is_customized
        ? detailRow('Customization', order.custom_type === 'text'
            ? `Text: "${order.custom_text}" (${order.custom_font})`
            : order.custom_type === 'logo'
              ? 'Logo upload'
              : 'Custom design by Djane')
        : ''}
      ${detailRow('Quantity',       order.quantity)}
      ${detailRow('Delivery fee',
        order.delivery_fee === 0 ? 'Free (within FUTA)' : `₦${order.delivery_fee.toLocaleString()}`
      )}
      ${order.is_urgent
        ? detailRow('Urgent fee', `₦${order.urgent_fee.toLocaleString()}`)
        : ''}
      ${detailRow('Total',          `₦${order.total_amount.toLocaleString('en-NG')}`, true)}
    </table>

    <!-- Delivery info box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color:${COLORS.cream};border-radius:12px;
                   margin-bottom:24px">
      <tr>
        <td style="padding:20px 24px">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;
                     color:${COLORS.orange};font-family:Arial,sans-serif;
                     text-transform:uppercase;letter-spacing:0.05em">
            Delivery details
          </p>
          <p style="margin:8px 0 0;font-size:14px;color:${COLORS.dark};
                     font-family:Arial,sans-serif;line-height:1.6">
            📅 <strong>${order.delivery_date}</strong>
            &nbsp;·&nbsp; ${order.delivery_time}
          </p>
          <p style="margin:6px 0 0;font-size:14px;color:${COLORS.dark};
                     font-family:Arial,sans-serif">
            📍 ${location}
          </p>
        </td>
      </tr>
    </table>

    <!-- Payment reminder -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color:#FFF1F2;border:1px solid #FECDD3;
                   border-radius:12px;margin-bottom:24px">
      <tr>
        <td style="padding:16px 20px">
          <p style="margin:0;font-size:13px;color:#9F1239;
                     font-family:Arial,sans-serif;line-height:1.6">
            ⚠️ <strong>Payment reminder:</strong> If you haven't transferred
            <strong>₦${order.total_amount.toLocaleString('en-NG')}</strong> yet,
            please do so to confirm your order.
            Use your phone number <strong>${order.customer_phone}</strong> as reference.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:${COLORS.muted};
               font-family:Arial,sans-serif;line-height:1.6">
      Warm regards,<br>
      <strong style="color:${COLORS.dark}">Djane 🧡</strong><br>
      <span style="font-size:12px">Djane's Hub</span>
    </p>
  `

  return emailShell(content)
}

// ─────────────────────────────────────────────
// Template 2 — Admin alert
// ─────────────────────────────────────────────
function buildAdminAlertEmail(order) {
  const content = `
    <h2 style="margin:0 0 6px;font-size:20px;color:${COLORS.dark};
                font-family:Georgia,serif">
      New order received 🛍️
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:${COLORS.muted};
               font-family:Arial,sans-serif">
      Someone just placed an order. Here are all the details:
    </p>

    <!-- Customer info -->
    <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:${COLORS.orange};
               font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.05em">
      Customer
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:20px">
      ${detailRow('Name',  order.customer_name)}
      ${detailRow('Phone', order.customer_phone)}
      ${detailRow('Email', order.customer_email)}
    </table>

    <!-- Order info -->
    <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:${COLORS.orange};
               font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.05em">
      Order
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:20px">
      ${detailRow('Product',    order.product_name)}
      ${detailRow('Colour',     order.product_color ?? '—')}
      ${order.size ? detailRow('Size', order.size) : ''}
      ${order.with_pen ? detailRow('Pen', 'Yes') : ''}
      ${order.is_customized
        ? detailRow('Custom type', order.custom_type)
        : detailRow('Customized', 'No')}
      ${order.custom_text
        ? detailRow('Custom text', `"${order.custom_text}" — ${order.custom_font}`)
        : ''}
      ${detailRow('Quantity',   String(order.quantity))}
      ${detailRow('Total',      `₦${order.total_amount.toLocaleString('en-NG')}`, true)}
    </table>

    <!-- Delivery info -->
    <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:${COLORS.orange};
               font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.05em">
      Delivery
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:24px">
      ${detailRow('Date',     order.delivery_date)}
      ${detailRow('Time',     order.delivery_time)}
      ${detailRow('Location', order.location_type === 'futa'
        ? 'Within FUTA — SUB Frontage'
        : `Outside FUTA — ${order.delivery_address}`)}
      ${detailRow('Urgent',   order.is_urgent ? 'YES ⚡' : 'No')}
    </table>

    <p style="margin:0;font-size:12px;color:${COLORS.muted};font-family:Arial,sans-serif">
      Order ID: <code style="font-family:monospace;font-size:12px;
                              color:${COLORS.dark}">${order.id}</code>
    </p>
  `

  return emailShell(content)
}

// ─────────────────────────────────────────────
// Template 3 — Delivery reminder
// ─────────────────────────────────────────────
function buildReminderEmail(order) {
  const location = order.location_type === 'futa'
    ? 'SUB Frontage, FUTA'
    : order.delivery_address

  const content = `
    <h2 style="margin:0 0 6px;font-size:22px;color:${COLORS.dark};
                font-family:Georgia,serif">
      Your order arrives today! 📦
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:${COLORS.muted};
               font-family:Arial,sans-serif;line-height:1.6">
      Hi <strong style="color:${COLORS.dark}">${order.customer_name}</strong>!
      Just a reminder that your Djane's Hub order is being delivered today.
      Please make sure you're available.
    </p>

    <!-- Delivery box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color:${COLORS.cream};border-radius:12px;
                   margin-bottom:24px">
      <tr>
        <td style="padding:24px">
          <p style="margin:0 0 12px;font-size:15px;color:${COLORS.dark};
                     font-family:Arial,sans-serif">
            🕐 <strong>Delivery window</strong>
          </p>
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;
                     color:${COLORS.orange};font-family:Georgia,serif">
            ${order.delivery_time}
          </p>
          <p style="margin:0;font-size:14px;color:${COLORS.muted};
                     font-family:Arial,sans-serif">
            📍 ${location}
          </p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:24px">
      ${detailRow('What you ordered', order.product_name)}
      ${detailRow('Quantity',         String(order.quantity))}
    </table>

    <p style="margin:0;font-size:14px;color:${COLORS.muted};
               font-family:Arial,sans-serif;line-height:1.6">
      See you soon! 🧡<br>
      <strong style="color:${COLORS.dark}">Djane</strong>
    </p>
  `

  return emailShell(content)
}

// ─────────────────────────────────────────────
// Template 4 — Broadcast
// ─────────────────────────────────────────────
function buildBroadcastEmail(body) {
  const content = `
    <div style="font-size:15px;color:${COLORS.dark};font-family:Arial,sans-serif;
                 line-height:1.8;white-space:pre-wrap">
      ${body}
    </div>
    <hr style="border:none;border-top:1px solid ${COLORS.border};margin:24px 0">
    <p style="margin:0;font-size:12px;color:${COLORS.muted};font-family:Arial,sans-serif">
      You're receiving this because you've ordered from Djane's Hub before.
    </p>
  `

  return emailShell(content)
}
// At the bottom of emailTemplates.js — replace module.exports with:
export {
  buildConfirmationEmail,
  buildAdminAlertEmail,
  buildReminderEmail,
  buildBroadcastEmail,
}
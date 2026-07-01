# Djane's Hub

**Live site → [djane-hub.vercel.app](https://djane-hub.vercel.app)**

A full-stack e-commerce storefront for a small Nigerian business selling custom journals, tee shirts, and personalised designs. Built with React on the frontend and Node.js/Express on the backend, backed by Supabase and transactional email via Resend.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Key Modules](#key-modules)
- [Email System](#email-system)
- [Admin Panel](#admin-panel)
- [Deployment](#deployment)

---

## Overview

Djane's Hub is a production-ready e-commerce application tailored to a local Nigerian market context — FUTA campus delivery, bank transfer payments, and a WhatsApp design route for customers who don't have their own artwork.

Customers can browse journals and tee shirts, customise their order (text, logo upload, or a WhatsApp-assisted design), get a live price breakdown, and submit their order. The admin receives an email alert instantly. A cron job sends delivery reminders to customers every morning at 8 AM.

---

## Features

### Storefront
- Landing page with hero section, category grid, featured products, and feature banners
- Shop page with tabbed journal / tee shirt catalogue
- Per-product detail pages with colour selection, size selection, and live pricing

### Journal Customiser
- Cover colour picker
- Optional matching pen add-on
- Customisation options: print text, upload a logo, or request a design via WhatsApp
- 6 Google Font choices with live preview rendered on an HTML Canvas
- Logo upload with client-side file validation (type, size)
- Real-time debounced canvas preview

### Checkout & Orders
- Server-side validated order creation
- Automatic delivery date calculation (business days, skip weekends, urgent option)
- Transparent line-item pricing breakdown
- Bank transfer payment flow with order reference

### Email Notifications
- Order confirmation email to customer
- New order alert email to admin
- Delivery reminder email (automated, sent day-of via cron)
- Broadcast / marketing email to all past customers

### Admin Panel
- Password-protected with JWT-style session token
- View and manage all orders
- Update order status (`pending` → `confirmed` → `delivered`)
- Set the weekly delivery time slot
- Send broadcast emails to all leads
- Test email route for development

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React 19, React Router 7, Vite 8        |
| Styling      | Tailwind CSS 4, custom CSS design system|
| Backend      | Node.js 20, Express 5                   |
| Database     | Supabase (PostgreSQL)                   |
| Email        | Resend                                  |
| Scheduler    | node-cron                               |
| Dev tooling  | Nodemon, ESLint                         |

---

## Project Structure

```
djane-hub/
├── client/                     # React frontend (Vite)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── components/
│       │   ├── CanvasPreview.jsx       # Live journal cover preview (Canvas API)
│       │   ├── Footer.jsx
│       │   ├── JournalCustomizer.jsx   # Multi-step journal customisation flow
│       │   ├── LogoUploader.jsx        # Client-side logo upload + validation
│       │   ├── Navbar.jsx
│       │   └── OrderSummary.jsx        # Line-item price breakdown
│       ├── data/
│       │   └── products.js             # Product catalogue (journals + tees)
│       ├── pages/
│       │   ├── AdminPage.jsx
│       │   ├── CheckoutPage.jsx
│       │   ├── LandingPage.jsx
│       │   ├── OrderConfirmPage.jsx
│       │   ├── ProductPage.jsx
│       │   └── ShopPage.jsx
│       └── utils/
│           ├── api.js                  # Typed fetch wrapper for all API calls
│           ├── deliveryDate.js         # Business-day delivery date calculator
│           ├── fileValidator.js        # Logo upload constraints
│           ├── fontLoader.js           # Dynamic Google Fonts loader
│           └── pricingEngine.js        # Order total + line item calculator
│
└── server/                     # Express backend (ESM)
    ├── routes/
    │   ├── admin.js                    # Admin-protected routes
    │   └── orders.js                   # Order CRUD
    └── services/
        ├── emailTemplates.js           # HTML email templates (all 4 types)
        ├── resend.js                   # Email sending functions
        ├── scheduler.js                # Daily 8 AM delivery reminder cron
        └── supabase.js                 # Supabase client singleton
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project with the following tables:
  - `orders`
  - `delivery_slots`
- A [Resend](https://resend.com) account with a verified sending domain

### Environment Variables

**`server/.env`**

```env
PORT=3001
CLIENT_URL=http://localhost:5173

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=you@yourdomain.com
ADMIN_EMAIL=djane@yourdomain.com

ADMIN_PASSWORD=your_admin_password
JWT_SECRET=a_long_random_secret_string
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:3001
```

> Never commit `.env` files. Both are listed in `.gitignore`.

### Running Locally

1. **Clone the repository**

```bash
git clone https://github.com/your-username/djane-hub.git
cd djane-hub
```

2. **Install dependencies**

```bash
# Frontend
cd client && npm install

# Backend
cd ../server && npm install
```

3. **Set up environment variables**

Copy the examples above into `client/.env` and `server/.env` and fill in your values.

4. **Start both servers**

In one terminal:
```bash
cd server && npm run dev
```

In another terminal:
```bash
cd client && npm run dev
```

5. **Open the app**

```
http://localhost:5173
```

The API will be running at `http://localhost:3001`. Check the health endpoint:
```
http://localhost:3001/health
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Orders

| Method  | Endpoint          | Description              | Auth     |
|---------|-------------------|--------------------------|----------|
| `POST`  | `/api/orders`     | Create a new order       | Public   |
| `GET`   | `/api/orders`     | Fetch all orders         | Admin    |
| `PATCH` | `/api/orders/:id` | Update order status      | Admin    |

#### `POST /api/orders` — Request body

```json
{
  "customerName": "Sarah Adeola",
  "customerPhone": "08012345678",
  "customerEmail": "sarah@example.com",
  "productType": "journal",
  "productId": "journal-classic",
  "productName": "Classic Journal",
  "productColor": "Midnight Black",
  "withPen": true,
  "isCustomized": true,
  "customType": "text",
  "customText": "Sarah's Journal 2025",
  "customFont": "Playfair Display",
  "quantity": 1,
  "locationType": "futa",
  "isUrgent": false,
  "lineItems": [{ "label": "Classic Journal × 1", "amount": 3500 }],
  "total": 5000,
  "deliveryDate": "Tuesday, 15 July 2025",
  "deliveryTime": "12:00 PM – 3:00 PM"
}
```

### Admin

| Method | Endpoint                   | Description                        | Auth  |
|--------|----------------------------|------------------------------------|-------|
| `POST` | `/api/admin/login`         | Authenticate and receive token     | —     |
| `GET`  | `/api/admin/delivery-slot` | Get the current delivery slot      | Admin |
| `POST` | `/api/admin/delivery-slot` | Set the weekly delivery slot       | Admin |
| `POST` | `/api/admin/broadcast`     | Send marketing email to all leads  | Admin |
| `POST` | `/api/admin/test-email`    | Send a test email (dev only)       | Admin |

---

## Key Modules

### `pricingEngine.js`

Calculates the full order total from an order object. Returns a `lineItems` array and a `total`. All prices are defined in one `PRICES` constant — update once, reflects everywhere.

```js
const { lineItems, total } = calculateOrder({
  product, quantity, withPen, isCustomized,
  customType, locationType, isUrgent
})
```

### `deliveryDate.js`

Calculates the estimated delivery date using business-day logic. Handles weekend skip (Friday/Saturday/Sunday orders start counting from Tuesday), urgent processing, and FUTA vs outside-FUTA location.

```js
const { dateString, timeSlot, location } = calculateDeliveryDate({
  productType: 'journal',
  isUrgent: false,
  locationType: 'futa',
  orderDate: new Date(),
  adminTimeSlot: '12:00 PM – 3:00 PM'
})
```

### `CanvasPreview.jsx`

Renders a live preview of the journal cover using the browser's Canvas API. Updates in real time as the customer types text, selects a font, or uploads a logo. Text rendering uses the selected Google Font — fonts are loaded on demand via `fontLoader.js`.

---

## Email System

Four transactional emails are sent via Resend, all built from a shared HTML template shell (`emailTemplates.js`):

| Email              | Trigger                                  | Recipient  |
|--------------------|------------------------------------------|------------|
| Order confirmation | Order created successfully               | Customer   |
| Admin alert        | Order created successfully               | Admin      |
| Delivery reminder  | Cron job at 8:00 AM on delivery day      | Customer   |
| Broadcast          | Admin triggers from the admin panel      | All leads  |

Emails are sent with `Promise.allSettled` so a failed email never blocks an order from being placed.

---

## Admin Panel

Access at `/admin`. Requires the `ADMIN_PASSWORD` set in `server/.env`.

On login, a session token is stored in `sessionStorage` and attached as a `Bearer` token on all subsequent admin API calls.

Capabilities:
- View all orders sorted by most recent
- Update order status with one click
- Set the weekly delivery slot (date + time window)
- Compose and send a broadcast email to all customers
- Test individual email types in development

---

## Deployment

The frontend is deployed on **Vercel** at [djane-hub.vercel.app](https://djane-hub.vercel.app).

### Frontend (Vercel)

```bash
cd client && npm run build
# Deploy the /dist folder
```

Set the `VITE_API_URL` environment variable in your hosting dashboard to point to your deployed API.

### Backend (e.g. Railway, Render)

Set all `server/.env` variables as environment variables in your hosting dashboard. The start command is:

```bash
node index.js
```

The cron job (`scheduler.js`) starts automatically when the server boots. It runs daily at `0 8 * * *` (8:00 AM server time) — make sure the server's timezone matches the expected locale or adjust the cron expression accordingly.

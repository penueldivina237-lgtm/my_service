Divine Engineer — Server README

This small server stores project bookings, creates Stripe Checkout Sessions (with metadata), and handles Stripe webhooks to mark bookings paid and send confirmation emails.

Setup
1. Copy `.env.example` to `.env` and fill values (Stripe secret key, webhook secret, SMTP settings, DOMAIN).
2. Install dependencies:

```bash
cd divine-engineer/server
npm install
```

3. Start the server:

```bash
npm start
```

Endpoints
- `POST /bookings` — accepts booking JSON {name,email,organization,date,serviceType,hours,message,total} and returns `{ id }`.
- `POST /create-checkout-session` — accepts `{ bookingId }`, creates a Stripe Checkout Session with metadata.bookingId and returns `{ url }`.
- `POST /webhook` — Stripe webhook endpoint. Configure this URL in the Stripe Dashboard and set `STRIPE_WEBHOOK_SECRET` in `.env`.

Notes
- Use the `DOMAIN` env var to point to where your site is hosted (used for `success_url` and `cancel_url`).
- The server stores bookings in `server/data/bookings.json` (simple file storage). For production, replace with a proper DB.
- The webhook sends confirmation emails using SMTP config (nodemailer). Set `EMAIL_FROM` in `.env`.

Stripe webhook configuration
1. In the Stripe Dashboard → Developers → Webhooks create an endpoint pointing to `https://your-domain/webhook` (or `http://localhost:4242/webhook` while testing with a tunnel like ngrok).
2. Subscribe to `checkout.session.completed` events.
3. Copy the webhook signing secret into `.env` as `STRIPE_WEBHOOK_SECRET`.

Client integration
Update your front-end to POST booking details to `/bookings` then call `/create-checkout-session` with the returned booking id. The server will create a Checkout Session with booking metadata so the webhook can associate payment with the booking and send confirmation email.

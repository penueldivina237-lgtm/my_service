require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');

const app = express();
const DATA_FILE = path.join(__dirname, 'data', 'bookings.json');

const PORT = process.env.PORT || 4242;
const DOMAIN = process.env.DOMAIN || `http://localhost:${PORT}`;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');

app.use(cors());
app.use(bodyParser.json());

function readBookings() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
  } catch (e) {
    return [];
  }
}

function writeBookings(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.floor(Math.random()*10000)}`;
}

// Create booking record (called by client before starting checkout)
app.post('/bookings', (req, res) => {
  const { name, email, organization, date, serviceType, hours, message, total } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  const bookings = readBookings();
  const id = createId();
  const booking = { id, name, email, organization, date, serviceType, hours, message, total, status: 'pending', createdAt: new Date().toISOString() };
  bookings.push(booking);
  writeBookings(bookings);

  res.json({ id });
});

// Create a Stripe Checkout Session for a booking
app.post('/create-checkout-session', async (req, res) => {
  const { bookingId } = req.body || {};
  if (!bookingId) return res.status(400).json({ error: 'bookingId required' });

  const bookings = readBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ error: 'booking not found' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${booking.serviceType} — ${booking.hours} hr` },
            unit_amount: Math.round((booking.total || 0) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${DOMAIN}/public/booking-success.html`,
      cancel_url: `${DOMAIN}/index.html`,
      metadata: { bookingId: booking.id },
      customer_email: booking.email
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create session' });
  }
});

// Stripe webhook endpoint for checkout.session.completed
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata && session.metadata.bookingId;
    const bookings = readBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'paid';
      booking.paidAt = new Date().toISOString();
      booking.stripeSessionId = session.id;
      writeBookings(bookings);

      // send confirmation email
      (async () => {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          });

          const html = `
            <p>Hi ${booking.name || ''},</p>
            <p>Thanks — we've received your payment for the booking. Details:</p>
            <ul>
              <li><strong>Service:</strong> ${booking.serviceType}</li>
              <li><strong>Date:</strong> ${booking.date}</li>
              <li><strong>Hours:</strong> ${booking.hours}</li>
              <li><strong>Total:</strong> $${booking.total}</li>
            </ul>
            <p>We'll contact you shortly to confirm the details.</p>
            <p>— Divine Emmanuel</p>
          `;

          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: booking.email,
            subject: 'Booking confirmed — Divine Emmanuel',
            html
          });
        } catch (err) {
          console.error('Error sending email', err);
        }
      })();
    }
  }

  res.json({ received: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

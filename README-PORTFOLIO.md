# Divine Emmanuel — Full-Stack Software Engineer

This repository contains the professional portfolio and booking platform for Divine Emmanuel, a Full-Stack Software Engineer specializing in React, Next.js, and React Native.

## Project Structure
- `index.html` — Main landing page featuring core expertise, tech stack, and service options.
- `inside.html` — Technical deep-dive page for architectural overview and project insights.
- `booking-success.html` — Post-checkout success page.
- `server/` — Node/Express server scaffold for handling project bookings and Stripe integration.

## Technical Stack
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla for static site), AOS (Animate On Scroll).
- **Backend:** Node.js, Express (Booking API).
- **Payments:** Stripe Checkout integration.
- **Styling:** Premium Gold/Dark Aesthetic with Serif typography.

## Quick Start (Local)
1. Serve the static site from the root:
```bash
python3 -m http.server 5500
```

2. Start the booking server:
```bash
cd server
npm install
cp .env.example .env   # Add your Stripe/Admin keys
npm start
```

## Deployment
- **Frontend:** Deploy to GitHub Pages, Vercel, or Netlify.
- **Backend:** Deploy the `server/` directory to Heroku, Railway, or a VPS.

© 2026 Divine Emmanuel. All rights reserved.
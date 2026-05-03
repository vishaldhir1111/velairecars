# Velaire Cars

Premium React/Vite frontend for a luxury car rental website with a black, white and rose-gold
visual system.

## Active Render Path

- `index.html` mounts the Vite app at `#root`.
- `src/main.jsx` renders `src/App.jsx`.
- `src/App.jsx` imports `src/styles.css`.
- `vite.config.js` also includes `booking.html`, `login.html`, `account.html`, `payment.html` and
  `success.html` as static page entries.
- `flow.css` styles the static booking flow pages.
- `flow.js` keeps the booking flow working locally with `localStorage` and syncs to `/api/*` when
  deployed on Vercel.

## Fleet

- Tesla Model 3 Performance 2020, white exterior and white interior.
- Lamborghini Urus 2021, orange.
- Land Rover Range Rover Sport SVR 2021.
- BMW M440i Convertible 2022, sky blue wrap.
- BMW M140i Shadow Edition 2019.

The React homepage and backend share fleet data from `src/data/fleet.js`. Current vehicle
presentation uses premium studio 3D fallbacks with GLB/GLTF model slots under `public/models/`.

## Backend

The `api/` folder contains Vercel-ready serverless endpoints:

- `GET /api/fleet`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET/PATCH /api/account`
- `GET/POST/PATCH /api/bookings`
- `GET/POST /api/availability`
- `POST /api/payments/intent`
- `POST /api/concierge`
- `GET /api/admin/summary`

The active operations layer uses Vercel KV through `api/_lib/operations-store.js` for vehicles,
availability, bookings, customers, payments and notification history. If KV is unavailable the site
falls back to memory so the customer flow remains usable, but production should keep the Vercel KV
environment variables connected. No raw card data is stored.

## Notifications

Booking and deposit communication is wired through `api/_lib/notifications.js` using Resend on
Vercel. Add these environment variables in Vercel to enable live email delivery:

- `RESEND_API_KEY` - Resend API key from the Resend dashboard.
- `VELAIRE_EMAIL_FROM` - verified sender, for example `Velaire Cars <reservations@velairecars.com>`.
- `VELAIRE_ADMIN_EMAIL` - internal operations inbox for new booking and deposit alerts.
- `VELAIRE_REPLY_TO` - optional reply-to address for concierge responses.
- `VELAIRE_SITE_URL` - production site URL, for example `https://www.velairecars.com`.

If `RESEND_API_KEY` is missing, bookings and payments continue to work and notification attempts are
recorded as skipped in the operations data instead of blocking the customer flow.

## Run

Install dependencies, then run the Vite dev server:

```bash
npm install
npm run dev
```

# Velaire Cars

Premium React/Vite frontend for a luxury car rental website with a black, white and rose-gold
visual system.

## Active Render Path

- `index.html` mounts the Vite app at `#root`.
- `src/main.jsx` renders `src/App.jsx`.
- `src/App.jsx` imports `src/styles.css`.
- `public/booking.html`, `public/login.html`, `public/account.html`, `public/ai.html`,
  `public/admin.html`, `public/payment.html` and `public/success.html` are static flow pages served at
  `/booking.html`, `/login.html`, `/account.html`, `/ai.html`, `/admin.html`, `/payment.html` and
  `/success.html`.
- `public/flow.css` styles the static booking flow pages.
- `public/flow.js` keeps the booking flow working locally with `localStorage` and syncs to `/api/*`
  when deployed on Vercel.
- Nexa typography is configured in `src/styles.css` and `public/flow.css`, with font files in
  `public/Nexa-ExtraLight.ttf` and `public/Nexa-Heavy.ttf`.

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
- `POST /api/payments/checkout`
- `POST /api/payments/webhook`
- `POST /api/concierge`
- `GET /api/admin/summary`
- `GET/PATCH /api/admin/bookings`
- `GET/PATCH/POST/DELETE /api/admin/vehicles`

The current backend uses an in-memory store scaffold so the flow is API-shaped without adding a
database dependency. For production, replace `api/_lib/store.js` with a durable database adapter and
connect the Stripe-ready checkout/webhook endpoints with Vercel environment variables. No raw card
data is stored.

Set these environment variables in production:

- `VELAIRE_ADMIN_TOKEN` protects the admin operations APIs.
- `STRIPE_SECRET_KEY` enables Stripe Checkout session creation.
- `STRIPE_WEBHOOK_SECRET` verifies Stripe webhook events.

## Run

Install dependencies, then run the Vite dev server:

```bash
npm install
npm run dev
```

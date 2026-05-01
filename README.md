# Velaire Cars

Premium React/Vite frontend for a luxury car rental website with a black, white and rose-gold
visual system.

## Active Render Path

- `index.html` mounts the Vite app at `#root`.
- `src/main.jsx` renders `src/App.jsx`.
- `src/App.jsx` imports `src/styles.css`.
- `public/booking.html`, `public/login.html`, `public/account.html`, `public/ai.html`,
  `public/admin.html`, `public/payment.html` and `public/success.html` are static flow pages served at
  `/booking.html`, `/login.html`, `/account.html`, `/ai.html`, `/portal`, `/payment.html` and
  `/success.html`.
- `vercel.json` rewrites `/portal` to the operations page while keeping clean URLs enabled.
- `public/terms.html`, `public/privacy.html`, `public/cancellation.html`, `public/insurance.html`,
  `public/requirements.html` and `public/deposit.html` are the legal and trust pages served at
  `/terms.html`, `/privacy.html`, `/cancellation.html`, `/insurance.html`, `/requirements.html`
  and `/deposit.html`.
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
- `GET/POST /api/payments/session`
- `POST /api/payments/webhook`
- `POST /api/notifications/reminders`
- `POST /api/concierge`
- `GET /api/admin/summary`
- `GET/PATCH /api/admin/bookings`
- `GET /api/admin/customers`
- `GET/PATCH /api/admin/leads`
- `GET/PATCH /api/admin/payments`
- `GET/PATCH/POST/DELETE /api/admin/vehicles`

The current backend keeps the live booking flow lightweight, but Stripe payment operations are now
mirrored into an optional durable Vercel KV / Upstash Redis REST store through
`api/_lib/operations-store.js`. Stripe Checkout is required for reservation deposits, with webhook
and return-page verification. No raw card data is collected or stored by Velaire.

## Operations And Trust

- `/portal` is the premium operations dashboard for bookings, customer accounts, vehicles,
  concierge messages needing reply, deposits and payment status.
- Availability is stored in `api/_lib/store.js` as blocked dates plus pending and confirmed booking
  holds per vehicle. The admin vehicle cards include a 42-day availability calendar, and booking
  creation plus admin updates check this state to reduce double-booking risk.
- Phase 1 booking statuses are `pending`, `payment_pending`, `confirmed`, `cancelled` and
  `completed`. Pending, payment-pending and confirmed bookings hold vehicle availability until an
  admin cancels or completes the booking.
- Phase 2 deposit statuses are `payment_pending`, `deposit_paid`, `failed`, `cancelled` and
  `refunded`. A booking is only moved to paid/confirmed after Stripe returns a paid Checkout
  Session through `/api/payments/session` or the Stripe webhook. The webhook writes booking,
  payment and customer records into the operations store when Vercel KV / Upstash REST variables are
  configured, and the Operations dashboard reads that same store.
- Phase 3 client account features include profile/photo metadata, verification document metadata,
  saved handover locations, richer booking history, receipt summaries and notification triggers for
  booking requests, paid deposits, failed payments, admin approval/rejection and handover reminders.
  Resend is used for email delivery when `RESEND_API_KEY` is configured.
- Legal and trust pages are in `public/` and share the same Nexa, black and rose-gold flow design
  system as the booking and account experience. Have a solicitor review the policy copy before using
  it as binding production legal wording.

Set these environment variables in production:

- `VELAIRE_ADMIN_TOKEN` or `VELAIRE_PORTAL_PASSWORD` protects the operations portal APIs. If neither
  is set, the server-side default portal password is `AG23HS60`.
- `STRIPE_SECRET_KEY` is required for Stripe Checkout session creation.
- `STRIPE_WEBHOOK_SECRET` verifies Stripe webhook events.
- `VELAIRE_SITE_URL` is optional and can force Stripe redirect URLs to `https://www.velairecars.com`.
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` enable durable Operations records on Vercel KV.
- Alternatively, `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` can be used.
- `VELAIRE_STORE_PREFIX` is optional and defaults to `velaire:operations`.
- `RESEND_API_KEY` enables transactional emails.
- `VELAIRE_EMAIL_FROM` sets the sender, for example `Velaire Cars <reservations@velairecars.com>`.
- `VELAIRE_ADMIN_EMAIL` receives optional internal booking/payment notifications.
- `VELAIRE_REMINDER_WINDOW_HOURS` controls the handover reminder endpoint and defaults to `48`.

## Run

Install dependencies, then run the Vite dev server:

```bash
npm install
npm run dev
```

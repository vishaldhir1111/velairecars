import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const flowPages = [
  "public/booking.html",
  "public/login.html",
  "public/account.html",
  "public/ai.html",
  "public/admin.html",
  "public/payment.html",
  "public/success.html",
  "public/terms.html",
  "public/privacy.html",
  "public/cancellation.html",
  "public/insurance.html",
  "public/requirements.html",
  "public/deposit.html",
];
const requiredFiles = [
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/styles.css",
  ...flowPages,
  "public/flow.css",
  "public/flow.js",
  "public/Nexa-ExtraLight.ttf",
  "public/Nexa-Heavy.ttf",
  "src/data/fleet.js",
  "api/fleet.js",
  "api/bookings.js",
  "api/account.js",
  "api/availability.js",
  "api/concierge.js",
  "api/auth/login.js",
  "api/auth/register.js",
  "api/auth/logout.js",
  "api/auth/session.js",
  "api/payments/intent.js",
  "api/payments/checkout.js",
  "api/payments/session.js",
  "api/payments/webhook.js",
  "api/admin/summary.js",
  "api/admin/bookings.js",
  "api/admin/customers.js",
  "api/admin/leads.js",
  "api/admin/payments.js",
  "api/admin/vehicles.js",
  "api/_lib/fleet-data.js",
  "api/_lib/http.js",
  "api/_lib/stripe.js",
  "api/_lib/store.js",
  "vite.config.js",
  "package.json",
];

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing active file: ${file}`);
  }
}

JSON.parse(read("package.json"));

const index = read("index.html");
if (!index.includes('src="/src/main.jsx"')) {
  throw new Error("index.html does not mount /src/main.jsx");
}

const main = read("src/main.jsx");
if (!main.includes('import App from "./App.jsx"') || !main.includes('import "./styles.css"')) {
  throw new Error("src/main.jsx is not wired to App.jsx and styles.css");
}

const app = read("src/App.jsx");
if (!app.includes('from "./data/fleet.js"')) {
  throw new Error("src/App.jsx is not using the shared fleet data module");
}

const vite = read("vite.config.js");
for (const page of [
  "booking.html",
  "login.html",
  "account.html",
  "ai.html",
  "admin.html",
  "payment.html",
  "success.html",
  "terms.html",
  "privacy.html",
  "cancellation.html",
  "insurance.html",
  "requirements.html",
  "deposit.html",
]) {
  if (vite.includes(`./${page}`)) {
    throw new Error(`vite.config.js should not reference root ${page}; static flow pages live in public/`);
  }
}

for (const file of requiredFiles) {
  const contents = read(file);
  if (/[“”‘’]/.test(contents)) {
    throw new Error(`Curly quote found in ${file}`);
  }
}

for (const page of flowPages) {
  const html = read(page);
  if (!html.includes('href="flow.css"')) {
    throw new Error(`${page} does not load flow.css`);
  }
  if (!html.includes('type="module" src="/flow.js"')) {
    throw new Error(`${page} does not load flow.js`);
  }
}

if (read("public/account.html").includes('id="concierge-chat"')) {
  throw new Error("AI concierge chat should live on public/ai.html, not public/account.html");
}

if (!read("public/ai.html").includes('id="concierge-chat"') || !read("public/ai.html").includes('id="concierge-form"')) {
  throw new Error("public/ai.html is missing the concierge chat or form");
}

if (!read("public/admin.html").includes('data-admin-count="paymentPendingBookings"')) {
  throw new Error("public/admin.html is missing the payment-pending operations metric");
}

if (!read("public/flow.js").includes("renderAdminAvailabilityCalendar") || !read("public/flow.js").includes("payment_pending")) {
  throw new Error("public/flow.js is missing the Phase 1 admin calendar or payment-pending status logic");
}

if (!read("api/payments/checkout.js").includes("createStripeCheckoutSession")) {
  throw new Error("api/payments/checkout.js is not wired to Stripe Checkout");
}

if (!read("api/payments/session.js").includes("retrieveStripeCheckoutSession")) {
  throw new Error("api/payments/session.js is missing Checkout Session verification");
}

if (!read("api/payments/webhook.js").includes("verifyStripeSignature")) {
  throw new Error("api/payments/webhook.js is missing Stripe signature verification");
}

for (const forbidden of [
  "providerReady: false",
  "requires_provider",
  "stripe_checkout_ready",
  "manual_masked_reference",
  "cardNumber",
  "Only masked card details",
  "frontend prototype",
]) {
  for (const file of requiredFiles) {
    if (read(file).includes(forbidden)) {
      throw new Error(`Fake or placeholder payment flow text found in ${file}: ${forbidden}`);
    }
  }
}

for (const match of read("public/flow.js").matchAll(/^  "([^"]+)": \{/gm)) {
  if (!read("public/booking.html").includes(`value="${match[1]}"`)) {
    throw new Error(`flow.js vehicle ${match[1]} is not present in booking.html`);
  }
}

for (const staleRootFile of [
  "booking.html",
  "login.html",
  "account.html",
  "ai.html",
  "admin.html",
  "payment.html",
  "success.html",
  "terms.html",
  "privacy.html",
  "cancellation.html",
  "insurance.html",
  "requirements.html",
  "deposit.html",
  "flow.css",
  "flow.js",
]) {
  if (fs.existsSync(path.join(root, staleRootFile))) {
    throw new Error(`Misplaced root-level static flow file found: ${staleRootFile}`);
  }
}

for (const htmlFile of ["index.html", ...flowPages]) {
  const html = read(htmlFile);
  for (const match of html.matchAll(/(?:href|action|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(https?:|#|\/|mailto:|tel:)/.test(target)) continue;
    const clean = target.split("?")[0];
    if (clean.endsWith(".html") || clean.endsWith(".css") || clean.endsWith(".js")) {
      const resolved = htmlFile.startsWith("public/") ? path.join("public", clean) : clean;
      if (!fs.existsSync(path.join(root, resolved))) {
        throw new Error(`${htmlFile} references missing file: ${target}`);
      }
    }
  }
}

console.log("Velaire active-file verification passed");

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const requiredFiles = [
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/styles.css",
  "booking.html",
  "login.html",
  "account.html",
  "admin.html",
  "payment.html",
  "success.html",
  "terms.html",
  "privacy.html",
  "cancellation.html",
  "rental-requirements.html",
  "deposit-policy.html",
  "flow.css",
  "flow.js",
  "public/booking.html",
  "public/login.html",
  "public/account.html",
  "public/admin.html",
  "public/payment.html",
  "public/success.html",
  "public/terms.html",
  "public/privacy.html",
  "public/cancellation.html",
  "public/rental-requirements.html",
  "public/deposit-policy.html",
  "public/flow.css",
  "public/flow.js",
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
  "api/stripe/webhook.js",
  "api/admin/summary.js",
  "api/admin/vehicles.js",
  "api/admin/bookings.js",
  "api/admin/payments.js",
  "api/admin/customers.js",
  "api/_lib/fleet-data.js",
  "api/_lib/admin-auth.js",
  "api/_lib/http.js",
  "api/_lib/notifications.js",
  "api/_lib/stripe.js",
  "api/_lib/operations-store.js",
  "api/_lib/store.js",
  "vite.config.js",
  "vercel.json",
  "package.json",
];

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const mirroredPublicFiles = [
  "booking.html",
  "login.html",
  "account.html",
  "admin.html",
  "payment.html",
  "success.html",
  "terms.html",
  "privacy.html",
  "cancellation.html",
  "rental-requirements.html",
  "deposit-policy.html",
  "flow.css",
  "flow.js",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing active file: ${file}`);
  }
}

JSON.parse(read("package.json"));

for (const file of mirroredPublicFiles) {
  if (read(file) !== read(`public/${file}`)) {
    throw new Error(`public/${file} must mirror ${file}; stale public overrides break the live Vercel flow`);
  }
}

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
if (!app.includes("/api/fleet?ts=") || !app.includes("mergeOperationsFleet") || !app.includes("cache: \"no-store\"")) {
  throw new Error("Homepage fleet must hydrate pricing from the operations-managed fleet API without cache");
}
if (app.includes("hero-reserve") || app.includes("Quick reserve") || read("src/styles.css").includes(".hero-reserve")) {
  throw new Error("Homepage quick reserve form should not be present");
}
if (
  app.includes('href="#experience"') ||
  app.includes("favourite-button") ||
  read("booking.html").includes("/#experience") ||
  read("payment.html").includes("/#experience") ||
  read("success.html").includes("/#experience") ||
  read("flow.js").includes("Saved locally. Backend sync will resume once the API is available.") ||
  read("src/styles.css").includes("images.unsplash.com/photo-1503736334956") ||
  read("flow.css").includes("images.unsplash.com/photo-1503736334956")
) {
  throw new Error("Removed customer-facing experience/save/local-sync UI must stay removed");
}
for (const page of ["terms.html", "privacy.html", "cancellation.html", "rental-requirements.html", "deposit-policy.html"]) {
  if (!app.includes(page)) {
    throw new Error(`Homepage footer must link to ${page}`);
  }
}
if (!read("src/styles.css").includes('/cars/hero-g63-cinematic.png') || !read("flow.css").includes('/cars/hero-g63-cinematic.png')) {
  throw new Error("Homepage and flow backgrounds must use the local Mercedes G63 AMG asset");
}
if (
  !app.includes("vehicle-media-image") ||
  !read("flow.js").includes("vehiclePhotoMarkup") ||
  !read("src/data/fleet.js").includes("studio-3d-render") ||
  !read("src/data/fleet.js").includes("/cars/studio-lamborghini-urus-2021-orange.png") ||
  !read("src/data/fleet.js").includes("/cars/studio-bmw-m440i-convertible-2022-sky-blue.png") ||
  read("src/data/fleet.js").includes("commons.wikimedia.org")
) {
  throw new Error("Fleet media must use the local premium 3D-style studio visual assets");
}

const studioAssets = [
  "public/cars/studio-tesla-model-3-performance-2020.png",
  "public/cars/studio-lamborghini-urus-2021-orange.png",
  "public/cars/studio-range-rover-sport-svr-2021.png",
  "public/cars/studio-bmw-m440i-convertible-2022-sky-blue.png",
  "public/cars/studio-bmw-m140i-shadow-edition-2019.png",
];

for (const asset of studioAssets) {
  if (!fs.existsSync(path.join(root, asset))) {
    throw new Error(`Missing studio fleet media asset: ${asset}`);
  }
  const publicPath = `/${asset.replace(/^public\//, "")}`;
  if (!read("src/data/fleet.js").includes(publicPath) || !read("flow.js").includes(publicPath) || !read("booking.html").includes(publicPath)) {
    throw new Error(`Booking and fleet pages must share generated studio media: ${publicPath}`);
  }
}

if (
  !read("flow.js").includes("generatedVehicleMedia") ||
  read("flow.js").includes("current.fallbackImagePath = vehicle.fallbackImagePath") ||
  read("src/App.jsx").includes("fallbackImagePath: live.fallbackImagePath")
) {
  throw new Error("Booking and homepage fleet media must stay locked to the generated studio assets, not stale live fallbacks");
}

const vite = read("vite.config.js");
for (const page of [
  "booking.html",
  "login.html",
  "account.html",
  "admin.html",
  "payment.html",
  "success.html",
  "terms.html",
  "privacy.html",
  "cancellation.html",
  "rental-requirements.html",
  "deposit-policy.html",
]) {
  if (!vite.includes(page)) {
    throw new Error(`vite.config.js is missing ${page} as a build input`);
  }
}

for (const file of requiredFiles) {
  const contents = read(file);
  if (/[“”‘’]/.test(contents)) {
    throw new Error(`Curly quote found in ${file}`);
  }
}

for (const page of ["booking.html", "login.html", "account.html", "admin.html", "payment.html", "success.html"]) {
  const html = read(page);
  if (!html.includes('href="flow.css"')) {
    throw new Error(`${page} does not load flow.css`);
  }
  if (!html.includes('type="module" src="/flow.js"') && !html.includes('type="module" src="flow.js"')) {
    throw new Error(`${page} does not load flow.js`);
  }
}

for (const page of ["terms.html", "privacy.html", "cancellation.html", "rental-requirements.html", "deposit-policy.html"]) {
  const html = read(page);
  if (!html.includes('data-page="legal"') || !html.includes('class="legal-stage"') || !html.includes('href="flow.css"')) {
    throw new Error(`${page} must use the premium legal page shell and shared flow.css`);
  }
}

if (
  !read("flow.css").includes(".legal-stage") ||
  !read("flow.css").includes(".legal-toc") ||
  !read("flow.css").includes(".legal-card") ||
  !read("flow.css").includes(".legal-note")
) {
  throw new Error("Legal trust pages must have dedicated premium flow.css styling");
}

const booking = read("booking.html");
if (
  (booking.match(/class="vehicle-media-image"/g) || []).length < 6 ||
  (booking.match(/class="vehicle-media-backup"/g) || []).length < 6 ||
  !booking.includes('src="flow.js"') ||
  !booking.includes("!this.dataset.triedLocal") ||
  !booking.includes("--vehicle-card-image: url('/cars/studio-tesla-model-3-performance-2020.png')") ||
  !booking.includes('data-local-src="public/cars/studio-tesla-model-3-performance-2020.png"') ||
  !booking.includes('data-local-src="public/cars/studio-lamborghini-urus-2021-orange.png"') ||
  !booking.includes('data-local-src="public/cars/studio-range-rover-sport-svr-2021.png"') ||
  !booking.includes('data-local-src="public/cars/studio-bmw-m440i-convertible-2022-sky-blue.png"') ||
  !booking.includes('data-local-src="public/cars/studio-bmw-m140i-shadow-edition-2019.png"')
) {
  throw new Error("Booking page must render generated vehicle images directly, with local-preview fallbacks, before JS hydration");
}

if (
  !read("flow.css").includes(".choice-card .vehicle-media-image") ||
  !read("flow.css").includes(".summary-media .vehicle-media-image") ||
  !read("flow.css").includes(".vehicle-media-backup") ||
  !read("flow.js").includes("node.style.setProperty(\"--vehicle-card-image\"") ||
  !read("flow.css").includes("visibility: visible") ||
  !read("flow.css").includes("isolation: isolate")
) {
  throw new Error("Booking media CSS must keep real vehicle images above the dark studio card layers");
}

for (const match of read("flow.js").matchAll(/^  "([^"]+)": \{/gm)) {
  if (!read("booking.html").includes(`value="${match[1]}"`)) {
    throw new Error(`flow.js vehicle ${match[1]} is not present in booking.html`);
  }
}

if (
  read("flow.js").includes('defaultVehicle = "lamborghini-urus"') ||
  read("api/availability.js").includes('|| "lamborghini-urus"') ||
  !read("flow.js").includes("resolveSelectedVehicleSlug") ||
  !read("flow.js").includes("hydrateFleetPricing") ||
  !read("flow.js").includes("strict: true") ||
  !read("flow.js").includes("dateIsSelectedVehicleBlocked") ||
  !read("flow.js").includes("setupAdmin") ||
  !read("api/availability.js").includes("vehicle_required")
) {
  throw new Error("Booking availability must use the selected vehicle slug and must not fall back to Lamborghini Urus");
}

if (
  !read("api/_lib/operations-store.js").includes("KV_REST_API_URL") ||
  !read("api/_lib/operations-store.js").includes("KV_REST_API_TOKEN") ||
  !read("api/_lib/operations-store.js").includes("KV_REST_API_READ_ONLY_TOKEN") ||
  !read("api/_lib/operations-store.js").includes("REDIS_URL") ||
  !read("api/_lib/operations-store.js").includes("KV_URL") ||
  !read("api/fleet.js").includes("listOperationalVehicles") ||
  !read("api/availability.js").includes("checkPersistedAvailability") ||
  !read("api/bookings.js").includes("createBookingRecord") ||
  !read("api/admin/vehicles.js").includes("updateVehicleOperationsRecord") ||
  !read("vercel.json").includes('"/portal"')
) {
  throw new Error("Operations must use Vercel KV as the shared source of truth for admin and reservation data");
}

if (
  !read("api/_lib/notifications.js").includes("RESEND_API_KEY") ||
  !read("api/_lib/notifications.js").includes("VELAIRE_ADMIN_EMAIL") ||
  !read("api/_lib/notifications.js").includes("sendBookingCreatedNotifications") ||
  !read("api/_lib/notifications.js").includes("sendDepositPaidNotifications") ||
  !read("api/_lib/notifications.js").includes("sendBookingStatusUpdateNotifications") ||
  !read("api/_lib/operations-store.js").includes("sendBookingCreatedNotifications") ||
  !read("api/_lib/operations-store.js").includes("notifications: []") ||
  !read("api/_lib/operations-store.js").includes("recordNotificationEvents") ||
  !read("api/bookings.js").includes("notifications") ||
  !read("api/payments/intent.js").includes("notifications")
) {
  throw new Error("Premium booking notifications must be wired into booking and payment operations");
}

if (
  !read("api/_lib/stripe.js").includes("STRIPE_SECRET_KEY") ||
  !read("api/_lib/stripe.js").includes("checkout/sessions") ||
  !read("api/_lib/stripe.js").includes("STRIPE_WEBHOOK_SECRET") ||
  !read("api/payments/intent.js").includes("createStripeCheckoutSession") ||
  !read("api/payments/intent.js").includes("checkoutUrl") ||
  !read("api/stripe/webhook.js").includes("checkout.session.completed") ||
  !read("api/stripe/webhook.js").includes("deposit_paid") ||
  !read("flow.js").includes("window.location.assign(payment.checkoutUrl)") ||
  !read("payment.html").includes("Create secure deposit session") ||
  read("payment.html").includes('name="card"') ||
  read("payment.html").includes("Ready for a live payment provider when connected")
) {
  throw new Error("Deposit flow must create a real Stripe Checkout session and redirect instead of using a local placeholder payment form");
}

for (const htmlFile of ["index.html", "booking.html", "login.html", "account.html", "admin.html", "payment.html", "success.html"]) {
  const html = read(htmlFile);
  for (const match of html.matchAll(/(?:href|action|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(https?:|#|\/|mailto:|tel:)/.test(target)) continue;
    const clean = target.split("?")[0];
    if (clean.endsWith(".html") || clean.endsWith(".css") || clean.endsWith(".js")) {
      if (!fs.existsSync(path.join(root, clean))) {
        throw new Error(`${htmlFile} references missing file: ${target}`);
      }
    }
  }
}

const store = await import(pathToFileURL(path.join(root, "api/_lib/store.js")).href);
const m140Availability = store.checkVehicleAvailability({
  vehicleSlug: "bmw-m140i-shadow-edition",
  pickup: "2026-06-08",
  returnDate: "2026-06-09",
});
const urusAvailability = store.checkVehicleAvailability({
  vehicleSlug: "lamborghini-urus",
  pickup: "2026-06-08",
  returnDate: "2026-06-09",
});
if (m140Availability.vehicle.slug !== "bmw-m140i-shadow-edition" || !m140Availability.available || m140Availability.conflicts.length) {
  throw new Error("BMW M140i availability is incorrectly reading another vehicle's blocked dates");
}
if (urusAvailability.vehicle.slug !== "lamborghini-urus" || urusAvailability.available || !urusAvailability.conflicts.length) {
  throw new Error("Lamborghini Urus seeded blocked dates are not scoped to Urus");
}

const m140Booking = store.createBooking({
  reservation: {
    vehicle: "bmw-m140i-shadow-edition",
    pickup: "2026-07-01",
    return: "2026-07-03",
    days: "2",
  },
  status: "draft",
});
if (m140Booking.vehicleSlug !== "bmw-m140i-shadow-edition" || m140Booking.totals.deposit !== 600 || m140Booking.totals.hireEstimate !== 350) {
  throw new Error("Booking totals are not using the selected BMW M140i vehicle data");
}

console.log("Velaire active-file verification passed");

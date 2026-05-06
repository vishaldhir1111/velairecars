import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const vehicleSeoPages = [
  "lamborghini-urus-hire-london.html",
  "range-rover-svr-hire-london.html",
  "tesla-model-3-hire-london.html",
  "bmw-m440i-hire-london.html",
  "bmw-m140i-hire-london.html",
];
const localSeoPages = [
  "luxury-car-hire-london.html",
  "luxury-car-hire-mayfair.html",
  "luxury-car-hire-knightsbridge.html",
  "luxury-car-hire-chelsea.html",
  "luxury-car-hire-heathrow.html",
  "wedding-car-hire-london.html",
];
const vehicleSeoPublicPages = vehicleSeoPages.map((file) => `public/${file}`);
const localSeoPublicPages = localSeoPages.map((file) => `public/${file}`);
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
  "areas-served.html",
  ...vehicleSeoPages,
  ...localSeoPages,
  "terms.html",
  "privacy.html",
  "cancellation.html",
  "rental-requirements.html",
  "deposit-policy.html",
  "flow.css",
  "flow.js",
  "robots.txt",
  "sitemap.xml",
  "favicon.svg",
  "public/booking.html",
  "public/login.html",
  "public/account.html",
  "public/admin.html",
  "public/payment.html",
  "public/success.html",
  "public/areas-served.html",
  ...vehicleSeoPublicPages,
  ...localSeoPublicPages,
  "public/terms.html",
  "public/privacy.html",
  "public/cancellation.html",
  "public/rental-requirements.html",
  "public/deposit-policy.html",
  "public/flow.css",
  "public/flow.js",
  "public/robots.txt",
  "public/sitemap.xml",
  "public/favicon.svg",
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
  "api/stripe/webhook.js",
  "api/admin/summary.js",
  "api/admin/vehicles.js",
  "api/admin/bookings.js",
  "api/admin/payments.js",
  "api/admin/customers.js",
  "api/admin/notifications.js",
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
  "areas-served.html",
  ...vehicleSeoPages,
  ...localSeoPages,
  "terms.html",
  "privacy.html",
  "cancellation.html",
  "rental-requirements.html",
  "deposit-policy.html",
  "flow.css",
  "flow.js",
  "robots.txt",
  "sitemap.xml",
  "favicon.svg",
];

const customerHtmlPages = [
  "index.html",
  "booking.html",
  "login.html",
  "account.html",
  "admin.html",
  "payment.html",
  "success.html",
  "areas-served.html",
  ...vehicleSeoPages,
  ...localSeoPages,
  "terms.html",
  "privacy.html",
  "cancellation.html",
  "rental-requirements.html",
  "deposit-policy.html",
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

for (const file of customerHtmlPages) {
  const html = read(file);
  if (!html.includes("window.va") || !html.includes('/_vercel/insights/script.js')) {
    throw new Error(`${file} must include Vercel Web Analytics tracking`);
  }
  if (!html.includes('rel="canonical"') || !html.includes('rel="icon" href="/favicon.svg"') || !html.includes('meta name="theme-color"')) {
    throw new Error(`${file} must include SEO canonical, favicon and theme-color metadata`);
  }
}

for (const file of ["robots.txt", "sitemap.xml", "favicon.svg"]) {
  if (read(file) !== read(`public/${file}`)) {
    throw new Error(`public/${file} must mirror ${file}`);
  }
}

const indexablePages = [
  "index.html",
  "booking.html",
  "areas-served.html",
  ...vehicleSeoPages,
  ...localSeoPages,
  "terms.html",
  "privacy.html",
  "cancellation.html",
  "rental-requirements.html",
  "deposit-policy.html",
];
for (const file of indexablePages) {
  const html = read(file);
  const hasSocialImage =
    html.includes("https://www.velairecars.com/cars/hero-g63-cinematic.png") ||
    html.includes("https://www.velairecars.com/cars/studio-");
  if (
    !html.includes('meta name="robots" content="index, follow"') ||
    !html.includes('property="og:title"') ||
    !html.includes('property="og:description"') ||
    !html.includes('property="og:url"') ||
    !html.includes('name="twitter:card" content="summary_large_image"') ||
    !hasSocialImage
  ) {
    throw new Error(`${file} must include indexable SEO and social preview metadata`);
  }
}

for (const file of ["login.html", "account.html", "admin.html", "payment.html", "success.html"]) {
  if (!read(file).includes('meta name="robots" content="noindex, nofollow"')) {
    throw new Error(`${file} must be noindex/nofollow because it is private or transactional`);
  }
}

if (
  !read("index.html").includes('"@type": "AutoRental"') ||
  !read("index.html").includes("Tesla Model 3 Performance 2020") ||
  !read("index.html").includes("BMW M140i Shadow Edition 2019")
) {
  throw new Error("Homepage must include AutoRental JSON-LD with the Velaire fleet");
}

if (
  read("src/App.jsx").includes("Curated vehicles") ||
  read("src/App.jsx").includes("Concierge support") ||
  read("src/App.jsx").includes("trustItems") ||
  read("src/App.jsx").includes("trustItems.map")
) {
  throw new Error("Homepage trust/stat strip copy must stay removed for the cleaner luxury homepage");
}
if (
  !read("src/App.jsx").includes("specialistServices") ||
  !read("src/App.jsx").includes("Music Videos") ||
  !read("src/App.jsx").includes("Artist Transport") ||
  !read("src/App.jsx").includes("Tailored quotes based on project requirements.") ||
  !read("src/styles.css").includes(".specialist-card") ||
  !read("src/styles.css").includes("--service-image")
) {
  throw new Error("Homepage must include the premium specialist services section");
}

if (
  !read("flow.js").includes("adminHandoverChecklist") ||
  !read("flow.js").includes("Refund pending") ||
  !read("flow.js").includes("data-admin-booking-checklist-form") ||
  !read("api/admin/bookings.js").includes("refund_pending") ||
  !read("api/_lib/operations-store.js").includes("operationsChecklist")
) {
  throw new Error("Operations portal must include booking actions, refund states and the handover checklist");
}

const analyticsEvents = [
  "Booking Started",
  "Car Selected",
  "Vehicle Details Opened",
  "Guest Details Completed",
  "Deposit Button Clicked",
  "Stripe Checkout Opened",
  "Booking Confirmed",
  "Admin Price Updated",
  "Admin Dates Blocked",
  "Admin Booking Status Updated",
  "Admin Manual Booking Created",
  "Admin Handover Checklist Updated",
  "Cinematic Intro Completed",
  "Concierge Prompt Submitted",
  "Specialist Service Quote",
  "Specialist Service WhatsApp",
];
const analyticsSources = `${read("flow.js")}\n${read("src/App.jsx")}`;
if (!analyticsSources.includes("trackVelaireEvent") || !analyticsSources.includes('window.va("event"')) {
  throw new Error("Custom Vercel Analytics events must use the plain HTML window.va event API");
}
for (const eventName of analyticsEvents) {
  if (!analyticsSources.includes(eventName)) {
    throw new Error(`Missing custom analytics event: ${eventName}`);
  }
}
if (
  !read("flow.js").includes("blockedAnalyticsKey") ||
  !read("flow.js").includes("email|phone|name|address|postcode|lat|lng|token|password|secret")
) {
  throw new Error("Custom analytics payloads must redact personal data keys");
}

if (
  !read("robots.txt").includes("Sitemap: https://www.velairecars.com/sitemap.xml") ||
  !read("robots.txt").includes("Disallow: /portal") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/booking.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/areas-served.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/deposit-policy.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/lamborghini-urus-hire-london.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/range-rover-svr-hire-london.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/tesla-model-3-hire-london.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/bmw-m440i-hire-london.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/bmw-m140i-hire-london.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/luxury-car-hire-london.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/luxury-car-hire-mayfair.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/luxury-car-hire-knightsbridge.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/luxury-car-hire-chelsea.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/luxury-car-hire-heathrow.html") ||
  !read("sitemap.xml").includes("https://www.velairecars.com/wedding-car-hire-london.html")
) {
  throw new Error("SEO crawler files must expose public pages and hide private/transaction pages");
}

if (
  !read("src/App.jsx").includes("Clear answers for a smoother handover.") ||
  !read("src/App.jsx").includes("areas-served.html") ||
  !read("src/App.jsx").includes("Popular hire") ||
  !read("src/App.jsx").includes("lamborghini-urus-hire-london.html") ||
  !read("src/App.jsx").includes("luxury-car-hire-mayfair.html") ||
  !read("src/App.jsx").includes("How Velaire works") ||
  !read("src/styles.css").includes(".process-section") ||
  !read("src/styles.css").includes(".seo-link-strip") ||
  !read("src/styles.css").includes(".faq-section") ||
  !read("flow.css").includes(".area-grid") ||
  !read("areas-served.html").includes("Mayfair, Knightsbridge, Belgravia, Chelsea") ||
  !read("areas-served.html").includes("Heathrow, Gatwick, Luton, Stansted, London City")
) {
  throw new Error("Homepage FAQ and Areas Served SEO page must stay wired and styled");
}

for (const page of vehicleSeoPages) {
  const html = read(page);
  if (
    !html.includes('data-page="seo-vehicle"') ||
    !html.includes("seo-vehicle-showcase") ||
    !html.includes("booking.html?vehicle=") ||
    !html.includes('data-fallback-image="/cars/studio-') ||
    !html.includes("Velaire Cars")
  ) {
    throw new Error(`${page} must use the premium vehicle SEO page shell with shared studio media and reservation CTA`);
  }
}
if (
  !read("flow.css").includes(".seo-vehicle-showcase") ||
  !read("flow.css").includes(".seo-spec-grid") ||
  !read("flow.css").includes(".seo-vehicle-media")
) {
  throw new Error("Vehicle SEO pages must have dedicated premium flow.css styling");
}

for (const page of localSeoPages) {
  const html = read(page);
  if (
    !html.includes('data-page="seo-area"') ||
    !html.includes('"@type": "AutoRental"') ||
    !html.includes('"@type": "BreadcrumbList"') ||
    !html.includes("booking.html") ||
    !html.includes("https://www.velairecars.com/cars/hero-g63-cinematic.png")
  ) {
    throw new Error(`${page} must use the premium local SEO shell, structured data and booking CTA`);
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
if (
  !read("package.json").includes('"framer-motion"') ||
  !app.includes('from "framer-motion"') ||
  !app.includes("function VelaireIntroLoader") ||
  !app.includes('introSessionVersion = "showroom-v6-no-text-20260506"') ||
  !app.includes("introSessionKey") ||
  !app.includes("function hasPlayedCurrentIntroSession") ||
  !app.includes("function shouldReplayIntroFromUrl") ||
  !app.includes("sessionStorage.removeItem(introSessionKey)") ||
  !app.includes("sessionStorage.setItem(introSessionKey") ||
  !app.includes("loader-distant-source") ||
  !app.includes("loader-speed-streak") ||
  !app.includes("loader-showroom-floor") ||
  !app.includes("loader-reflection-ripple") ||
  !app.includes("loader-headlight") ||
  !app.includes("loader-light-streak") ||
  !app.includes("loader-car-silhouette") ||
  !app.includes("Cinematic Intro Completed") ||
  !read("src/styles.css").includes(".cinematic-loader") ||
  !read("src/styles.css").includes(".loader-showroom-floor") ||
  !read("src/styles.css").includes(".loader-speed-streak") ||
  !read("src/styles.css").includes(".loader-reflection-ripple") ||
  !read("src/styles.css").includes(".loader-headlight") ||
  !read("src/styles.css").includes(".loader-engine-pulse") ||
  !read("src/styles.css").includes("heroCopyReveal")
) {
  throw new Error("Homepage must include the Framer Motion cinematic Velaire loading animation");
}
if (
  !read("src/styles.css").includes('font-family: "Nexa"') ||
  !read("src/styles.css").includes('url("/Nexa-ExtraLight.ttf")') ||
  !read("src/styles.css").includes('url("/Nexa-Heavy.ttf")') ||
  !read("src/styles.css").includes("--font-sans") ||
  !read("flow.css").includes('font-family: "Nexa"') ||
  !read("flow.css").includes("--font-display") ||
  read("src/styles.css").includes("Georgia, \"Times New Roman\", serif") ||
  read("flow.css").includes("Georgia, \"Times New Roman\", serif")
) {
  throw new Error("The public site and booking flow must be wired to the Nexa typography system");
}
if (!app.includes("/api/fleet?ts=") || !app.includes("mergeOperationsFleet") || !app.includes("cache: \"no-store\"")) {
  throw new Error("Homepage fleet must hydrate pricing from the operations-managed fleet API without cache");
}
if (
  !read("api/fleet.js").includes("sanitisePublicFleetVehicle") ||
  !read("api/fleet.js").includes("publicRanges") ||
  read("api/fleet.js").includes("fleet: vehicles,")
) {
  throw new Error("Public fleet API must sanitise booking/customer data before returning availability");
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
  "areas-served.html",
  ...vehicleSeoPages,
  ...localSeoPages,
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

if (!read("areas-served.html").includes('data-page="areas"') || !read("areas-served.html").includes('class="legal-stage areas-stage"')) {
  throw new Error("areas-served.html must use the premium areas page shell");
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
  !read("admin.html").includes("data-admin-export-bookings") ||
  !read("admin.html").includes("data-admin-export-customers") ||
  !read("admin.html").includes("data-admin-export-payments") ||
  !read("admin.html").includes("data-admin-manual-booking-form") ||
  !read("admin.html").includes('data-admin-filter="query"') ||
  !read("admin.html").includes("data-admin-reminders") ||
  !read("flow.js").includes("exportAdminBookingsCsv") ||
  !read("flow.js").includes("filteredAdminBookings") ||
  !read("flow.js").includes("exportAdminCustomersCsv") ||
  !read("flow.js").includes("exportAdminPaymentsCsv") ||
  !read("flow.js").includes("Admin Manual Booking Created") ||
  !read("flow.js").includes("velaire-bookings-") ||
  !read("flow.css").includes(".admin-filter-panel") ||
  !read("flow.css").includes(".admin-utility-button")
) {
  throw new Error("Operations admin productivity tools must stay wired into the premium bookings section");
}

if (
  !read("booking.html").includes("Clear hold. Human confirmation.") ||
  !read("booking.html").includes("No card details are stored by Velaire") ||
  !read("booking.html").includes("Reservation confidence") ||
  !read("payment.html").includes("Stripe hosted") ||
  !read("payment.html").includes("If checkout is cancelled or fails") ||
  !read("payment.html").includes("Deposit handling") ||
  !read("booking.html").includes("mobile-submit-bar") ||
  !read("payment.html").includes("mobile-submit-bar") ||
  !read("flow.css").includes(".conversion-panel") ||
  !read("flow.css").includes(".payment-trust-grid") ||
  !read("flow.css").includes(".checkout-timeline") ||
  !read("flow.css").includes(".summary-assurance") ||
  !read("flow.css").includes(".mobile-submit-bar") ||
  !read("flow.css").includes("bottom: 10px")
) {
  throw new Error("Booking and payment conversion reassurance must stay wired into the premium reservation flow");
}

if (
  !read("terms.html").includes("Mileage and late return") ||
  !read("terms.html").includes("Prohibited use includes") ||
  !read("rental-requirements.html").includes("Age and licence history") ||
  !read("rental-requirements.html").includes("Insurance conditions and excess") ||
  !read("deposit-policy.html").includes("Deposit return timing") ||
  !read("privacy.html").includes("privacy@velairecars.com") ||
  !read("privacy.html").includes("restriction, objection, portability") ||
  !read("cancellation.html").includes("UK guidance explains")
) {
  throw new Error("Legal trust pages must cover mileage, late return, excess, licence rules, deposit timing and privacy contact details");
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
  !read("api/_lib/notifications.js").includes("sendManualBookingCommunication") ||
  !read("api/_lib/operations-store.js").includes("sendBookingCreatedNotifications") ||
  !read("api/_lib/operations-store.js").includes("sendBookingCommunication") ||
  !read("api/_lib/operations-store.js").includes("notifications: []") ||
  !read("api/_lib/operations-store.js").includes("recordNotificationEvents") ||
  !read("api/admin/notifications.js").includes("sendBookingCommunication") ||
  !read("flow.js").includes("/api/admin/notifications") ||
  !read("flow.js").includes("Resend confirmation") ||
  !read("api/bookings.js").includes("notifications") ||
  !read("api/payments/intent.js").includes("notifications")
) {
  throw new Error("Premium booking notifications must be wired into booking and payment operations");
}

if (
  !read("flow.js").includes("printReceipt") ||
  !read("flow.js").includes("data-admin-print-booking") ||
  !read("flow.js").includes("data-print-confirmation") ||
  !read("flow.css").includes("@media print") ||
  !read("success.html").includes("Reservation receipt") ||
  !read("success.html").includes("Print confirmation")
) {
  throw new Error("Admin and customer receipt printing must stay wired into booking summaries");
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

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
  "flow.css",
  "flow.js",
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
  "api/admin/summary.js",
  "api/admin/vehicles.js",
  "api/admin/bookings.js",
  "api/admin/payments.js",
  "api/admin/customers.js",
  "api/_lib/fleet-data.js",
  "api/_lib/admin-auth.js",
  "api/_lib/http.js",
  "api/_lib/operations-store.js",
  "api/_lib/store.js",
  "vite.config.js",
  "vercel.json",
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
if (!app.includes("/api/fleet?ts=") || !app.includes("mergeOperationsFleet") || !app.includes("cache: \"no-store\"")) {
  throw new Error("Homepage fleet must hydrate pricing from the operations-managed fleet API without cache");
}
if (app.includes("hero-reserve") || app.includes("Quick reserve") || read("src/styles.css").includes(".hero-reserve")) {
  throw new Error("Homepage quick reserve form should not be present");
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

for (const asset of [
  "public/cars/studio-tesla-model-3-performance-2020.png",
  "public/cars/studio-lamborghini-urus-2021-orange.png",
  "public/cars/studio-range-rover-sport-svr-2021.png",
  "public/cars/studio-bmw-m440i-convertible-2022-sky-blue.png",
  "public/cars/studio-bmw-m140i-shadow-edition-2019.png",
]) {
  if (!fs.existsSync(path.join(root, asset))) {
    throw new Error(`Missing studio fleet media asset: ${asset}`);
  }
}

const vite = read("vite.config.js");
for (const page of ["booking.html", "login.html", "account.html", "admin.html", "payment.html", "success.html"]) {
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
  if (!html.includes('type="module" src="/flow.js"')) {
    throw new Error(`${page} does not load flow.js`);
  }
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

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: new URL("./index.html", import.meta.url).pathname,
        booking: new URL("./booking.html", import.meta.url).pathname,
        login: new URL("./login.html", import.meta.url).pathname,
        account: new URL("./account.html", import.meta.url).pathname,
        admin: new URL("./admin.html", import.meta.url).pathname,
        status: new URL("./status.html", import.meta.url).pathname,
        payment: new URL("./payment.html", import.meta.url).pathname,
        success: new URL("./success.html", import.meta.url).pathname,
        terms: new URL("./terms.html", import.meta.url).pathname,
        privacy: new URL("./privacy.html", import.meta.url).pathname,
        cancellation: new URL("./cancellation.html", import.meta.url).pathname,
        rentalRequirements: new URL("./rental-requirements.html", import.meta.url).pathname,
        depositPolicy: new URL("./deposit-policy.html", import.meta.url).pathname,
        areasServed: new URL("./areas-served.html", import.meta.url).pathname,
        lamborghiniUrusHireLondon: new URL("./lamborghini-urus-hire-london.html", import.meta.url).pathname,
        rangeRoverSvrHireLondon: new URL("./range-rover-svr-hire-london.html", import.meta.url).pathname,
        teslaModel3HireLondon: new URL("./tesla-model-3-hire-london.html", import.meta.url).pathname,
        bmwM440iHireLondon: new URL("./bmw-m440i-hire-london.html", import.meta.url).pathname,
        bmwM140iHireLondon: new URL("./bmw-m140i-hire-london.html", import.meta.url).pathname,
        luxuryCarHireLondon: new URL("./luxury-car-hire-london.html", import.meta.url).pathname,
        luxuryCarHireMayfair: new URL("./luxury-car-hire-mayfair.html", import.meta.url).pathname,
        luxuryCarHireKnightsbridge: new URL("./luxury-car-hire-knightsbridge.html", import.meta.url).pathname,
        luxuryCarHireChelsea: new URL("./luxury-car-hire-chelsea.html", import.meta.url).pathname,
        luxuryCarHireHeathrow: new URL("./luxury-car-hire-heathrow.html", import.meta.url).pathname,
        weddingCarHireLondon: new URL("./wedding-car-hire-london.html", import.meta.url).pathname,
      },
    },
  },
});

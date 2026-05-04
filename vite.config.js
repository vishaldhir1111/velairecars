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
        payment: new URL("./payment.html", import.meta.url).pathname,
        success: new URL("./success.html", import.meta.url).pathname,
        terms: new URL("./terms.html", import.meta.url).pathname,
        privacy: new URL("./privacy.html", import.meta.url).pathname,
        cancellation: new URL("./cancellation.html", import.meta.url).pathname,
        rentalRequirements: new URL("./rental-requirements.html", import.meta.url).pathname,
        depositPolicy: new URL("./deposit-policy.html", import.meta.url).pathname,
      },
    },
  },
});

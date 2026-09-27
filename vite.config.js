/**
 * @uso        Config de build Vite (React + Tailwind v4)
 * @funciones  export default defineConfig
 * @datos      N/A
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   Vite CLI (dev/build)
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});

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
  // GIS usa una ventana emergente para devolver el código OAuth al opener.
  // Esta política permite esa comunicación en desarrollo y en `vite preview`.
  server: {
    headers: { "Cross-Origin-Opener-Policy": "same-origin-allow-popups" },
  },
  preview: {
    headers: { "Cross-Origin-Opener-Policy": "same-origin-allow-popups" },
  },
});

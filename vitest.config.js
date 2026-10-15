import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ["vitest.setup.js"],
    environment: "jsdom",
    include: ["src/**/*.test.{js,jsx}"],
    globals: true,
  },
});
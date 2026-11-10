import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import glsl from "vite-plugin-glsl";

const root = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],
  resolve: {
    alias: { "@": resolve(root, "src") },
  },
  build: {
    chunkSizeWarningLimit: 650,
  },
  server: {
    host: true,
  },
});

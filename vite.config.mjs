import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { markerEditorPlugin } from "./scripts/marker-editor-plugin.mjs";

const pagesBase = (process.env.SITE_BASE || "/").replace(/^\/+|\/+$/g, "");

export default defineConfig({
  base: pagesBase ? `/${pagesBase}/` : "/",
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), markerEditorPlugin()],
});

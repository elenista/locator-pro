import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
    rollupOptions: {
      input: "src/index.jsx",
      output: {
        entryFileNames: "index.js",
        assetFileNames: "index.[ext]",
        format: "iife",
      },
    },
  },
});

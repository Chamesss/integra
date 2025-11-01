import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "electron/preload.ts",
      formats: ["cjs"], // Use CommonJS for preload scripts
      fileName: () => "[name].js",
    },
    rollupOptions: {
      external: ["electron"],
    },
    // Don't minify for better debugging
    minify: false,
  },
});

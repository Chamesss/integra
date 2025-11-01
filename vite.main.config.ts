import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    lib: {
      entry: "electron/main.ts",
      formats: ["es"],
      fileName: () => "[name].js",
    },
    rollupOptions: {
      external: ["sqlite3", "sequelize"],
    },
    minify: false,
  },
});

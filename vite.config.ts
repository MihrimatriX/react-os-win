import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages: https://<kullanici>.github.io/react-os-win/
  base: process.env.GITHUB_ACTIONS === "true" ? "/react-os-win/" : "/",
});

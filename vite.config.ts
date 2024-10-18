import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "tailwindcss";
import react from "@vitejs/plugin-react-swc";
import codegen from "vite-plugin-graphql-codegen";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react(), codegen()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});

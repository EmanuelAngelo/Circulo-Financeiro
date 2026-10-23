import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      manifest: {
        name: "Círculo Financeiro",
        short_name: "Círculo",
        description: "Finanças em família, um passo de cada vez.",
        theme_color: "#153d36",
        background_color: "#f6f7f3",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
        runtimeCaching: [],
      },
    }),
  ],
  server: { proxy: { "/api": "http://127.0.0.1:8000" } },
});

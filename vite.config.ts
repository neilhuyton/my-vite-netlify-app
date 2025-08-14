import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Automatically updates the service worker
      devOptions: {
        enabled: true, // Enable PWA features during development
      },
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "maskable-icon.png",
      ], // Assets to cache
      manifest: {
        name: "My Vite Netlify App", // Full name of your app
        short_name: "ViteApp", // Short name for the home screen icon
        description:
          "A weight tracking app built with Vite and deployed on Netlify",
        theme_color: "#ffffff", // Theme color for the app
        background_color: "#ffffff", // Background color for the splash screen
        display: "standalone", // Makes the app look like a native app
        scope: "/", // Scope of the PWA
        start_url: "/", // URL to open when the app is launched
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "/maskable-icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable", // For Android adaptive icons
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"], // Cache static assets
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/.netlify/functions/"), // Cache Netlify functions
            handler: "NetworkFirst", // Try network first, then cache
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8888",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/.netlify/functions"),
      },
    },
  },
});

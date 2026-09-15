import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["icon.svg"],
        manifest: {
          id: "/",
          name: "MentorHUB - AI University Mentoring Intelligence",
          short_name: "MentorHUB",
          description:
            "Google-grade AI university mentoring & student advisory intelligence hub with real-time risk analytics, meeting minutes, and automated action roadmap.",
          theme_color: "#7C3AED",
          background_color: "#0B0817",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "/icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: "/icon.svg",
              sizes: "192x192",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: "/icon.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "any",
            },
            {
              src: "/icon.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^\/api\/(dashboard|students|meetings|issues|actions|notifications|reports|auth\/me).*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "mentorhub-api-cache",
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days cache
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "google-fonts-stylesheets",
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    server: {
      host: "0.0.0.0",
      port: 3000,
    },
  };
});

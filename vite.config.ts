import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      host: true,
      allowedHosts: ["fuel-and-go-hub-production.up.railway.app"]
    },
    preview: {
      host: true,
      allowedHosts: ["fuel-and-go-hub-production.up.railway.app"]
    }
  }
});

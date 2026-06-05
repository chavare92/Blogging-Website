import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL .env vars (including non-VITE_ server-side ones like SUPABASE_SERVICE_ROLE_KEY)
  // into process.env BEFORE any Hono/Drizzle/Supabase modules are evaluated.
  // This is necessary because ES module imports are hoisted, so dotenv.config() in boot.ts
  // runs too late to affect already-evaluated modules.
  const envVars = loadEnv(mode, path.resolve(__dirname), "");
  Object.assign(process.env, envVars);

  // Dev-only: disable TLS certificate verification so Node.js fetch (undici) can make
  // outbound HTTPS calls through corporate SSL-inspection proxies.
  // The browser trusts the corporate CA via the OS cert store; Node.js does not by default.
  if (mode !== "production") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  return {
    plugins: [
      devServer({ entry: "server/boot.ts", exclude: [/^\/(?!api\/).*/] }),
      inspectAttr(), react()],
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@contracts": path.resolve(__dirname, "./contracts"),
        "@db": path.resolve(__dirname, "./db"),
        "db": path.resolve(__dirname, "./db"),
      },
    },
    envDir: path.resolve(__dirname),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router"],
            "vendor-editor": [
              "@tiptap/react",
              "@tiptap/starter-kit",
              "@tiptap/extension-image",
              "@tiptap/extension-link",
              "@tiptap/extension-placeholder",
              "@tiptap/extension-underline",
              "@tiptap/extension-bubble-menu",
            ],
            "vendor-ui": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-select",
              "@radix-ui/react-tooltip",
              "@radix-ui/react-avatar",
              "@radix-ui/react-popover",
              "@radix-ui/react-tabs",
            ],
            "vendor-trpc": [
              "@trpc/client",
              "@trpc/react-query",
              "@tanstack/react-query",
              "superjson",
            ],
          },
        },
      },
    },
  };
});

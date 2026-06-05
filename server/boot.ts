import { config } from "dotenv";
config(); // Must be first — loads .env before any other import reads process.env

import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.get("/api/health", (c) =>
  c.json({ status: "ok", time: new Date().toISOString(), vercel: !!process.env.VERCEL })
);

// Cache public read-only tRPC queries at the Vercel edge for 30s,
// serve stale responses for up to 60s while revalidating in background.
// This eliminates cold start delays for unauthenticated article listings.
app.use("/api/trpc/*", async (c, next) => {
  await next();
  // Only cache GET requests (tRPC queries) for the public post.list endpoint
  const url = c.req.url;
  const isQuery = c.req.method === "GET";
  const isPublicEndpoint = url.includes("post.list") || url.includes("post.byId");
  const hasAuth = c.req.header("authorization");
  if (isQuery && isPublicEndpoint && !hasAuth) {
    c.res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction && !process.env.VERCEL) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

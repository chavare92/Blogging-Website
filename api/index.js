import app from "../dist/boot.js";

// Vercel Web fetch API: use named HTTP method exports OR `export default { fetch }`.
// A plain `export default function handler(req)` is ALWAYS treated as legacy Node.js
// style regardless of parameter count — Vercel ignores the returned Response.
const fetchHandler = (request) => app.fetch(request);

export const GET = fetchHandler;
export const POST = fetchHandler;
export const PUT = fetchHandler;
export const DELETE = fetchHandler;
export const PATCH = fetchHandler;
export const OPTIONS = fetchHandler;

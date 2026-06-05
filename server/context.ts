import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { config as dotenvConfig } from "dotenv";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user: AuthUser | null;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  // Ensure .env vars are loaded. Only sets vars not already in process.env — safe to call
  // on every request (idempotent, no-op after first call).
  dotenvConfig();

  let user: AuthUser | null = null;

  const authHeader = opts.req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !apiKey) {
      console.error("[auth] Missing SUPABASE_URL or key in process.env");
    } else {
      try {
        const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: apiKey,
          },
        });

        if (res.ok) {
          const userData = await res.json() as {
            id: string;
            email?: string;
            user_metadata?: { display_name?: string };
          };
          user = {
            id: userData.id,
            email: userData.email ?? "",
            displayName:
              userData.user_metadata?.display_name ??
              userData.email ??
              "Anonymous",
          };
        } else {
          console.error("[auth] getUser error:", res.status, await res.text());
        }
      } catch (err) {
        console.error("[auth] fetch error:", err);
      }
    }
  }

  return { req: opts.req, resHeaders: opts.resHeaders, user };
}

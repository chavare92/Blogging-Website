// dotenv is loaded once at api/boot.ts startup — no need to import here

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

// Lazy getters — process.env is read on each access, not at module load time.
// This avoids stale values when Vite loads modules before dotenv/loadEnv runs.
export const env = {
  get isProduction() { return process.env.NODE_ENV === "production"; },
  get databaseUrl() { return required("DATABASE_URL"); },
  get dbHost() { return process.env.DB_HOST; },
  get dbPort() { return process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432; },
  get dbUser() { return process.env.DB_USER; },
  get dbPassword() { return process.env.DB_PASSWORD; },
  get dbName() { return process.env.DB_NAME ?? "postgres"; },
  get supabaseUrl() { return required("SUPABASE_URL"); },
  get supabaseAnonKey() { return required("SUPABASE_ANON_KEY"); },
  get supabaseServiceRoleKey() { return required("SUPABASE_SERVICE_ROLE_KEY"); },
  get appBaseUrl() { return process.env.APP_BASE_URL ?? "http://localhost:5173"; },
};

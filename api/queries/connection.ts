import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    // Use explicit options if individual DB_* vars are set (avoids URL password-encoding issues)
    const clientOptions = env.dbHost
      ? {
          host: env.dbHost,
          port: env.dbPort,
          database: env.dbName,
          username: env.dbUser,
          password: env.dbPassword,
          ssl: "require" as const,
          prepare: false,
        }
      : { prepare: false };

    const client = env.dbHost
      ? postgres(clientOptions)
      : postgres(env.databaseUrl, { prepare: false, ssl: "require" });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

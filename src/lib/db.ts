import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy singleton so the build (prerender) never needs DATABASE_URL —
// only on-demand /api and /admin routes touch the DB at runtime.
let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 5, idle_timeout: 20 });
  _db = drizzle(sql, { schema });
  return _db;
}

export { schema };

import { mkdir } from "node:fs/promises";
import { drizzle } from "drizzle-orm/libsql";
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from "$env/static/private";

await mkdir("data");
export const db = drizzle({
  connection: {
    url: "file:data/turso.db",
    syncUrl: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
    syncInterval: 60,
  },
});

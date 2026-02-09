import { mkdir } from "node:fs/promises";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

await mkdir("data").catch(() => {});
export const db = drizzle({
  connection: {
    url: "file:data/turso.db",
  },
});

await migrate(db, { migrationsFolder: "drizzle" });

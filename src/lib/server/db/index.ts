import { mkdir } from "node:fs/promises";
import { drizzle } from "drizzle-orm/libsql";

await mkdir("data");
export const db = drizzle({
  connection: {
    url: "file:data/turso.db",
  },
});

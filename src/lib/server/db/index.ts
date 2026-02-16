import { mkdir } from "node:fs/promises";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { seed } from "drizzle-seed";
import * as schema from "./schema";

await mkdir("data").catch(() => {});
export const db = drizzle({
  connection: {
    url: "file:data/turso.db",
  },
  schema,
});

await migrate(db, { migrationsFolder: "drizzle" });
// @ts-expect-error stupid ts
await seed(db, { students: schema.students }).refine((f) => ({
  students: {
    columns: {
      id: f.int({
        minValue: 1000000000,
        maxValue: 9999999999,
        isUnique: true,
      }),
      name: f.fullName(),
      room: f.int({
        minValue: 11,
        maxValue: 69,
      }),
    },
    count: 2919,
  },
}));

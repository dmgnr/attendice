/** biome-ignore-all lint/suspicious/noExplicitAny: error type */

import { mkdir } from "node:fs/promises";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { seed } from "drizzle-seed";
import * as schema from "./schema";

await mkdir("data").catch(() => {});
export const db = drizzle("data/sqlite.db", {
  schema,
});

await migrate(db, { migrationsFolder: "drizzle" });
if (!(await db.$count(schema.students)))
  // @ts-expect-error stupid ts
  await seed(db, { students: schema.students })
    .refine((f) => ({
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
    }))
    .catch((e: any) => console.error("Cannot seed", e.cause || e));

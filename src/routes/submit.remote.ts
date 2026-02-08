import { inspect } from "node:util";
import { eq, sql } from "drizzle-orm";
import z from "zod";
import { query } from "$app/server";
import { db } from "../lib/server/db";
import { attendances, students } from "../lib/server/db/schema";

export const submitUid: (obj: {
  uid: string;
  pict: string | undefined;
}) => Promise<
  | { status: 404 | 409; student: undefined }
  | { status: 200; student: typeof students.$inferSelect }
> = query(
  z.object({
    uid: z.string().min(10).regex(/^\d+$/),
    pict: z.string().optional(),
  }),
  async ({ uid, pict }) => {
    let res: { id: string }[];
    try {
      res = await db
        .insert(attendances)
        .values({
          student: uid,
          pict: pict ? await fetch(pict).then((r) => r.blob()) : "",
        })
        .onConflictDoNothing()
        .returning({ id: attendances.id });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err &&
        "cause" in err &&
        typeof err.cause === "object" &&
        err.cause &&
        "code" in err.cause &&
        (err.cause.code === "SQLITE_CONSTRAINT" ||
          ("message" in err.cause &&
            typeof err.cause.message === "string" &&
            err.cause.message.includes("SQLITE_CONSTRAINT")))
      ) {
        return { status: 404 };
      }
      console.log(inspect(err, { showHidden: true, depth: null }));
      throw err;
    }

    if (!res.length) return { status: 409 };

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, uid))
      .limit(1);

    return { status: 200, student };
  },
);

export const getStats = query(async () => {
  const res = await db.run(sql<{ label: string }>`
    SELECT
      present || '/' || total AS label
    FROM (
      SELECT
        COALESCE(SUM(
          CASE
            WHEN ${attendances.type} = 'in' THEN 1
            WHEN ${attendances.type} = 'out' THEN -1
          END
        ), 0) AS present
      FROM ${attendances}
      WHERE ${attendances.day} = date(datetime('now', '+7 hours'))
    ),
    (
      SELECT COUNT(*) AS total FROM ${students}
    );
  `);
  return res.rows[0]?.label?.toString() || "";
});

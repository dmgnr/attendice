import { inspect } from "node:util";
import { eq, sql } from "drizzle-orm";
import z from "zod";
import { command, query } from "$app/server";
import { db } from "../../lib/server/db";
import { attendances, students } from "../../lib/server/db/schema";

export const submitUid: (obj: {
  uid: string;
  pict: string | undefined;
}) => Promise<
  | { status: 404 | 409; student: undefined }
  | { status: 200; student: typeof students.$inferSelect }
> = command(
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
          pict: pict
            ? Buffer.from(await fetch(pict).then((r) => r.bytes()))
            : "",
        })
        .onConflictDoNothing()
        .returning({ id: attendances.id });
    } catch (err: unknown) {
      if (
        z
          .object({
            cause: z
              .object({ code: z.string().includes("SQLITE_CONSTRAINT") })
              .or(
                z.object({
                  message: z.string().includes("SQLITE_CONSTRAINT"),
                }),
              ),
          })
          .safeParse(err).success
      ) {
        return { status: 404 } as const;
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

import { sql } from "drizzle-orm";
import { db } from "./db";
import { attendances, students } from "./db/schema";

export async function getStats() {
  const res = await db.run(sql<{ label: string }>`
    SELECT
      present || '/' || total AS label
    FROM (
      SELECT
        COUNT(*) AS present
      FROM ${students}
      WHERE
        EXISTS (
          SELECT 1
          FROM ${attendances}
          WHERE
            ${attendances.student} = ${students.id}
            AND ${attendances.day} = date(datetime('now', '+7 hours'))
            AND ${attendances.type} = 'in'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM ${attendances}
          WHERE
            ${attendances.student} = ${students.id}
            AND ${attendances.day} = date(datetime('now', '+7 hours'))
            AND ${attendances.type} = 'out'
        )
    ),
    (
      SELECT COUNT(*) AS total FROM ${students}
    );
  `);
  return res.rows[0]?.label?.toString() || "";
}

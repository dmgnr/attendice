import { inspect } from "node:util";
import { eq } from "drizzle-orm";
import z from "zod";
import { command } from "$app/server";
import { getStats } from "$lib/server/queries";
import { sse } from "$lib/server/redis";
import { db } from "../../lib/server/db";
import { attendances, students } from "../../lib/server/db/schema";

export const submitUid: (
  uid: string,
) => Promise<
  | { status: 404 | 409; student: undefined; id: undefined }
  | { status: 200; student: typeof students.$inferSelect; id: string }
> = command(z.string().min(10).regex(/^\d+$/), async (uid) => {
  let res: { id: string }[];
  try {
    res = await db
      .insert(attendances)
      .values({
        student: uid,
      })
      .onConflictDoNothing()
      .returning({ id: attendances.id });

    getStats().then((stats) =>
      sse.publish("main", {
        event: "stats",
        data: stats,
      }),
    );
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

  return { status: 200, student, id: res[0].id };
});

export const uploadPicture = command(
  z.object({ id: z.string(), pict: z.string() }),
  async ({ id, pict }) => {
    return await db
      .update(attendances)
      .set({
        pict: pict ? parseDataUriImage(pict) : null,
      })
      .where(eq(attendances.id, id))
      .returning({ id: attendances.id })
      .then((e) => ({ status: e.length ? 200 : 404 }));
  },
);

function parseDataUriImage(input: string, maxBytes = 2_000_000) {
  if (!input.startsWith("data:")) throw new Error("Invalid data URI");

  const comma = input.indexOf(",");
  if (comma === -1) throw new Error("Malformed data URI");

  const meta = input.slice(5, comma); // after "data:"
  const data = input.slice(comma + 1);

  const [mime, ...flags] = meta.split(";");
  if (!["image/jpeg", "image/png", "image/webp"].includes(mime))
    throw new Error("Unsupported type");

  if (!flags.includes("base64")) throw new Error("Expected base64");

  const approx = Math.floor((data.length * 3) / 4);
  if (approx > maxBytes) throw new Error("Too large");

  const buf = Buffer.from(data, "base64");
  if (buf.length > maxBytes) throw new Error("Too large");

  return buf;
}

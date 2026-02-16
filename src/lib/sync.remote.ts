import { error } from "@sveltejs/kit";
import { gt } from "drizzle-orm";
import z from "zod";
import { command, query } from "$app/server";
import { PAGE_KEY } from "$env/static/private";
import { hashText } from "./hash";
import { db } from "./server/db";
import { attendances, students } from "./server/db/schema";
import { convertToPublicAttEntry } from "./server/queries";

export const retrieveSync = query(
  z.tuple([
    PAGE_KEY ? z.string().length(PAGE_KEY.length) : z.null(),
    z.uuidv7().nullable(),
  ]),
  async ([key, id]) => {
    if (PAGE_KEY && key !== PAGE_KEY) error(401);
    const resWithUid = await db
      .select({
        id: attendances.id,
        uid: attendances.student,
        type: attendances.type,
        day: attendances.day,
      })
      .from(attendances)
      .where(id ? gt(attendances.id, id) : undefined);
    return await Promise.all(resWithUid.map(convertToPublicAttEntry));
  },
);

export const getHashes = command(
  z.tuple([
    PAGE_KEY ? z.string().length(PAGE_KEY.length) : z.null(),
    z.number().gte(0),
  ]),
  async ([key, c]) => {
    if (PAGE_KEY && key !== PAGE_KEY) error(401);
    const count = await db.$count(students);
    if (c === count) return null;
    const ids = await db
      .select({
        id: students.id,
      })
      .from(students);
    return await Promise.all(
      ids.map(async (e) => ({ hash: await hashText(e.id) })),
    );
  },
);

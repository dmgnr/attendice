import { get, writable } from "svelte/store";
import { hashText } from "./hash";
import { db } from "./local";
import { getHashes, retrieveSync } from "./sync.remote";

const syncLockAttendance = writable(false);
const syncLockStudents = writable(false);

export async function syncAttendance(key: string | null) {
  if (get(syncLockAttendance)) return;
  syncLockAttendance.set(true);
  const [last] = await db.attend.reverse().limit(1).sortBy("id");
  const lastId = last ? last.id : null;
  console.log("Syncing from", lastId);
  const res = await retrieveSync([key, lastId]);
  console.log("Got", res.length, "attendance entries");
  await db.attend.bulkAdd(res);
  setTimeout(syncLockAttendance.set.bind(undefined, false), 1000);
}

export async function syncStudentsList(key: string | null) {
  if (get(syncLockStudents)) return;
  syncLockStudents.set(true);
  const count = await db.hashes.count();
  console.log("Syncing students list");
  const res = await getHashes([key, count]);
  if (!res) return console.log(`Students list upto date (${count})`);
  console.log("Got", res.length, "students entries");
  await db.transaction("rw", db.hashes, async (tx) => {
    await tx.hashes.clear();
    await tx.hashes.bulkAdd(res);
  });
  setTimeout(syncLockStudents.set.bind(undefined, false), 1000);
}

export async function checkLocal(uid: string): Promise<200 | 404 | 409> {
  // attempt to reconstruct day and type with exact same format as server's
  const hash = await hashText(uid);
  // YYYY-MM-DD
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
  }).format(new Date());
  const type = (new Date().getUTCHours() + 7) % 24 >= 12 ? "out" : "in";
  const found = await db.hashes.get({ hash });
  if (!found) return 404;
  const existing = await db.attend.get({ hash, day, type });
  if (existing) return 409;
  // doing this will cause UUID difference, therefore conflict
  // await db.attend.add({ id: uuidv7(), hash, day, type });
  return 200;
}

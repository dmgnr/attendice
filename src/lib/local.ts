import Dexie, { type EntityTable } from "dexie";

export interface LocalHash {
  hash: string;
}

export interface LocalAttendance {
  id: string;
  hash: string;
  day: string;
  type: string;
}

export const db = new Dexie("LocalSync") as Dexie & {
  hashes: EntityTable<LocalHash, "hash">;
  attend: EntityTable<LocalAttendance, "hash">;
};

db.version(1).stores({
  hashes: "&hash",
  attend: "id, &[hash+day+type]",
});

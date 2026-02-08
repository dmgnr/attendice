import { sql } from "drizzle-orm";
import {
  blob,
  index,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";

export const students = sqliteTable("students", {
  id: text().primaryKey(),
  name: text().notNull(),
  room: text().notNull(),
});

export const attendances = sqliteTable(
  "attendances",
  {
    id: text().primaryKey().$default(uuidv7),
    student: text()
      .references(() => students.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    time: text()
      .notNull()
      .$default(() => new Date().toISOString()),
    type: text()
      .notNull()
      .$type<"in" | "out">()
      .$default(() =>
        (new Date().getUTCHours() + 7) % 24 >= 12 ? "out" : "in",
      ),
    day: text().generatedAlwaysAs(sql`date(datetime("time", '+7 hours'))`),
    pict: blob(),
  },
  (t) => [
    uniqueIndex("attendance_unique_per_day").on(t.student, t.type, t.day),
    index("attendance_day_index").on(t.day),
  ],
);

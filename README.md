# Attendice

Tablet-friendly attendance kiosk built with SvelteKit. It captures a student UID from a card reader (keyboard emulation), optionally takes a camera snapshot, and records attendance into a local SQLite (libsql) database. The UI is optimized for a full-screen tablet kiosk and displays live time plus present/total stats.

## Features
- One-tap kiosk flow: swipe card -> log attendance -> show confirmation card.
- Optional camera snapshot stored with the attendance record.
- Live status panel with current time, online indicator, and daily present/total stats.
- Automatic in/out mode: before noon = "in", after noon = "out" (Asia/Bangkok).
- Idle mode outside 05:00-20:00 (Asia/Bangkok) to reduce on-screen clutter.
- Optional page key gate via query param.

## Tech stack
- SvelteKit (Svelte 5 runes) + Vite
- Tailwind CSS v4 + tw-animate-css
- Drizzle ORM + libsql (SQLite)
- Svelte remote functions (experimental)

## Project structure
- `src/routes/tablet`: kiosk page + server access guard + remote functions
- `src/lib/components`: UI pieces (camera, card, idle overlay, time display, UID input)
- `src/lib/server/db`: Drizzle setup + schema
- `drizzle/`: migrations
- `data/turso.db`: local SQLite database (also used in Docker via volume)

## Requirements
- Node.js (or Bun) for local dev
- A camera-capable device if you want snapshots

## Local development
Install dependencies:

```sh
npm install
```

Run the dev server:

```sh
npm run dev
```

Build and preview:

```sh
npm run build
npm run preview
```

## Docker
Build and run with Compose:

```sh
docker compose up --build
```

By default the app is exposed on `http://localhost:8806`. The database persists in `./data`.

## Configuration
Optional environment variables:

```
PAGE_KEY=your-secret
```

If `PAGE_KEY` is set, you must open the kiosk as:

```
/tablet?k=your-secret
```

Without a matching key, the page returns 404.

## Database
The database lives at `data/turso.db` (SQLite). Migrations in `drizzle/` are applied on startup.

Schema summary:
- `students`: `id`, `name`, `room`
- `attendances`: `id`, `student`, `time`, `type` (`in`/`out`), `day`, `pict`

Attendance constraints:
- One `in` and one `out` per student per day (unique index on `student`, `type`, `day`)

You must populate `students` before the kiosk can log attendance for a UID.

## Kiosk flow
1. Card reader sends a UID (10+ digits).
2. Server logs attendance and returns student details.
3. UI shows a confirmation card (and photo if available).

## Notes
- Time calculations use the Asia/Bangkok timezone.
- The camera snapshot is stored as a binary blob in SQLite.

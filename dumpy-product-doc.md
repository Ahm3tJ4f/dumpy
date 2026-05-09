# Dumpy — Product Documentation

## Overview

Dumpy is a local-first, minimalist photo dump app for iOS and Android built with Expo (React Native). The core idea is simple: users capture or select photos throughout their day, submit them as a "dump" for that date, and browse their visual diary through a calendar-based interface. All data is stored on-device — no accounts, no cloud sync, no backend.

---

## Core Concept

A "dump" is a collection of up to 10 ordered photos tied to a single calendar date. Each date can have exactly one dump. Users can add to, reorder, or delete photos from a dump at any time. The calendar is the primary navigation metaphor — time is the index, photos are the content.

---

## Screens

### 1. Year View (Home Screen)

The default screen. Shows a vertical `FlatList` of month grids for the current year, from January through the current month. The header displays the current year with left/right chevrons for year navigation.

**Header:**
```
< 2026 >
```

**Layout:** Each month is rendered as a labeled section:

```
January
[ grid ]

February
[ grid ]

...

May
[ grid ]
```

**Month Grid behavior:**
- Each grid renders 28–31 cells depending on the month's actual day count.
- Cells are laid out as a 7-column `flexWrap` row grid (Mo–Su labels above).
- Empty days (no dump) render as a neutral rounded square.
- Days with a dump render the first photo as the foreground image and, if more than one photo exists, the second photo as a tilted, semi-transparent background peek.
- Tapping a month grid navigates to the Month Detail screen for that month.

**Data loaded:** One SQL query per year — all photo rows for `LIKE '2026-%'`, grouped in JS by date. Each cell reads at most 2 URIs from that grouped map.

---

### 2. Month Detail Screen

Reached by tapping a month grid on the Year View. Shows all dumps for that month as a scrollable vertical list of day cards.

**Navigation param:** `month: "2026-05"`

**Card layout per day:**

```
19, Thu
[ photo stack thumbnail ]

20, Fri
[ photo stack thumbnail ]
```

- Days with no dump are not shown — only days that have at least one photo appear.
- The photo stack thumbnail shows a stacked preview of the dump's photos (similar peek-behind style as the grid cells).
- Tapping a day card navigates to the Day Gallery screen for that date.

**Data loaded:** Filtered from the year query cache — no additional DB hit needed in most cases. Falls back to a scoped query `LIKE '2026-05-%'` if the year cache is stale or unavailable.

---

### 3. Day Gallery Screen

Reached by tapping a day card on the Month Detail screen. Shows the full ordered photo array for that date in a horizontally swipeable gallery.

**Navigation params:** `date: "2026-05-19"`

**Behaviors:**
- Swipe left/right to move between photos.
- A reorder mode allows the user to drag photos into a new order (updates `sort_order` in the DB).
- Each photo has a delete button. Deleting the last photo removes the dump entry visually (the cell on the calendar becomes empty).
- A camera/add button in the corner allows adding more photos to the same dump (up to the 10-photo limit).

**Data loaded:** `SELECT * FROM photos WHERE date = '2026-05-19' ORDER BY sort_order` — small, fast, direct.

---

### 4. Camera Flow (Modal)

A modal overlay accessible from a persistent camera button present on both the Year View and Month Detail screen. Always targets **today's date**.

**Flow:**
1. User taps camera button.
2. Camera opens (via `expo-camera` or `expo-image-picker`).
3. User captures or selects a photo.
4. A preview screen shows the photo with Confirm / Retake options.
5. On confirm:
   - The image is copied to `FileSystem.documentDirectory` for permanent local storage.
   - A new `photos` row is inserted with today's date and the next available `sort_order`.
6. User can add more photos (up to 10) or dismiss the modal.
7. On dismiss, the Year View cache is invalidated and grids re-render with the new photo.

**Limit:** Maximum 10 photos per date. The add button is hidden once the limit is reached.

---

## Data Model

### Storage Stack

| Layer | Technology | Purpose |
|---|---|---|
| Structured data | SQLite via `expo-sqlite` + Drizzle ORM | Photo metadata, dates, sort order |
| Image files | `expo-file-system` (documentDirectory) | Permanent local image storage |
| App state / cache | TanStack Query | Per-year query cache, mutation invalidation |

### Schema

```ts
// drizzle schema — src/db/schema.ts

export const photos = sqliteTable("photos", {
  id:        text("id").primaryKey(),           // uuid
  date:      text("date").notNull(),            // "2026-05-19"
  uri:       text("uri").notNull(),             // file:// local path
  sortOrder: integer("sort_order").notNull(),
  createdAt: integer("created_at").notNull(),   // unix timestamp ms
})

// Index on date for fast range queries
// CREATE INDEX idx_photos_date ON photos(date)
```

No separate `entries` table — `date` is the natural grouping key. All dump-level operations (add, delete, reorder) operate directly on the `photos` table filtered by `date`.

---

## Query Patterns

| Intent | Query |
|---|---|
| All photos in a year | `WHERE date LIKE '2026-%' ORDER BY date, sort_order` |
| All photos in a month | `WHERE date LIKE '2026-05-%' ORDER BY date, sort_order` |
| All photos for a day | `WHERE date = '2026-05-19' ORDER BY sort_order` |
| Reorder photo | `UPDATE photos SET sort_order = ? WHERE id = ?` |
| Delete photo | `DELETE FROM photos WHERE id = ?` |
| Add photo | `INSERT INTO photos (id, date, uri, sort_order, created_at) VALUES (...)` |

---

## State & Data Flow

```
App boots
  └── TanStack Query: fetch all photos for current year
      → cached under key ['photos', '2026']

YearScreen
  └── reads ['photos', '2026'] from cache
  └── JS groups by month → each MonthGrid receives its slice
  └── year navigation (< >) → triggers ['photos', '2025'] query

MonthScreen
  └── JS filters ['photos', '2026'] by month prefix
  └── no new DB query in the happy path

DayGallery
  └── JS filters from cache OR direct query ['photos', 'day', '2026-05-19']
  └── mutations → invalidate ['photos', '2026'] → YearScreen + MonthScreen refresh

CameraFlow
  └── writes image to FileSystem.documentDirectory
  └── inserts row into SQLite
  └── invalidates ['photos', year] → grids re-render
```

---

## Navigation Structure

```
Stack Navigator
├── YearScreen (default)         — header: < 2026 >
├── MonthScreen                  — param: month ("2026-05")
└── DayScreen                    — param: date ("2026-05-19")

Modal (over any screen)
└── CameraFlow                   — always targets today's date
```

Navigation library: Expo Router — consistent with the existing Expo project setup.

---

## Constraints & Rules

- **One dump per date.** A date maps to exactly one ordered photo collection. No multiple dumps per day.
- **Maximum 10 photos per dump.** The camera/add button is disabled once 10 photos exist for the current date.
- **Local only.** No user accounts, no network requests, no cloud backup in v1.
- **Permanent image storage.** Photos are copied to `FileSystem.documentDirectory` immediately on capture. They persist across app restarts.
- **No past-date capture via camera button.** The camera button always targets today. Past dumps can be edited (reorder/delete) but not added to via the floating camera — only via the Day Gallery's inline add button.

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | Expo (React Native) |
| Navigation | Expo Router |
| Database | `expo-sqlite` + Drizzle ORM |
| File storage | `expo-file-system` |
| Camera / picker | `expo-camera` / `expo-image-picker` |
| Image rendering | `expo-image` |
| Server state | TanStack Query (`@tanstack/react-query`) |
| Styling | StyleSheet (React Native) + custom design tokens |

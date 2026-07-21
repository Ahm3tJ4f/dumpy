# Dumpy

A local first, minimalist photo dump app for iOS and Android. Capture or select photos throughout your day, submit them as a dump for that date, and browse your visual diary through a calendar.

All data lives on-device — no accounts, no cloud sync, no backend.

## Get started

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Tech stack

| Concern | Library |
|---|---|
| Framework | Expo (React Native) |
| Navigation | Expo Router (file-based) |
| Database | `expo-sqlite` + Drizzle ORM |
| Image storage | `expo-file-system` |
| Image rendering | `expo-image` |
| Camera / picker | `expo-image-picker` |
| State / cache | TanStack Query |
| Animations | React Native Reanimated |
| Gestures | React Native Gesture Handler |
| Styling | StyleSheet + custom design tokens |

## Project structure

```
src/
├── app/                  # Expo Router screens (_layout, index, [year]/[month]/[day])
├── screens/
│   └── year-view/        # Year view screen and subcomponents (month grid, footer, header)
├── shared/
│   ├── db/               # Drizzle schema, client, migrations
│   ├── hooks/            # Shared hooks (safe area, reduced motion, theme color)
│   └── theme/            # Colors, typography, theme tokens
├── assets/
│   └── theme/            # Legacy theme files (being migrated to src/shared/theme)
└── drizzle/              # Drizzle Kit migrations
```

## How it works

- Tap the camera in the footer to capture or pick a photo — it's assigned to today's date
- Browse your year in month grids — each cell shows a peek of that day's photos
- Swipe left/right or tap chevrons to move between years
- Tap a month cell to see all dumps for that month
- Tap a day to view, reorder, or delete photos in the full gallery
- Max 10 photos per day, one dump per date

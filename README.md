# Bitácora — Offline Travel Journal PWA

A progressive web app for recording travel diaries offline. Built with React, TypeScript, Tailwind CSS v4, and Vite.

## Features

- **Offline-first** — works without internet after first load (service worker + precache)
- **Installable** — add to home screen as a standalone app (full PWA manifest)
- **Trip management** — create, edit, and delete trips
- **Daily entries** — add days/stages to each trip with title, description, and geolocation
- **Swipe to delete** — swipe left on mobile to reveal the delete button
- **Unsaved changes guard** — warns before navigating away with unsaved edits
- **Export** — copy any trip as formatted text to share via email or WhatsApp
- **Mobile-first** — touch-friendly UI, safe area support, responsive layout

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 (data router) |
| PWA | vite-plugin-pwa (Workbox) |
| Persistence | localStorage |
| Geolocation | Navigator API |

## Getting Started

```bash
npm install
npm run dev       # development server with HMR
npm run build     # production build + SW precache
npm run preview   # preview production build offline
```

## Project Structure

```
src/
├── types.ts                   # Trip & Day interfaces
├── hooks/
│   ├── useLocalStorage.ts     # generic localStorage hook
│   └── useTrips.tsx           # shared trips context
├── utils/
│   └── export.ts              # text formatting & clipboard
├── components/
│   ├── Layout.tsx             # header + back + unsaved guard
│   ├── ConfirmDialog.tsx      # confirmation modal
│   └── SwipeableItem.tsx      # swipe-to-delete wrapper
├── pages/
│   ├── Home.tsx               # trip list + create
│   ├── TripDetail.tsx         # trip editor + day list + export
│   └── DayDetail.tsx          # day editor + geolocation
├── App.tsx                    # routes
└── main.tsx                   # entry point
```

## Data Model

```ts
type Trip = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  days: Day[]
}

type Day = {
  id: string
  title: string
  description: string
  lat?: number
  lng?: number
  createdAt: number
  updatedAt: number
}
```

All data is persisted in `localStorage` under the `logbook_trips` key.

## License

MIT

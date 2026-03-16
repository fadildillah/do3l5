# Do3l'5

A personal analog film roll archive — built as a mobile-first progressive web app with a dark, cinematic aesthetic.

Track your film rolls from shooting through development, upload scans, and browse your archive in a minimal gallery interface.

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Database** — [Supabase](https://supabase.com/) (PostgreSQL)
- **Image Storage** — [Cloudinary](https://cloudinary.com/) via `next-cloudinary`
- **Styling** — Tailwind CSS 4 + custom CSS variables
- **Language** — TypeScript
- **PWA** — Service worker + web manifest for installable app experience

## Features

- **Roll Management** — Create, edit, and delete film rolls with metadata (film stock, camera, ISO, process, lab, location, dates, notes)
- **Roll Status Tracking** — Track rolls through `shooting` → `undeveloped` → `developed` stages
- **Photo Uploads** — Upload scanned frames to Cloudinary, linked to specific rolls
- **Photo Grid & Lightbox** — Browse photos in a responsive grid with a full-screen lightbox viewer
- **Cover Photos** — Set a cover photo for each roll
- **Favorites** — Mark individual frames as favorites
- **Mobile-First Design** — Optimized for phones with safe-area insets, large touch targets, and responsive typography
- **PWA Support** — Installable as a standalone app on mobile devices

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project
- A [Cloudinary](https://cloudinary.com/) account

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Installation

```bash
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── rolls/            # CRUD endpoints for rolls
│   │   ├── photos/           # Photo management endpoints
│   │   └── upload/           # Cloudinary upload endpoint
│   ├── rolls/[id]/           # Roll detail & edit pages
│   ├── upload/               # New roll creation page
│   ├── layout.tsx            # Root layout with PWA setup
│   ├── page.tsx              # Home — roll archive listing
│   └── globals.css           # Design system & global styles
├── components/
│   ├── RollCard.tsx           # Roll preview card
│   ├── PhotoGrid.tsx          # Responsive photo grid
│   ├── PhotoUploader.tsx      # Drag-and-drop photo upload
│   ├── Lightbox.tsx           # Full-screen photo viewer
│   └── InteractiveLink.tsx    # Enhanced link component
├── lib/
│   ├── supabase.ts            # Supabase client
│   └── cloudinary.ts          # Cloudinary client
└── types/
    └── index.ts               # TypeScript type definitions
```

## API Routes

| Method   | Endpoint          | Description             |
| -------- | ----------------- | ----------------------- |
| `GET`    | `/api/rolls`      | List all rolls          |
| `POST`   | `/api/rolls`      | Create a new roll       |
| `GET`    | `/api/rolls/:id`  | Get a single roll       |
| `PATCH`  | `/api/rolls/:id`  | Update a roll           |
| `DELETE` | `/api/rolls/:id`  | Delete a roll           |
| `POST`   | `/api/upload`     | Upload photo to Cloudinary |
| `GET`    | `/api/photos`     | List/manage photos      |

## Database Schema

### `rolls`

| Column           | Type      | Description                     |
| ---------------- | --------- | ------------------------------- |
| `id`             | uuid      | Primary key                     |
| `roll_number`    | integer   | Sequential roll number          |
| `film_stock`     | text      | Film stock name                 |
| `camera`         | text      | Camera used                     |
| `iso`            | integer   | Film ISO/ASA                    |
| `process`        | text      | Development process (C-41, etc) |
| `frames_total`   | integer   | Total frames on roll            |
| `status`         | text      | `shooting` / `undeveloped` / `developed` |
| `date_started`   | date      | Date roll was loaded            |
| `date_finished`  | date      | Date roll was finished          |
| `date_developed` | date      | Date roll was developed         |
| `lab`            | text      | Development lab                 |
| `location`       | text      | Shooting location               |
| `notes`          | text      | Additional notes                |
| `cover_photo_id` | text      | Reference to cover photo        |
| `created_at`     | timestamp | Record creation time            |

### `photos`

| Column         | Type      | Description               |
| -------------- | --------- | ------------------------- |
| `id`           | uuid      | Primary key               |
| `roll_id`      | uuid      | Foreign key → rolls       |
| `frame_number` | integer   | Frame number on roll      |
| `url`          | text      | Cloudinary URL            |
| `public_id`    | text      | Cloudinary public ID      |
| `width`        | integer   | Image width in pixels     |
| `height`       | integer   | Image height in pixels    |
| `is_favorite`  | boolean   | Favorited flag            |
| `notes`        | text      | Frame notes               |
| `created_at`   | timestamp | Record creation time      |

## License

Private project.

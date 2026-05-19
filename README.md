# Traveloop Personalized Travel Planning Made Easy

> Plan multi-city trips, track budgets, and share itineraries with anyone.
**Live Demo:** [traveloop.vercel.app]([https://traveloop.vercel.app](https://drive.google.com/file/d/1DfJKgvPTGTZ9ObrB3Fm9rgGTubIfVLfr/view?usp=sharing))  
**Built for:** Odoo × parul Hackathon 2026  

---

## The Problem

Planning a multi-city trip is fragmented — people use Notes for itineraries, Excel for budgets, and WhatsApp to share plans. There's no single tool that connects all three and gives travelers a clear picture of where they're going and what it will cost.

## Solution

Traveloop is a full-stack travel planning platform where users can:
- Build day-by-day itineraries across multiple cities
- Add activities with costs and watch the budget calculate automatically
- Get a visual budget breakdown by category
- Share a public link — no login required for the viewer

---
---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) | Single deployment, SSR, file-based routing |
| Styling | Tailwind CSS | Rapid UI development |
| Auth | Custom JWT + HTTP-only cookies | Secure, no third-party dependency |
| Database | PostgreSQL | Relational data, free serverless tier |
| ORM | Prisma | Type-safe queries, easy migrations |
| Charts | Recharts | Budget pie chart visualization |
| Deployment | Vercel | Zero-config, instant deploys on push |

---

## Features

### Core
- **Auth** — Register and login with email + password. JWT stored in HTTP-only cookie.
- **Create Trip** — Name, dates, description. Generates a unique public slug on creation.
- **Itinerary Builder** — Search 15 seeded cities, add as stops, add activities with costs to each stop.
- **Auto Budget** — Total budget recalculates instantly as activities are added or removed.
- **Itinerary View** — Read-only view with activity table per city and a recharts PieChart by category.
- **Public Share URL** — One click makes the itinerary public. Anyone with the link can view it — no login needed.

### Bonus
- **My Trips Dashboard** — Overview of all trips with total budget and quick actions.
- **Delete** — Remove trips, stops, or activities at any point.

---

## Data Model

```
User
 └── Trip (title, dates, isPublic, publicSlug)
      ├── Stop (cityName, country, order)
      │    └── Activity (name, category, estimatedCost, duration)
      ├── ChecklistItem (label, packed, category)
      └── Note (content, stopId?)

City (seeded — 15 cities for search)
```

The `publicSlug` on Trip powers the shareable URL — `/share/[slug]` — which works without authentication.

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ✗ | Create account |
| POST | `/api/auth/login` | ✗ | Login, sets cookie |
| POST | `/api/auth/logout` | ✗ | Clears cookie |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/trips` | ✓ | All trips for user |
| POST | `/api/trips` | ✓ | Create trip |
| GET | `/api/trips/:id` | ✓ | Trip with stops + activities |
| PATCH | `/api/trips/:id` | ✓ | Update trip details |
| DELETE | `/api/trips/:id` | ✓ | Delete trip |
| PATCH | `/api/trips/:id/publish` | ✓ | Toggle public sharing |
| POST | `/api/trips/:id/stops` | ✓ | Add city stop |
| PATCH | `/api/stops/:id` | ✓ | Update stop |
| DELETE | `/api/stops/:id` | ✓ | Remove stop |
| POST | `/api/stops/:id/activities` | ✓ | Add activity with cost |
| PATCH | `/api/activities/:id` | ✓ | Edit activity |
| DELETE | `/api/activities/:id` | ✓ | Remove activity |
| GET | `/api/cities?search=` | ✗ | Search seeded cities |
| GET | `/api/share/:slug` | ✗ | Public trip view |
| GET | `/api/notes?tripId=` | ✓ | Get trip notes |
| POST | `/api/notes` | ✓ | Create note |
| PATCH | `/api/notes/:id` | ✓ | Edit note |
| DELETE | `/api/notes/:id` | ✓ | Delete note |
| GET | `/api/checklist?tripId=` | ✓ | Get checklist |
| POST | `/api/checklist` | ✓ | Add checklist item |
| PATCH | `/api/checklist/:id` | ✓ | Toggle packed |
| DELETE | `/api/checklist/:id` | ✓ | Remove item |

---

## Run Locally

### Prerequisites
- Node.js 18+
- PostgreSQL database (free)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/traveloop
cd traveloop

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values (see below)

# 4. Push schema to database
npx prisma db push
npx prisma generate

# 5. Seed 15 cities
npm run seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# .env

# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"

# JWT secret — generate with: openssl rand -base64 32
JWT_SECRET="your-secret-here"

# Your app URL (use http://localhost:3000 for local dev)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Folder Structure

```
traveloop/
├── app/
│   ├── api/                    # All API routes
│   │   ├── auth/               # login, register, logout, me
│   │   ├── trips/              # CRUD + publish + stops
│   │   ├── stops/              # PATCH, DELETE + activities
│   │   ├── activities/         # PATCH, DELETE
│   │   ├── cities/             # Search seeded cities
│   │   ├── share/[slug]/       # Public — no auth
│   │   ├── notes/              # Trip notes
│   │   └── checklist/          # Packing checklist
│   ├── (auth)/                 # Login + Register pages
│   ├── (main)/                 # Protected pages with navbar
│   │   ├── dashboard/          # Home after login
│   │   ├── trips/              # Trip list
│   │   └── trips/[id]/         # View + Builder
│   └── share/[slug]/           # Public share page
├── lib/
│   ├── auth.ts                 # JWT helpers + getUserFromRequest
│   ├── db.ts                   # Prisma singleton
│   └── utils.ts                # formatCurrency, cn, etc.
├── prisma/
│   ├── schema.prisma           # Full data model
│   └── seed.ts                 # 15 cities seed data
└── middleware.ts               # Protects /dashboard, /trips — NOT /share
```

---

## The Closing Loop

The full user journey that judges can complete in under 3 minutes:

```
Register → Create Trip → Search City → Add Stop →
Add Activities with Costs → View Auto Budget → 
Make Public → Copy Share Link → Open in Incognito → ✓
```

---

## Deployment

Deployed on **Vercel** with **prisma PostgreSQL**.
---

## What We'd Add With More Time

- PDF export of the full itinerary and budget invoice
- Drag-and-drop reordering of stops and activities
- Google Places API integration for real city data
- Collaborative trip planning (invite friends to edit)
- Mobile app (React Native)

---

*Built in 8 hours at Odoo × Parul Hackathon 2026*

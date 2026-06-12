# Opensource Tracker NST — Project Documentation

> **Last updated:** June 2026 | **Version:** v1 | **Framework:** Next.js 16 (App Router)

A comprehensive technical reference for current and future contributors. Covers architecture, design decisions, data flow, every page and component, and operational notes.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Design Philosophy](#2-tech-stack--design-philosophy)
3. [Repository Structure](#3-repository-structure)
4. [Data Layer](#4-data-layer)
5. [Caching Architecture](#5-caching-architecture)
6. [GitHub API Integration](#6-github-api-integration)
7. [Pages & Routes](#7-pages--routes)
8. [Components](#8-components)
9. [API Routes](#9-api-routes)
10. [Admin System](#10-admin-system)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Environment Variables](#12-environment-variables)
13. [Design System](#13-design-system)
14. [Known Behaviours & Gotchas](#14-known-behaviours--gotchas)
15. [Contributor Guide](#15-contributor-guide)

---

## 1. Project Overview

**Opensource Tracker NST** is a leaderboard and visibility platform for tracking open source contributions made by students of NST. It fetches pull requests and issues from the GitHub Search API, ranks students by the number of clean merged PRs, and surfaces this data in a polished public dashboard.

### Goals

- **Transparency** — every student's contributions are visible and linkable.
- **Motivation** — real-time rankings and achievement badges encourage consistent contributions.
- **Integrity** — an admin system allows flagging fake or low-quality PRs so they are excluded from rankings.
- **Education** — a "Common Issues" page teaches open source Git workflows to beginners.

### What It Is NOT

- It does not write to GitHub (no webhooks, no OAuth on behalf of users).
- It does not authenticate students — all data is public GitHub API data.
- It is not a repository management tool.

---

## 2. Tech Stack & Design Philosophy

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Server Components for fast TTFB; server-side caching; built-in ISR |
| Language | **TypeScript** | Type safety for GitHub API shapes and data transforms |
| Styling | **TailwindCSS v4** | Utility-first rapid UI; v4 uses `@tailwindcss/postcss` instead of `content` config |
| Fonts | **Geist + Geist Mono** (via `next/font/google`) | Clean, modern, developer-centric aesthetic |
| Caching | **Vercel KV (Upstash Redis)** + local disk fallback | Serverless-compatible persistent cache; avoids GitHub rate limits |
| Deployment | **Vercel** | Zero-config Next.js hosting; native KV; Cron Jobs |
| Data files | **JSON files** in `/data/` | Simple, git-trackable, no database for static content |
| Images | **Next.js `<Image>`** with `avatars.githubusercontent.com` allowed | Automatic optimization of GitHub avatar images |

### Core Design Principles

**1. Cache-First, API-Second**
Every page that touches the GitHub API reads from cache first. Only on cache miss (or manual refresh) does it call the API. This prevents rate-limit failures and keeps pages fast.

**2. Server Components by Default**
Almost everything is a React Server Component (RSC). Client Components (`'use client'`) are used only when browser APIs are needed (clipboard, router, local state). This keeps JavaScript bundles tiny.

**3. Zero-Dependency KV Client**
`lib/kv.ts` talks to Vercel KV (Upstash Redis) via raw HTTP REST — no npm SDK. This avoids bundle bloat and works in any Edge/Node environment.

**4. Transparent Local Dev Fallback**
When `KV_REST_API_URL` and `KV_REST_API_TOKEN` are absent, the KV layer falls back to reading/writing JSON files in `data/kv/`. Developers can work locally with no Redis setup required.

**5. Dark Mode Only**
The site uses a fixed dark color scheme (`bg-[#0d0d14]`). There is no light mode — this is intentional. The dark background makes neon purple/blue glow effects and glassmorphic cards look premium.

---

## 3. Repository Structure

```
OpenSource_NST_Tracker/
│
├── app/                          # Next.js App Router pages & components
│   ├── layout.tsx                # Root layout: mounts <Nav />, fonts, metadata
│   ├── page.tsx                  # Home page (/)
│   ├── globals.css               # Minimal global CSS (base resets, Tailwind import)
│   │
│   ├── components/
│   │   ├── Nav.tsx               # Sticky top navigation (Client Component)
│   │   ├── UpcomingEvents.tsx    # Events timeline widget (Client Component)
│   │   └── SmoothScroll.tsx      # Lenis smooth scroll wrapper (Client Component)
│   │
│   ├── contributors/
│   │   ├── page.tsx              # Leaderboard (/contributors)
│   │   ├── loading.tsx           # Suspense skeleton for leaderboard
│   │   ├── FilterBar.tsx         # Period/search filter (Client Component)
│   │   ├── RefreshButton.tsx     # Manual refresh + toast (Client Component)
│   │   ├── ShareButton.tsx       # Copy/Twitter/WhatsApp share (Client Component)
│   │   └── [username]/
│   │       ├── page.tsx          # Individual contributor profile
│   │       └── loading.tsx       # Suspense skeleton for profile
│   │
│   ├── achievers/
│   │   ├── page.tsx              # Hall of Fame (/achievers)
│   │   └── [username]/
│   │       └── page.tsx          # Individual achiever profile
│   │
│   ├── programs/
│   │   └── page.tsx              # Open source programs directory (static)
│   │
│   ├── get-started/
│   │   └── page.tsx              # "How to contribute" guide (static)
│   │
│   ├── issues/
│   │   ├── page.tsx              # Common Issues page (holds issue data, server)
│   │   └── IssuesClient.tsx      # Accordion interaction (Client Component)
│   │
│   ├── admin/
│   │   ├── page.tsx              # Admin login form (Client Component)
│   │   └── dashboard/
│   │       ├── page.tsx          # Dashboard wrapper (Server Component)
│   │       └── AdminDashboardClient.tsx  # Full admin UI (Client Component)
│   │
│   └── api/
│       ├── refresh/
│       │   └── route.ts          # GET/POST — cache status & refresh trigger
│       └── admin/
│           ├── auth/route.ts     # POST — admin login (sets session cookie)
│           ├── flag/route.ts     # POST/DELETE — flag or unflag a PR
│           └── approve/route.ts  # POST — approve/un-approve a PR
│
├── lib/                          # Shared server-side utilities
│   ├── github.ts                 # GitHub API types + fetch functions
│   ├── kv.ts                     # KV cache abstraction (Vercel KV or disk)
│   ├── profile-cache.ts          # Per-user profile cache read/write helpers
│   ├── summary-cache.ts          # Leaderboard summary cache helpers
│   ├── data.ts                   # Reads achievers.json, events.json
│   ├── flagged.ts                # Reads/writes data/flagged_prs.json
│   ├── reviewed.ts               # Reads/writes data/reviewed_prs.json
│   ├── admin-auth.ts             # Admin password verification
│   └── types.ts                  # Shared TypeScript interfaces (EventItem)
│
├── data/                         # Static JSON data files (git-tracked)
│   ├── students.json             # List of tracked GitHub usernames
│   ├── achievers.json            # Hall of Fame entries with programs
│   ├── events.json               # Upcoming sessions/deadlines
│   ├── flagged_prs.json          # Admin-flagged PRs (excluded from score)
│   ├── reviewed_prs.json         # Admin-approved PRs
│   └── kv/                       # Local disk KV cache (not committed in prod)
│       ├── profile_cache_*.json  # Per-user PR/profile cache
│       └── summary_cache_*.json  # Leaderboard summary caches by period
│
├── public/                       # Static assets (SVG icons)
├── next.config.ts                # Next.js config (allowed image hostname)
├── vercel.json                   # Vercel Cron schedule
├── package.json
└── tsconfig.json
```

---

## 4. Data Layer

### 4.1 `data/students.json`

The canonical list of tracked students. Add or remove GitHub usernames here.

```json
[
  { "github": "some-github-username" }
]
```

> **Note:** The `getStudents()` function handles both `"username"` (string) and `{ "github": "username" }` (object) formats for backward compatibility.

When you add a student, their data will be fetched on the next cache refresh or when someone first visits their profile page.

### 4.2 `data/achievers.json`

Powers the Hall of Fame (`/achievers`). Each entry links a GitHub username to program achievements.

```json
[
  {
    "github": "username",
    "name": "Full Name",           // optional — overrides GitHub display name
    "headline": "Short bio",       // optional — overrides GitHub bio
    "bookingUrl": "https://...",   // optional — 1:1 booking link
    "programs": [
      {
        "name": "GSoC",            // must match a key in PROGRAM_MAP in lib/data.ts
        "year": 2024,              // optional
        "org": "Organization",     // optional
        "url": "https://..."       // optional — makes the card a clickable link
      }
    ]
  }
]
```

**Supported program names** (auto-styled via `PROGRAM_MAP` in `lib/data.ts`):
`GSoC`, `Summer of Bitcoin`, `ESoC`, `Outreachy`, `LFX`, `MLH`, `Hacktoberfest`

Any program name not in the map renders with a generic white style — this is not an error.

### 4.3 `data/events.json`

Powers the `<UpcomingEvents />` widget on the Home page.

```json
[
  {
    "id": "unique-id",
    "title": "Event Title",
    "date": "2026-07-15",           // ISO date string (YYYY-MM-DD)
    "type": "session",              // "session" | "deadline" | "announcement"
    "description": "Short description",
    "link": "https://..."           // optional
  }
]
```

### 4.4 `data/flagged_prs.json`

Maintained by admins via the dashboard. Flagged PRs are subtracted from a student's `scoreMergedPRs` (the ranking metric) but remain visible on their profile. Managed via `lib/flagged.ts` — do not edit manually.

### 4.5 `data/reviewed_prs.json`

Admin-approved PRs. Used in the admin dashboard for display. Managed via `lib/reviewed.ts`.

---

## 5. Caching Architecture

This is the most critical system. Understanding it is essential before making any changes.

### 5.1 Two-Level Cache

```
Any Request
    │
    ▼
┌──────────────────────────────────────────┐
│            lib/kv.ts (KV Layer)          │
│                                          │
│   KV_REST_API_URL + TOKEN present?       │
│     YES → Vercel KV (Upstash Redis)      │  ← Production
│     NO  → data/kv/*.json (disk files)   │  ← Local development
└──────────────────────────────────────────┘
```

The disk fallback means local development works with **zero infrastructure** — no Redis, no account needed. On Vercel, KV env vars are set and cache is shared across all serverless function instances.

### 5.2 Profile Cache (`lib/profile-cache.ts`)

**KV key format:** `profile_cache:<username_lowercase>`

**TTL:** 1 hour (3600 seconds)

**Cached data per user:**
```typescript
interface ProfileCacheEntry {
  cachedAt: string;       // ISO timestamp of when cache was written
  profile: GitHubUser;    // Full GitHub user object
  prs: StudentPR[];       // All PR objects (paginated, full results)
  issues: StudentIssue[]; // All issues authored in external repos
}
```

**Cache lifecycle:**
- Read on: `GET /contributors/[username]`
- Written on: first profile visit (cache miss) or `POST /api/refresh?username=X`
- Freshness: < 1 hour = fresh; ≥ 1 hour = stale
- Stale cache is used as fallback if the GitHub API call fails (network error or rate limit)
- Manual refresh button has a **separate 5-minute cooldown** enforced in the API route

### 5.3 Summary Cache (`lib/summary-cache.ts`)

**KV key format:** `summary_cache:<period>`

**Periods:** `all`, `1day`, `week`, `month`, `3months`, `6months`, `year`

**TTL:** 24 hours (86400 seconds)

**Cached data:**
```typescript
interface SummaryCache {
  cachedAt: string;
  summaries: StudentSummary[];  // All students, sorted by scoreMergedPRs desc
}
```

**Cache lifecycle:**
- Read on: `GET /contributors` for predefined periods
- Written on: cache miss or `POST /api/refresh` (no username param)
- Invalidated on: admin flags a PR (sets `cachedAt` to epoch `1970-01-01` making it immediately stale)
- The Vercel Cron runs `POST /api/refresh` every 4 hours to keep it warm

### 5.4 Cache Invalidation Flow (Admin Flags a PR)

```
Admin flags a PR in dashboard
        │
        ▼
POST /api/admin/flag
        │
        ├── Writes PR to data/flagged_prs.json
        │
        └── calls invalidateSummaryCache()
                │
                ▼
            Sets cachedAt='1970-01-01T00:00:00.000Z'
            on all period summary caches
                │
                ▼
            Next /contributors request sees stale cache
            → fetches fresh from GitHub API
            → flagged PR now excluded from scoreMergedPRs
```

### 5.5 Rate Limiting Design

| Context | Cooldown | Enforced Where |
|---|---|---|
| Public refresh button (leaderboard) | 5 minutes | `/api/refresh` route (reads `isCacheFresh`) |
| Public refresh button (profile) | 5 minutes | `/api/refresh?username=X` route |
| Vercel Cron | 4 hours | `vercel.json` cron schedule |
| GitHub API (unauthenticated) | 10 req/min | GitHub enforced |
| GitHub API (with token) | 30 req/min | GitHub enforced |

---

## 6. GitHub API Integration

### 6.1 Authentication

Set `GITHUB_TOKEN` in environment variables. The token is included as `Authorization: Bearer <token>` on all requests. A **read-only public repos** scope is sufficient.

Without a token: 10 req/min rate limit (unauthenticated).
With a token: 30 req/min (authenticated).

### 6.2 Key Functions in `lib/github.ts`

| Function | GitHub Endpoint | Returns |
|---|---|---|
| `getStudentProfile(username)` | `GET /users/:username` | Full GitHub user object |
| `getStudentPRs(username)` | Search: `is:pr author:X -user:X` | All external PRs (paginated) |
| `getStudentIssues(username)` | Search: `is:issue author:X -user:X` | All external issues (paginated) |
| `getStudentSummary(student)` | Profile + PR search (1 page only) | Leaderboard summary with scaled counts |
| `getAllStudentSummaries()` | Calls `getStudentSummary` for all students | Full ranked leaderboard array |

**Search query design — why `-user:X`:**
This excludes PRs/issues in repos owned by the student themselves. Self-contributions to own repos do not count toward the score. This is intentional.

### 6.3 Pagination Strategy

| Function | Pages Fetched | Max Results |
|---|---|---|
| `getStudentPRs` | Up to 3 (no token) / 10 (with token) | 300 / 1000 |
| `getStudentIssues` | Up to 3 (no token) / 10 (with token) | 300 / 1000 |
| `getStudentSummary` | **1 page only** | 100 (scaled to total) |

### 6.4 Leaderboard Count Scaling

`getStudentSummary` (used for the leaderboard) only fetches 1 page for performance, then scales:

```
scaledMerged = Math.round(mergedInSample * (total_count / sample_size))
```

**This means leaderboard counts are estimates**, not exact figures. Individual profile pages (`getStudentPRs` with full pagination) show exact counts. This is a deliberate tradeoff: exact counts require many API calls; estimates are fast.

### 6.5 `repoFromUrl(url)` Utility

Converts `https://api.github.com/repos/org/repo` → `org/repo`. Used for grouping PRs by repository and displaying repo names.

---

## 7. Pages & Routes

### 7.1 Home (`/`)

**File:** `app/page.tsx`
**Rendering:** `force-dynamic` (always reflects latest cache)

**Data sources (all fast — no GitHub API calls):**
- `getEvents()` → `data/events.json`
- `getAchievers()` → `data/achievers.json`
- `readSummaryCache()` → KV cache

**Sections rendered:**
1. Hero with live contributor count badge (from cache)
2. 3-stat strip: Total PRs, Merged, Contributors
3. Top 5 contributors preview (from cached summary, ranked order)
4. Hall of Fame mini-section with program counts
5. Quick navigation cards to all sections
6. Upcoming events timeline

**Design decision:** Home is `force-dynamic` (not static) so it always shows fresh cache stats. Since it reads only from KV (not GitHub API), this is extremely fast (~10ms latency).

---

### 7.2 Contributors Leaderboard (`/contributors`)

**File:** `app/contributors/page.tsx`
**Rendering:** `force-dynamic`

**URL query parameters:**
| Param | Values | Default |
|---|---|---|
| `period` | `all`, `1day`, `week`, `month`, `3months`, `6months`, `year`, `custom` | `all` |
| `from` | ISO date string | — |
| `to` | ISO date string | — |
| `search` | text string | — |

**Data flow:**
1. Parse `searchParams`
2. For predefined periods: read `summary_cache:<period>` from KV
3. If cache missing or invalidated (epoch timestamp): call `getAllStudentSummaries()` + write cache
4. Apply `search` filter client-side (name + username substring match)
5. Render ranked student cards

**Ranking metric:** `scoreMergedPRs` = `mergedPRs - flaggedMergedPRs`. A student with 10 genuine merges ranks above one with 20 merges where 15 are flagged.

**Components used:**
- `<FilterBar />` — URL-driven period switching and name search (350ms debounce)
- `<RefreshButton />` — public refresh with 5-min cooldown and toast notifications

---

### 7.3 Contributor Profile (`/contributors/[username]`)

**File:** `app/contributors/[username]/page.tsx`
**Rendering:** `revalidate = 3600` (ISR, 1-hour background regeneration)

**Tab system** (URL query param `?tab=`):
| Tab Value | Shows |
|---|---|
| `prs` (default) | All PRs grouped by repository |
| `merged` | Only merged PRs |
| `open` | Only open PRs |
| `issues` | Issues authored in external repos |

**Data flow:**
1. Read profile cache for username
2. If fresh (< 1 hour): use cached data
3. If stale: fetch fresh profile + PRs + issues from GitHub API → write cache
4. If API fails AND stale cache exists: use stale cache as fallback
5. If nothing: call `notFound()` → 404 page

**Features:**
- PR/issue lists grouped by `repoFromUrl()` with `RepoHeader` component
- Color-coded status badges: Merged (purple), Open (teal), Closed (red)
- GitHub labels rendered with their actual API colors (`#RRGGBB22` background)
- Achievement badges (see criteria below)
- `ContributionChart` — pure SVG area chart of PR activity over the last 6 months
- Share button (copy link, Twitter/X, WhatsApp)
- Manual refresh button with 5-minute cooldown

**Achievement badge criteria:**

| Badge | Emoji | Condition |
|---|---|---|
| First Merge | 🌱 | ≥ 1 merged PR |
| Merging Machine | 🔥 | ≥ 10 merged PRs |
| Bug Squasher | 🐞 | ≥ 1 merged PR with "fix"/"bug" in title or bug/fix label |
| Doc Hero | 📚 | ≥ 1 merged PR with "doc"/"readme" in title or doc label |
| Speed Demon | ⚡ | 3+ merged PRs within any 7-day window |

**Contribution Chart implementation:**
- Pure SVG, rendered server-side (zero JavaScript chart library, zero bundle impact)
- Last 6 calendar months on X-axis (built with `new Date(year, month - i, 1)`)
- Y-axis auto-scales to peak month (`displayMax = maxVal === 0 ? 5 : maxVal`)
- Gradient line: purple (`#c084fc`) → indigo (`#818cf8`) → blue (`#60a5fa`)
- Hover tooltips: CSS `group-hover` opacity trick — no JS event listeners

---

### 7.4 Hall of Fame (`/achievers`)

**File:** `app/achievers/page.tsx`
**Rendering:** `revalidate = 3600`

Data entirely from `data/achievers.json`. No GitHub API calls. Displays student cards with their program badges.

---

### 7.5 Achiever Profile (`/achievers/[username]`)

**File:** `app/achievers/[username]/page.tsx`
**Rendering:** `revalidate = 3600`

Fetches live GitHub profile + PRs directly (no KV cache — uses Next.js ISR). Shows:
- Program achievement cards from `achievers.json`
- Quick stats: total PRs, merged count, unique repo count
- Last 10 PRs as a live feed

**Design decision:** Achiever profiles call the API directly (not via KV cache) because they are visited less frequently than contributor profiles, and the data is supplementary.

---

### 7.6 Programs (`/programs`)

**File:** `app/programs/page.tsx`
**Rendering:** Static (fully pre-rendered at build time)

All content is hardcoded in the file. Lists major open source programs with application timelines, eligibility, and tips.

---

### 7.7 Get Started (`/get-started`)

**File:** `app/get-started/page.tsx`
**Rendering:** Static

An engaging, visually rich onboarding guide introducing new contributors to the open-source ecosystem. 

**Sections and Content:**
1. **Interactive Hero Section:** Dynamic title, inspiring tagline, and quick navigation anchors.
2. **What is Open Source & Why Innovation:** Side-by-side comparison detailing the contrast between proprietary silos and the open-source collaboration model. Highlight of **Permissionless Innovation** and a 4-item statistical metrics row.
3. **Open Source Giants (Project Profiles):** Showcase cards for famous open-source software:
   - *Linux:* The bedrock of cloud server infrastructure and supercomputers.
   - *Android:* Google's open-source OS running on 3B+ mobile devices.
   - *Python:* Guido van Rossum's holiday project that became the foundation of modern AI tools (PyTorch, TensorFlow).
   - *VLC Media Player:* Student-built media tool downloaded 3.5B+ times, volunteer-maintained, ad-free.
   - *VS Code & Git:* Global standard developer tools powering modern code collaboration.
   - *Blender:* Crowdfunded Hollywood-grade 3D graphics suite.
   Each card features key statistics, historical fun facts (origin stories), and brand-colored hover glows.
4. **Why Contribute:** Career benefits including real-world experience, visibility, connections, and paid stipend programs.
5. **Onboarding Quest Roadmap:** 6 vertical timeline steps guiding students from learning Git to writing their first PR description.
6. **Core Skills Checklist:** Categorized checklist of Git, Code Navigation, Technical Communication, and Local Tooling skills.
7. **Strict Guidelines:** Critical community standards to deter AI plagiarism, README spam, and drive-by PRs.

---

### 7.8 Common Issues (`/issues`)

**File:** `app/issues/page.tsx` (server) + `app/issues/IssuesClient.tsx` (client)
**Rendering:** Static

The `ISSUES` array in `page.tsx` contains 7 structured issue entries (PR extra files, undo bad commit, picking up abandoned PRs, testing before push, merge conflicts, wrong branch, commit messages). Each has: title, severity tag, what happened, why it happens, step-by-step solution with code blocks, and a prevention tip.

`IssuesClient.tsx` handles accordion expand/collapse and tag-based filtering with local React state.

---

### 7.9 Admin Login (`/admin`)

**File:** `app/admin/page.tsx` (Client Component)

Login form that `POST`s the password to `/api/admin/auth`. On success, server sets an HTTP-only cookie and client redirects to `/admin/dashboard`.

---

### 7.10 Admin Dashboard (`/admin/dashboard`)

**Files:**
- `page.tsx` — Server Component that verifies auth, reads all data, passes to client
- `AdminDashboardClient.tsx` — Full interactive dashboard (Client Component)

**Dashboard capabilities:**
- View all PRs across all students with status (merged/open/closed), flag state, and approval state
- Filter by student, PR status, repository, and flag/approval state
- Flag a PR as `fake`, `self_pr`, or `low_quality` with an optional admin note
- Unflag a previously flagged PR
- Approve a PR (mark as reviewed)

---

## 8. Components

### 8.1 `Nav` (`app/components/Nav.tsx`)

**Type:** Client Component

**Features:**
- Sticky top bar (`sticky top-0 z-50`), 52px height
- Active link detection via `usePathname()` with prefix matching (`/contributors/username` highlights "Contributors")
- Desktop: horizontal link pills
- Mobile: hamburger icon → full-screen slide-out panel
- Body scroll locked (`document.body.style.overflow = 'hidden'`) when mobile menu is open
- Auto-closes on route change via `useEffect([path])`
- Admin icon (lock) always visible but visually subtle (`text-white/15`)

**Navigation links (in order):** Home, Contributors, Hall of Fame, Programs, Get Started, Issues

---

### 8.2 `FilterBar` (`app/contributors/FilterBar.tsx`)

**Type:** Client Component

**State management:** All state lives in URL params — the component is driven by `useSearchParams()`. This means filtered views are shareable/bookmarkable and survive page refreshes.

**Features:**
- Preset period pills: All, 1 Day, 1 Week, 1 Month, 3 Months
- Custom date range: "Custom" pill → reveals `from`/`to` date pickers + Apply button
- Name search with **350ms debounce** using `useRef<ReturnType<typeof setTimeout>>`
- Active filter summary label with "Clear all" shortcut
- Uses `router.push()` for navigation (not `router.replace`) so filters are in browser history

---

### 8.3 `RefreshButton` (`app/contributors/RefreshButton.tsx`)

**Type:** Client Component

**Used on:** Both the leaderboard page and individual contributor profiles

**Flow:**
1. User clicks "Refresh"
2. Shows `info` toast: "Fetching latest data from GitHub..."
3. `POST /api/refresh[?username=X]`
4. If rate-limited: shows `error` toast with remaining seconds; sets 8-second local cooldown
5. If success: shows `success` toast; calls `router.refresh()` via `useTransition` to re-render server components

**Toast system:**
- Fixed bottom-right (`fixed bottom-5 right-5 z-50`)
- Glassmorphic card: `bg-[#0d0d14]/90 backdrop-blur-md border-white/10`
- Animated pulsing dot: emerald (success), blue (info/loading), red (error)
- Auto-dismisses after 4 seconds (except `info` type, which stays until replaced)

**"Updated X ago" label:**
Ticks every 30 seconds via `setInterval` using `timeAgo()` helper function.

---

### 8.4 `ShareButton` (`app/contributors/ShareButton.tsx`)

**Type:** Client Component

Three share actions:
1. **Copy link** — `navigator.clipboard.writeText()`, shows ✓ checkmark for 2 seconds
2. **Twitter/X** — `twitter.com/intent/tweet` with pre-encoded text + URL
3. **WhatsApp** — `wa.me/?text=` with pre-encoded text

---

### 8.5 `UpcomingEvents` (`app/components/UpcomingEvents.tsx`)

**Type:** Client Component (needs countdown logic)

Renders events timeline on the Home page. Color-coded by type. Shows live countdowns using `Date.now()` — requires client-side rendering.

---

### 8.6 `SmoothScroll` (`app/components/SmoothScroll.tsx`)

**Type:** Client Component

Initializes **Lenis smooth inertial scrolling** across the application. 

**Features:**
- Custom ease-out exponential deceleration function: `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`.
- Integrates with the browser's `requestAnimationFrame` render loop.
- Automatically handles device wheel, trackpad, and keyboard scrolls.
- Cleans up anim frames and destroys instance on unmount to prevent memory leaks.

---

## 9. API Routes

### `GET /api/refresh`

Returns cache metadata without triggering a refresh.

**Query params:**
- `?username=X` → profile cache status for user X
- `?period=X` → summary cache status for that period

**Response:**
```json
{ "cachedAt": "2026-06-12T10:00:00Z", "fresh": true, "count": 11 }
```

---

### `POST /api/refresh`

Triggers a cache refresh. Rate-limited.

**With `?username=X`:**
- Checks 5-minute cooldown on that user's profile cache
- If fresh: returns `{ fromCache: true, message: "Try again in Xs" }`
- If stale: fetches GitHub profile + PRs + issues → writes KV cache → `revalidatePath()` → returns `{ fromCache: false, cachedAt }`

**Without username param:**
- Refreshes the summary leaderboard for `?period=X` (defaults to `all`)
- Same 5-minute cooldown logic
- Calls `getAllStudentSummaries()` → writes KV summary cache → `revalidatePath('/contributors')`
- Also called by Vercel Cron every 4 hours

---

### `POST /api/admin/auth`

Validates the admin password against `process.env.ADMIN_PASSWORD`. Sets an HTTP-only session cookie on success.

---

### `POST /api/admin/flag`

Flags a PR. Auth-gated (requires session cookie).

**Request body:**
```json
{
  "prKey": "owner/repo#123",
  "url": "https://github.com/...",
  "title": "PR title",
  "author": "github-username",
  "reason": "fake" | "self_pr" | "low_quality",
  "note": "Optional admin note"
}
```

**Side effects:** writes to `flagged_prs.json`, calls `invalidateSummaryCache()`

---

### `DELETE /api/admin/flag`

Removes a flag. Body: `{ prKey: "owner/repo#123" }`. Calls `unflagPR()` + `invalidateSummaryCache()`.

---

### `POST /api/admin/approve`

Marks a PR as approved. Body: `{ prKey: "owner/repo#123" }`. Writes to `reviewed_prs.json`.

---

## 10. Admin System

### Authentication

- Single shared password in `ADMIN_PASSWORD` environment variable
- Verified by `lib/admin-auth.ts`
- Session maintained via HTTP-only cookie — value checked server-side on each admin API call
- No JWT, no user accounts, no roles

### Security Model

- Anyone with the password has full admin access
- All admin mutations are server-side API routes that check the session cookie
- The password is never sent to client-side JavaScript
- Admin cookie has no automatic expiry (browser session cookie)

### Flagging Philosophy

Flagged PRs are **not deleted**. They:
- Remain visible on the contributor's profile page
- Are excluded from `scoreMergedPRs` used for leaderboard ranking
- Are stored in `data/flagged_prs.json` — git-tracked for transparency and audit trail
- Can be unflagged at any time by an admin

This preserves data integrity: you can see what was flagged and why, and reverse decisions without data loss.

---

## 11. Deployment & Infrastructure

### Vercel Setup

1. Connect the `OpenSource_NST_Tracker/` directory to Vercel
2. Set all required environment variables (see Section 12)
3. Create a Vercel KV database (Storage → KV) and link it to the project
4. Deploy

### Vercel Cron

`vercel.json` configures an automatic refresh:
```json
{
  "crons": [
    {
      "path": "/api/refresh",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

This calls `GET /api/refresh` every 4 hours. **Note:** Vercel Cron sends a `GET` request, but the refresh action requires `POST`. You may need to either:
- Handle `GET` as a refresh trigger in `route.ts`, or
- Change the cron to `POST` via Vercel's dashboard configuration

Currently the route exports both `GET` (returns status) and `POST` (triggers refresh). Ensure Vercel Cron is configured for the correct method.

### Scaling Characteristics

With warmed caches, the site can handle thousands of concurrent users on Vercel free tier:
- **Cache hit** (KV read): ~10–50ms total response time
- **Cache miss** (GitHub API): ~200–1000ms total response time
- The 4-hour cron ensures caches are always warm during typical usage
- The bottleneck is GitHub API rate limits (30 req/min with token), not compute

---

## 12. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Recommended | GitHub Personal Access Token (read-only public repos scope). Without it, rate limits are 10 req/min (unauthenticated). |
| `ADMIN_PASSWORD` | Yes (for admin) | Password for `/admin` dashboard. Without this, admin API routes return 401. |
| `KV_REST_API_URL` | Yes (production) | Vercel KV / Upstash Redis REST endpoint URL. Without it, falls back to disk (`data/kv/`). |
| `KV_REST_API_TOKEN` | Yes (production) | Vercel KV / Upstash Redis auth bearer token. |

**Local `.env.local` example:**
```bash
GITHUB_TOKEN=ghp_your_read_only_token_here
ADMIN_PASSWORD=your-local-admin-password
# Leave KV vars empty to use disk cache (data/kv/*.json)
# KV_REST_API_URL=
# KV_REST_API_TOKEN=
```

---

## 13. Design System

### Color Palette

| Role | Tailwind Class | Notes |
|---|---|---|
| Page background | `bg-[#0d0d14]` | Applied on every `<main>` |
| Card fill | `bg-white/[0.025]` to `bg-white/[0.05]` | Glassmorphic surfaces |
| Card border | `border-white/[0.07]` to `border-white/[0.1]` | Subtle borders |
| Primary accent | `purple-400` / `purple-600` | Buttons, active states, glow |
| Secondary accent | `blue-400` / `blue-600` | Gradient pair with purple |
| Success / Merged | `emerald-400` / `emerald-500` | Merged PR badges, merged count |
| Open / Active | `teal-400` / `teal-500` | Open PR badges |
| Closed / Error | `red-400` / `red-500` | Closed PRs, error toasts |
| Hall of Fame gold | `yellow-400` / `yellow-500` | Achiever accent color |
| Text primary | `text-white` / `text-white/85` | Headings |
| Text secondary | `text-white/50` to `text-white/40` | Body text |
| Text muted | `text-white/30` to `text-white/20` | Labels, metadata |

### Typography

- **Sans-serif:** `Geist` — all body text, UI elements
- **Monospace:** `Geist Mono` — code blocks, repo names, PR numbers, tabular stats
- Applied as CSS variables `--font-geist-sans` / `--font-geist-mono` on the `<html>` element

### Layout

- **Detail pages** (profile, achiever): `max-w-4xl mx-auto px-4`
- **List pages** (leaderboard, programs): `max-w-6xl mx-auto px-4`
- **Home sections:** `max-w-3xl mx-auto px-4`
- **Nav height:** 52px (set as inline style, not Tailwind, to prevent purging)
- **Bottom padding:** `pb-24` on all content areas

### Background Glow Pattern

Used on every hero section — always `pointer-events-none` and `aria-hidden`:
```tsx
<div className="pointer-events-none absolute inset-0" aria-hidden="true">
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px]
                  bg-purple-600/8 blur-[80px] rounded-full" />
</div>
```

- Opacity is very low (`/8` = 8%) — subtle not garish
- Each page uses a different color tint to differentiate sections

### Interactive State Patterns

Hover transitions used consistently across all cards:
```
Background: bg-white/[0.025] → hover:bg-white/[0.05]
Border:     border-white/[0.07] → hover:border-purple-500/25
Lift:       translate-y-0 → hover:-translate-y-0.5
Arrow icon: text-white/15 → hover:text-purple-400 + hover:translate-x-0.5
```

### Gradient Text

Used on page titles:
```tsx
<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
  NST
</span>
```

---

## 14. Known Behaviours & Gotchas

### Turbopack FATAL Errors in Dev Mode

During `npm run dev`, you will see recurring `FATAL: An unexpected Turbopack error` messages in the terminal. **These do not break the app** — pages still serve with HTTP 200. This is a known Next.js 16 Turbopack bug triggered by Server Components that import Node.js `fs` (filesystem) module (`lib/kv.ts`, `lib/flagged.ts`). The Turbopack HMR system panics when recompiling these modules but recovers and continues serving. The production build (`npm run build`) and `npm start` are completely unaffected.

### Leaderboard Counts Are Statistical Estimates

The `mergedPRs`, `openPRs`, `closedPRs` shown on contributor cards in the leaderboard are **scaled estimates** (from a 100-result sample). Individual profile pages show exact counts fetched with full pagination.

### Two Separate Freshness Concepts in `summary-cache.ts`

`isCacheFresh()` uses a **5-minute TTL** — this controls the **public refresh button rate limit**, not the cache expiry. The actual KV cache TTL (how long data lives) is **24 hours** (set via `EX 86400` on write). Do not confuse these.

### Profile Cache and Summary Cache Are Independent

A student's profile page can show updated data (profile cache refreshed) while their card on the leaderboard shows older stats (summary cache not yet refreshed). This is expected behaviour.

### Adding a Student Has a Delay

New entries in `students.json` will not appear on the leaderboard until:
1. The summary cache expires (up to 24 hours), **or**
2. Someone clicks the public Refresh button, **or**
3. The Vercel Cron runs (every 4 hours)

Their individual profile page at `/contributors/<username>` works immediately on first visit (profile cache built on demand).

### The `pull_request.merged_at` Field

The GitHub Search API for issues/PRs returns a `pull_request` sub-object with exactly these keys: `url`, `html_url`, `diff_url`, `patch_url`, `merged_at`. The `merged_at` field is present in the search response (it is `null` for unmerged PRs). You do **not** need a separate API call to get merge status — it is included in the search result.

---

## 15. Contributor Guide

### Running Locally

```bash
# 1. Navigate to the project directory
cd OpenSource_NST_Tracker/

# 2. Install dependencies
npm install

# 3. Create local environment file
# (copy contents below into .env.local)
GITHUB_TOKEN=ghp_your_token_here
ADMIN_PASSWORD=localpass

# 4. Start dev server
npm run dev
# → http://localhost:3000

# 5. Build for production (catches TypeScript + compilation errors)
npm run build

# 6. Type-check only (no build output)
npx tsc --noEmit
```

### Adding a New Student

1. Edit `data/students.json`:
   ```json
   { "github": "their-github-handle" }
   ```
2. Commit and push. The leaderboard will include them after the next refresh.

### Adding a Hall of Fame Entry

1. Edit `data/achievers.json` (see Section 4.2 for schema)
2. If the program name is new, add it to `PROGRAM_MAP` in `lib/data.ts`:
   ```typescript
   'NewProgram': {
     label: 'Full Program Name',
     color: 'text-color-400',
     bg: 'bg-color-500/10',
     border: 'border-color-500/30',
     dot: 'bg-color-400',
   },
   ```

### Adding an Event

Edit `data/events.json`. Use ISO date format (`YYYY-MM-DD`). Types: `session`, `deadline`, `announcement`.

### Adding an Achievement Badge

In `app/contributors/[username]/page.tsx`, add to the `getBadges()` function:

```typescript
if (yourCondition) {
  list.push({
    id: 'unique_snake_case_id',
    name: 'Badge Display Name',
    emoji: '🎯',
    desc: 'Tooltip: what this badge means',
    style: 'bg-color-500/10 border-color-500/20 text-color-400 hover:bg-color-500/15',
  });
}
```

### Adding a New Common Issue

In `app/issues/page.tsx`, add to the `ISSUES` array:

```typescript
{
  id: 'unique-kebab-id',
  emoji: '🔧',
  severity: 'common',          // 'common' | 'best-practice'
  title: 'Issue title...',
  tags: ['git', 'tag2'],
  whatHappened: `Description of the situation...`,
  whyItHappens: [
    'First reason...',
    'Second reason...',
  ],
  solution: [
    {
      step: 'Step title',
      code: `git command here`,
      note: 'Explanation of what this does...',
    },
  ],
  preventionTip: 'How to avoid this in the future...',
},
```

### Modifying the Caching Logic

Before changing `lib/kv.ts`, `lib/profile-cache.ts`, or `lib/summary-cache.ts`:

1. Read Section 5 completely
2. Test locally (disk mode, no KV vars) and with KV vars set
3. Ensure TTL values are consistent: `isProfileFresh()` TTL must match the write TTL
4. After any change to cache key formats, existing cached data becomes orphaned (not automatically cleaned up)

### Quick File Reference

| Goal | File to Edit |
|---|---|
| Add a student | `data/students.json` |
| Add an achiever | `data/achievers.json` |
| Add a program style | `lib/data.ts` → `PROGRAM_MAP` |
| Add an event | `data/events.json` |
| Change leaderboard ranking | `lib/github.ts` → `getStudentSummary()` |
| Change cache TTLs | `lib/profile-cache.ts`, `lib/summary-cache.ts` |
| Change cron schedule | `vercel.json` |
| Change admin password logic | `lib/admin-auth.ts` + `ADMIN_PASSWORD` env var |
| Add navigation link | `app/components/Nav.tsx` → `LINKS` array |
| Add achievement badge | `app/contributors/[username]/page.tsx` → `getBadges()` |
| Change refresh rate limit | `app/api/refresh/route.ts` → `COOLDOWN_MS` |
| Add a Common Issue | `app/issues/page.tsx` → `ISSUES` array |
| Change chart window (months) | `app/contributors/[username]/page.tsx` → `getChartData()` |
| Change allowed image hosts | `next.config.ts` → `images.remotePatterns` |

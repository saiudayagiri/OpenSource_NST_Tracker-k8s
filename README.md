# Opensource Tracker NST — Kubernetes Deployment Copy

A leaderboard tracking NST students' open-source GitHub contributions. This repo is a copy of the [production app](https://opensource-nst-tracker.vercel.app) (hosted on Vercel — that deployment is untouched and unaffected by anything here), set up to also deploy independently to the NST SDC cluster at `oss-tracker.nstsdc.org`.

Same application code either way — the only things unique to this repo are the deployment-shaped files (`Dockerfile`, `k8s/`, the CI workflow). See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for how the two deployments differ.

## Quick Start (local development)

You don't need any production credentials to run this locally — just your own free GitHub token.

```bash
git clone <this-repo-url>
cd OpenSource_NST_Tracker-k8s
npm install
cp .env.example .env.local
```

Open `.env.local` and set at minimum:

```bash
GITHUB_TOKEN=ghp_your_own_token_here   # https://github.com/settings/tokens, no special scopes needed
GITHUB_CLIENT_ID=ADMIN                 # local-only shortcut, see below
```

Leave everything else blank, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Two shortcuts that make local dev genuinely zero-setup

These are already built into the app, not something you need to configure — worth knowing about because they're easy to miss:

1. **No Redis account needed.** Leaving `KV_REST_API_URL`/`KV_REST_API_TOKEN` blank makes the app automatically store everything as JSON files under `data/kv/` instead. Full functionality, nothing to sign up for. See `lib/kv.ts`.
2. **No GitHub OAuth App needed.** Setting `GITHUB_CLIENT_ID=ADMIN` skips the real OAuth flow and logs you in locally using your own `GITHUB_TOKEN`. This is hard-blocked in production (see `app/api/auth/github/route.ts`) — it only ever works with `npm run dev`, so there's no security concern in using it for local work.

See [.env.example](./.env.example) for every variable and what each one is for.

### Before you push / open a PR

```bash
npm run build      # catches TypeScript + compilation errors — always run this before pushing
npx tsc --noEmit    # type-check only, faster
```

A change that builds locally but wasn't checked has, in the past, silently broken every production deployment for days — `npm run build` costs a few seconds and catches this immediately.

## Learn more

- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — how the app is put together, and how the two deployments (Vercel vs. this cluster) differ.
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** — the full technical reference: every page, every API route, the caching design, the admin system, known gotchas. Read this before making any non-trivial change.
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — step-by-step walkthrough for deploying this repo to the NST SDC cluster, written for someone doing it for the first time.

## Testing and deployment are owned by contributors

There's no gatekeeping expectation here beyond "run `npm run build` before you push." If you're deploying this to the cluster for the first time, docs/DEPLOYMENT.md is written to not assume you've done this before — if a step in it doesn't work as written, that's a docs bug worth reporting, not a sign you did something wrong.

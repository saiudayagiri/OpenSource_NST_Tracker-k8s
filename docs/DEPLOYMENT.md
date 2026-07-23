# Deploying to the NST SDC Cluster

This is a step-by-step walkthrough for taking this repo from "runs on my laptop" to "live at `https://oss-tracker.nstsdc.org`". It assumes **no prior experience with this specific app** — just basic `git`/`docker`/`kubectl` familiarity.

If something here doesn't work exactly as written, that's useful information, not a sign you did something wrong — infrastructure docs go stale. Open an issue or ask in the SDC channels rather than guessing silently. Nothing you do in the steps below can affect the production Vercel deployment; they're completely separate systems.

## 0. Before you start

You'll need:

- **Cluster access** — an account on `rancher.nstsdc.org` and SSH access to `nst-n1.nstsdc.org`. If you don't have this yet, that's the actual first step — ask in the SDC cluster access channel. The cluster's own docs (`nst-sdc/nst-cluster-docs`, `guide/access.md`) cover how this is granted.
- **A GitHub account** with permission to push to this repo (or your own fork of it).
- **Docker**, only if you want to test the build locally first (recommended, and covered in the local setup section of the [README](../README.md) — do that before touching the cluster at all).
- Five to ten minutes for a one-time [Upstash](https://upstash.com) signup (free tier) — this repo's database, separate from production.

You do **not** need any of the production secrets from the Vercel deployment. Every credential below is either something you generate yourself or a free account you create yourself.

## 1. Create your own Upstash Redis database

This deployment must use its **own** Redis instance, never the production one — that's what keeps students free to experiment (including breaking things) without any risk to the live leaderboard.

1. Sign up at [upstash.com](https://upstash.com) (free tier is enough).
2. Create a new Redis database — any region close to the cluster is fine.
3. From its dashboard, copy the **REST URL**, **REST Token**, and **Read-Only REST Token**. You'll paste these into the Kubernetes Secret in step 4.

## 2. Register a GitHub OAuth App (optional but recommended)

This powers the "Sign in with GitHub" button. Skippable at first — the app runs fine without it (see the README's local dev shortcuts) — but you'll want it for a real deployment eventually.

1. [github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**.
2. Homepage URL: `https://oss-tracker.nstsdc.org`
3. Authorization callback URL: `https://oss-tracker.nstsdc.org/api/auth/github/callback`
4. Save the generated **Client ID** and **Client Secret** for step 4.

## 3. Let CI build the image

Nothing to do here except push to `main` — `.github/workflows/build-and-push.yml` already builds the Docker image and pushes it to `ghcr.io/<your-username>/<this-repo-name>:latest` on every push, using GitHub's built-in token. Check the **Actions** tab after your first push to confirm it went green, and check **Packages** on your GitHub profile to see the image.

**One thing to set once:** GHCR packages are private by default. Either:
- Make the package public (its **Package settings** → **Change visibility**) — simplest, fine for this project since it contains no secrets (they're injected at runtime, never baked into the image — see the Dockerfile's comments), or
- Keep it private and create a Kubernetes pull secret (step 5 covers this) — needed either way if you ever go private.

## 4. Create the namespace and the real Secret on the cluster

SSH into the cluster (`nst-sdc/nst-cluster-docs`' `guide/access.md` covers how SSH access to `nst-n1` is set up if you haven't done this before), then:

```bash
kubectl apply -f k8s/00-namespace.yaml
```

Copy the Secret template and fill in real values — **never edit or commit `k8s/01-secret.yaml.example` itself**:

```bash
cp k8s/01-secret.yaml.example k8s/01-secret.yaml
```

Edit `k8s/01-secret.yaml` with:
- `GITHUB_TOKEN` — a [Personal Access Token](https://github.com/settings/tokens) (no special scopes needed for public repo search)
- `ADMIN_PASSWORD` — anything you choose, for the `/admin` dashboard
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — from step 2
- `CRON_SECRET` — any random string (a `openssl rand -hex 16` works fine) — you'll reuse this in step 6
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` / `KV_REST_API_READ_ONLY_TOKEN` — from step 1

Then apply it:

```bash
kubectl apply -f k8s/01-secret.yaml
```

This file is gitignored — it only ever lives on the cluster and on your own machine, never in the repo.

## 5. (If your GHCR package is private) create a pull secret

Skip this if you made the package public in step 3.

```bash
kubectl create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username=<your-github-username> \
  --docker-password=<a GitHub PAT with read:packages scope> \
  --namespace=opensource-tracker
```

## 6. Point the Deployment at your image, then apply everything

Edit `k8s/02-deployment.yaml`, replacing `ghcr.io/<YOUR_GHCR_OWNER>/<YOUR_IMAGE_NAME>:latest` with the real image path from step 3 (check the **Packages** tab on GitHub for the exact name — GHCR lowercases it automatically, so it may not exactly match this repo's display name).

If you skipped step 5, also delete the `imagePullSecrets:` block at the bottom of that file.

```bash
kubectl apply -f k8s/02-deployment.yaml
kubectl apply -f k8s/03-service.yaml
kubectl apply -f k8s/04-ingress.yaml
```

Before applying the Ingress, it's worth double-checking the hostname isn't already claimed by someone else's app:

```bash
kubectl get ingress -A
```

If `oss-tracker.nstsdc.org` is taken, pick another and edit it in `k8s/04-ingress.yaml` before applying.

## 7. Verify

```bash
kubectl -n opensource-tracker get pods
```

Wait for `Running` and `1/1 Ready`. Then, from `nst-n1` (this is the exact pattern the cluster's own docs recommend for checking a new app before trusting the public URL):

```bash
curl -i -H "Host: oss-tracker.nstsdc.org" http://127.0.0.1
```

You should see the app's HTML come back. If not:

```bash
kubectl -n opensource-tracker logs deployment/opensource-tracker
kubectl -n opensource-tracker describe pod <pod-name>
```

are the two commands that explain almost every failure mode (crash loop, image pull error, missing env var).

Once that curl works, `https://oss-tracker.nstsdc.org` should load from the public internet with no further DNS or certificate setup — that's handled cluster-wide by the Cloudflare Tunnel.

## 8. Wire up the incremental refresh cron

The leaderboard only updates when something calls `/api/refresh/incremental` — that's this repo's `.github/workflows/refresh.yml` and `refresh-cache.yml`, already pointed at `secrets.APP_URL` rather than a hardcoded domain. In this repo's GitHub **Settings → Secrets and variables → Actions**, add:

- `APP_URL` = `https://oss-tracker.nstsdc.org`
- `CRON_SECRET` = the exact same value you put in `k8s/01-secret.yaml` in step 4

## Performance notes: why this might feel slower than Vercel

The first real deploy of this app to the cluster measured page loads around 2–5 seconds, versus a much snappier feel on Vercel. Two separate causes were found, worth checking again if the roster grows or performance regresses:

**1. CPU throttling from an undersized limit (fixed in this repo's manifest).** The original `k8s/02-deployment.yaml` capped the container at `500m` (half a CPU core). Confirmed via the container's cgroup stats:

```bash
kubectl -n opensource-tracker exec deploy/opensource-tracker -- cat /sys/fs/cgroup/cpu.stat
```

`nr_throttled` (periods where the container hit its limit and got paused) and `throttled_usec` (total time spent paused) are the numbers that matter — at the old `500m` limit, `throttled_usec` (13.5s) actually exceeded `usage_usec` (11.4s), meaning the pod spent more time waiting to be allowed to run than actually running. Raising the limit to `1000m` (one full core) cut the throttled/usage ratio from ~119% to ~19%. If pages feel slow again later, check this first before assuming it's a code problem.

**2. A structural cost that's the same on both deployments, just less visible on Vercel.** Even with zero throttling, pages stayed in the 2–3 second range. This is because `summary_cache:<period>` stores **every tracked student's summary in one ~3MB JSON blob** (see [../DOCUMENTATION.md](../DOCUMENTATION.md) Section 5.3) — even the home page's 5-entry preview fetches and parses the entire blob. This is already documented as *"the biggest structural inefficiency in the codebase today"*, not something introduced by this deployment. Vercel's serverless functions likely get more CPU per invocation by default and may sit closer to the Upstash region, which is probably why it feels faster there despite doing the same redundant work. Worth revisiting the caching design (e.g., splitting summary cache into smaller pages) as a separate follow-up if snappier performance matters more than it currently does.

## Troubleshooting

For anything cluster-specific (Traefik quirks, DNS propagation, `kubectl` connectivity, general "this cluster-wide thing is broken"), the cluster's own docs are the source of truth and already cover far more ground than this file should try to duplicate: `nst-sdc/nst-cluster-docs`, especially `reference/tips.md` and `reference/troubleshooting.md`. For anything about this **app's** behavior specifically (caching, rate limits, the admin system), see [ARCHITECTURE.md](./ARCHITECTURE.md) and [../DOCUMENTATION.md](../DOCUMENTATION.md).

## Once this is working: the next step is Fleet, not more manual deploys

Everything above is a **manual** deploy — you `kubectl apply` by hand each time you want the cluster to pick up a new image. That's deliberately the starting point rather than the end state: it's the smallest number of new concepts to learn on day one. The cluster already runs **Fleet** (Rancher's GitOps engine), which can watch this repo and auto-apply `k8s/` on every push — turning step 6 above into "just push to main". Once the manual path above is working end-to-end, wiring up Fleet is a good next project for whoever owns this deployment — see `nst-sdc/nst-cluster-docs`' `guide/fleet.md`.

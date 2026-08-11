# Deploying Gāḷi Suddi on Vercel — step by step

The monorepo becomes **two Vercel projects + one hosted Postgres**, all on free plans:

| Piece | Where | Root Directory |
| --- | --- | --- |
| Next.js site + `/admin` | Vercel project #1 | `apps/web` |
| NestJS API | Vercel project #2 (serverless) | `apps/api` |
| PostgreSQL | [Neon](https://neon.tech) free tier | — |

One Vercel project cannot serve both apps. You import the **same repository twice** and give each
project a different Root Directory.

Vercel's free plan never runs a long-lived server, so the API is deployed as a serverless function.
`apps/api/api/[[...path]].js`, `apps/api/src/serverless.ts` and `apps/api/vercel.json` exist for
that; `src/main.ts` is still what runs locally and in Docker.

---

## Step 1 — Create the database

**Option A (fewest steps):** provision it from inside Vercel after Step 3 — API project →
**Storage** → **Create Database** → **Neon**. Vercel injects `DATABASE_URL` automatically.

**Option B:** at [neon.tech](https://neon.tech) → **New Project** → pick the region closest to your
readers (Mumbai / Singapore). From the **Connection string** widget copy **both** forms:

```
# POOLED — for the running app (note the "-pooler")
postgresql://USER:PASSWORD@ep-xxxx-12345678-pooler.REGION.aws.neon.tech/neondb?sslmode=require

# DIRECT — for migrations only (same string, no "-pooler")
postgresql://USER:PASSWORD@ep-xxxx-12345678.REGION.aws.neon.tech/neondb?sslmode=require
```

Serverless functions open many short-lived connections, so the app uses the pooled URL. Prisma's
migration engine cannot run through a pooler, so migrations use the direct URL.

## Step 2 — Create the schema and seed content

From your machine, once:

```bash
cd apps/api
DATABASE_URL="<direct-url>" npx prisma migrate deploy   # tables + enums
DATABASE_URL="<direct-url>" npm run prisma:seed         # 10 roles + 4 demo accounts
DATABASE_URL="<direct-url>" npm run prisma:seed:news    # 15 bilingual demo articles
```

Skipping this leaves an empty database and the deployed API will error on every request.

## Step 3 — Deploy the API project

Vercel → **Add New → Project** → import the repository, then **before clicking Deploy**:

- **Root Directory**: `apps/api` ← the single most common mistake
- **Framework Preset**: Other
- **Environment Variables** (tick Production + Preview + Development for each):

  | Key | Value |
  | --- | --- |
  | `DATABASE_URL` | the **pooled** Neon URL |
  | `JWT_SECRET` | output of `openssl rand -base64 48` |
  | `JWT_EXPIRES_IN` | `8h` |

Do **not** set `NODE_ENV` (Vercel sets it) or `PORT` (serverless ignores it). `JWT_REFRESH_SECRET`
appears in `.env.example` but nothing reads it yet — skip it.

Deploy, then verify:

```
https://<api-project>.vercel.app/api/health          → {"status":"ok",...}
https://<api-project>.vercel.app/api/articles?locale=en   → the seeded articles
```

## Step 4 — Deploy the website project

Vercel → **Add New → Project** → import **the same repository again**:

- **Root Directory**: `apps/web`
- **Framework Preset**: Next.js (auto-detected)
- **Environment Variables**:

  | Key | Value |
  | --- | --- |
  | `NEXT_PUBLIC_API_URL` | `https://<api-project>.vercel.app` — bare origin, **no** `/api` suffix |
  | `NEXT_PUBLIC_SITE_URL` | `https://<web-project>.vercel.app` |

Both are `NEXT_PUBLIC_*`, so they are baked in **at build time** — after changing either you must
redeploy, not just restart.

Verify: `/en`, `/kn`, `/admin/login`, and an article page such as
`/en/news/state-budget-irrigation-rural-roads`.

## Step 5 — Before you share the link

1. **Change the seeded passwords.** All four demo accounts ship with `ChangeMe123!` and `/admin` is
   publicly reachable. Log in as `admin@example.com`, rotate them, and send credentials to the
   client separately from the URL.
2. **Indexing is already blocked.** `apps/web/src/app/robots.ts` serves `Disallow: /` while
   `NEXT_PUBLIC_SITE_URL` points at a `*.vercel.app` host. Point it at a real domain — or set
   `NEXT_PUBLIC_ALLOW_INDEXING=true` — to switch indexing on. `/admin` is `noindex` regardless.
3. **Warm it up.** Free-tier functions and databases sleep when idle; open the site yourself a
   minute before the client clicks.
4. **Reset the demo** any time with `npm run prisma:seed:news` against the hosted database.

## Updating after the first deploy

`git push` to `main` redeploys both projects automatically. Schema changes need
`DATABASE_URL="<direct-url>" npx prisma migrate deploy` run against Neon as well — Vercel does not
run migrations for you.

---

## Troubleshooting

### `Module '@prisma/client' has no exported member 'ArticleStatus'`

The API compiled before `prisma generate` ran — a fresh `npm install` leaves `@prisma/client` as a
stub with no model types. `apps/api`'s build script is `prisma generate && nest build`, so this is
handled; if you still hit it, something is invoking `nest build` directly.

### The build log starts with `npm run build -w apps/web && npm run build -w apps/api`

That is the **root** build script, so the project's Root Directory is the repository root. Vercel
then has no idea where the Next.js output lives and also builds the API needlessly. Fix in
**Settings → General → Root Directory** (`apps/web` or `apps/api`).

### The site deploys but shows the old placeholder layout

`NEXT_PUBLIC_API_URL` is wrong, missing, or was added after the build. The site is written to fall
back to a static demo layout when the API is unreachable, so this fails silently by design. Check
the value has no `/api` suffix and no trailing slash, then **redeploy**.

### API returns 500 on every request

Almost always the database: either `DATABASE_URL` is missing/unpooled, or Step 2 was skipped and the
schema does not exist. Check the function logs under the API project's **Logs** tab.

### First request after idle is slow

Expected. The function cold-starts and Neon wakes from scale-to-zero. Subsequent requests are fast.

---

## Free-tier limits worth knowing

- **Vercel Hobby is for non-commercial use.** If Gāḷi Suddi carries ads or subscriptions, Vercel's
  terms require a Pro plan.
- **Neon free** suspends after inactivity and wakes on the next query; 0.5 GB storage.
- **Scheduled publishing**: SCHEDULED articles are flipped to PUBLISHED by a sweep that runs on
  public reads. For exact timing, hit `POST <api>/api/admin/articles/publish-due` from a cron
  (Hobby allows one cron per day; cron-job.org is free and finer-grained).

## Alternative if the serverless API misbehaves

Nest-on-serverless is the fiddliest part of this setup. A drop-in alternative that stays free:
deploy `apps/api` to [Render](https://render.com) as a **Web Service** (root directory `apps/api`,
build `npm install && npm run build`, start `npm start`, same env vars), then point
`NEXT_PUBLIC_API_URL` at the Render URL and redeploy the website. Render's free service spins down
after 15 minutes idle (~30s cold start) but runs the API exactly as it runs locally.

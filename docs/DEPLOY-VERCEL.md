# Deploying Gāḷi Suddi on Vercel (free tier)

The monorepo becomes **two Vercel projects plus one hosted Postgres**, all on free plans:

| Piece | Where | Free plan |
| --- | --- | --- |
| Next.js site + `/admin` | Vercel project → root directory `apps/web` | Hobby |
| NestJS API | Vercel project → root directory `apps/api` (serverless) | Hobby |
| PostgreSQL | [Neon](https://neon.tech) | Free tier |

Vercel's free plan never runs a long-lived server, so the API is deployed as a serverless
function. `apps/api/api/[[...path]].js` + `apps/api/src/serverless.ts` + `apps/api/vercel.json`
exist for exactly that; `src/main.ts` is still what runs locally and in Docker.

---

## 0. Put the code on GitHub

The project is not a git repository yet:

```bash
git init
git add .
git commit -m "Gāḷi Suddi: editorial approval workflow"
gh repo create gali-suddi --private --source=. --push     # or create the repo in the GitHub UI
```

(You can skip this and use `npx vercel` from each app folder instead — Vercel's CLI deploys
without GitHub. GitHub is nicer because it gives you automatic deploys on push.)

## 1. Create the database (Neon)

1. Sign up at neon.tech → **New Project** → region closest to your users (e.g. Singapore/Mumbai).
2. Copy **both** connection strings from the dashboard:
   - the **pooled** one (`...-pooler.neon.tech/...`) → for the running app
   - the **direct** one → for migrations

## 2. Run migrations and seed against Neon

From your machine, once:

```bash
cd apps/api
DATABASE_URL="<direct-connection-string>" npx prisma migrate deploy
DATABASE_URL="<direct-connection-string>" npm run prisma:seed        # roles + demo users
DATABASE_URL="<direct-connection-string>" npm run prisma:seed:news   # bilingual demo articles
```

## 3. Deploy the API project

Vercel → **Add New → Project** → import the repo, then:

- **Root Directory**: `apps/api`
- **Framework Preset**: Other (`vercel.json` supplies the build command)
- **Environment Variables**:

  ```
  DATABASE_URL   = <pooled Neon connection string>
  JWT_SECRET     = <long random string>
  JWT_EXPIRES_IN = 8h
  NODE_ENV       = production
  ```

Deploy, then check `https://<api-project>.vercel.app/api/health` — it should return
`{"status":"ok",...}`, and `/api/articles?locale=en` should return the seeded articles.

> Generate a secret with `openssl rand -base64 48`. Do **not** reuse the dev value.

## 4. Deploy the web project

Vercel → **Add New → Project** → same repo again, then:

- **Root Directory**: `apps/web`
- **Framework Preset**: Next.js (auto-detected)
- **Environment Variables**:

  ```
  NEXT_PUBLIC_API_URL  = https://<api-project>.vercel.app
  NEXT_PUBLIC_SITE_URL = https://<web-project>.vercel.app
  ```

Deploy. The public site is at `/en` and `/kn`; the newsroom is at `/admin`.

## 5. After the first deploy

- Change every demo password. The seed sets `ChangeMe123!` for all four accounts — log in as
  `admin@example.com` and rotate them (passwords are SHA-256 hashes in the `User` table).
- Set `NEXT_PUBLIC_SITE_URL` to your custom domain once you add one, so canonical URLs and the
  sitemap point at the right host.
- Published articles are cached for 60s (`revalidate = 60`), so a newly published article appears
  on the public site within a minute.

## Free-tier limits worth knowing

- **Cold starts**: the API function sleeps when idle; the first request after a quiet period takes
  a few seconds while Nest bootstraps. Subsequent requests are fast.
- **Neon free tier** suspends the database after inactivity and wakes on the next query — the first
  query after idle is slow for the same reason.
- **Vercel Hobby is for non-commercial use.** If Gāḷi Suddi starts carrying ads or subscriptions,
  Vercel's terms require a Pro plan.
- **Scheduled publishing**: articles set to SCHEDULED are flipped to PUBLISHED by a sweep that runs
  on public reads. If you want it exact, add a Vercel Cron on the *web* project hitting
  `POST <api>/api/admin/articles/publish-due` (needs an `articles:publish` token) — Hobby allows
  one cron job per day, so a paid plan or an external cron (cron-job.org) is better for minute-level
  accuracy.

## Sending the demo to a client

Before you share the link:

1. **Change the seeded passwords.** All four demo accounts ship with `ChangeMe123!`. Rotate them
   and send the credentials to the client separately from the URL — `/admin` is reachable by
   anyone who finds it.
2. **Indexing is already handled.** `apps/web/src/app/robots.ts` returns `Disallow: /` while
   `NEXT_PUBLIC_SITE_URL` points at a `*.vercel.app` / `*.onrender.com` host, so the demo cannot
   be crawled. Point it at a real domain (or set `NEXT_PUBLIC_ALLOW_INDEXING=true`) to switch
   indexing on. `/admin` carries `robots: noindex` regardless.
3. **Warm it up before the client clicks.** Free-tier API functions and databases sleep when idle,
   so open the site once yourself a minute before sending the link.
4. **Reset the demo any time** with `npm run prisma:seed:news` against the hosted database — it
   restores the same 15 articles and their workflow states.

## Troubleshooting

### "Module '@prisma/client' has no exported member 'ArticleStatus'"

The API was compiled before `prisma generate` ran — a fresh `npm install` leaves `@prisma/client`
as a stub with no model types until it is generated from `schema.prisma`. `apps/api`'s build script
is `prisma generate && nest build`, so this is handled; if you still hit it, something is calling
`nest build` directly instead of `npm run build`.

### The build log starts with `npm run build -w apps/web && npm run build -w apps/api`

That is the **root** build script, which means the project's **Root Directory is the repository
root**. Vercel then has no idea where the Next.js output lives (the root `package.json` has no
`next` dependency, so it is detected as "Other" and looks for a `public/` folder), and it also
builds the API needlessly.

Fix it in **Project → Settings → General → Root Directory**:

| Project | Root Directory | Framework |
| --- | --- | --- |
| the website | `apps/web` | Next.js (auto-detected) |
| the API | `apps/api` | Other |

One Vercel project cannot serve both apps — create two projects from the same repository, each
with its own Root Directory. Vercel still runs `npm install` at the repository root, so the npm
workspace resolves normally.

## If the serverless API gives you trouble

The Nest-on-Vercel path is the fiddliest part of this setup. A drop-in alternative that keeps
everything free:

1. Deploy `apps/api` to [Render](https://render.com) as a **Web Service** (free plan):
   - Root directory `apps/api`, build `npm install && npx prisma generate && npm run build`,
     start `npm start`.
   - Same environment variables as above.
2. Point `NEXT_PUBLIC_API_URL` at the Render URL and redeploy the web project.

Render's free service spins down after 15 minutes of inactivity (~30s cold start) but runs the
API exactly as it runs locally, with no serverless caveats.

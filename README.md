# Premium Kannada + English News Platform

Enterprise-oriented bilingual digital news platform inspired by the supplied reference screenshot.
The project is structured as a production-ready monorepo with:

- Next.js 15 + React + TypeScript frontend
- Tailwind CSS + accessible component primitives
- NestJS + TypeScript backend
- PostgreSQL + Prisma
- Redis cache
- Elasticsearch search adapter
- RabbitMQ event adapter
- REST + GraphQL entry points
- Docker Compose
- Kubernetes manifests
- GitHub Actions CI
- Bilingual `/en/*` and `/kn/*` routing
- Locale-free newsroom admin at `/admin`
- Editorial approval workflow: Reporter → Review → Approve → Publish
- SEO, sitemap, RSS, PWA and structured-data foundations
- Server-enforced RBAC with an article audit log
- Browser-side admin login and bilingual article creation flow

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

Frontend: http://localhost:3000  
API: http://localhost:4000  
API health: http://localhost:4000/health
Swagger docs: http://localhost:4000/docs

The web app calls `NEXT_PUBLIC_API_URL` when it is set. It may be either the API origin or the full API prefix:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

If it is not set, the browser CMS defaults to:

```text
http://localhost:4000/api
```

For local frontend-only development:

```bash
cd apps/web
npm install
npm run dev
```

For backend:

```bash
cd apps/api
npm install
npm run start:dev
```

Seed the local database with languages, all editorial roles, demo accounts, a category, a district and a
sample bilingual article:

```bash
cd apps/api
npm run prisma:seed
```

Demo logins after seeding (password `ChangeMe123!` for all):

```text
admin@example.com      ADMIN
editor@example.com     EDITOR
subeditor@example.com  SUB_EDITOR
reporter@example.com   REPORTER
```

## Editorial workflow

The newsroom admin lives at `/admin` — it is deliberately outside the `/en` and `/kn` locale segments.

| Route | Purpose |
| --- | --- |
| `/admin/login` | Newsroom sign in |
| `/admin` | Dashboard with per-status counts |
| `/admin/articles` | All articles (`?status=DRAFT|APPROVED|SCHEDULED|REJECTED` filters the list) |
| `/admin/articles/new` | Create a bilingual article |
| `/admin/articles/[id]` | Edit an article + audit trail |
| `/admin/articles/review` | Pending review queue |
| `/admin/articles/review/[id]` | Side-by-side review with approve/reject actions |
| `/admin/articles/published` | Live articles |

Status flow, enforced by the API state machine in `apps/api/src/modules/articles/article-workflow.ts`:

```text
DRAFT ──submit──> REVIEW ──approve──> APPROVED ──publish──> PUBLISHED
  ^                 │                     │
  │                 ├──reject───> REJECTED ──submit──> REVIEW
  └──request-changes┘                     └──schedule─> SCHEDULED ──(due)──> PUBLISHED
```

Reporters can create, edit and submit **their own** drafts; they can never approve or publish. Editors and
sub-editors review and approve; only editors, admins and super admins publish or schedule. Every transition
writes an `AuditLog` row with the actor, the action and the old/new status.

Only `PUBLISHED` articles are served publicly, at `/en/news/[slug]` and `/kn/news/[slug]`.

The login flow calls `POST /api/auth/login` and stores the returned JWT in browser `localStorage` under
`news_admin_token`. For production, replace the development passwords, configure `JWT_SECRET`, and move
admin session handling to a hardened cookie flow.

## Deployment

See [docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md) for a free-tier recipe: the Next.js site and the
NestJS API as two Vercel projects, with Neon for PostgreSQL.

## Architecture

```text
Browser / PWA
      |
Cloudflare / CDN / WAF
      |
NGINX / Ingress
      |
Next.js Web --------------------------+
      |                               |
      +---------- REST / GraphQL -----+---- NestJS API
                                          |
                         +----------------+----------------+
                         |                |                |
                      Prisma           Redis          RabbitMQ
                         |                |                |
                     PostgreSQL      Cache/Sessions    Workers
                         |
                  S3-compatible media
                         |
                    Elasticsearch
```

## Product areas

- Public news portal
- Article pages
- District pages
- Live blogs
- Video
- Photo galleries
- Search
- User accounts
- Bookmarks
- Comments/moderation
- Subscription foundations
- E-paper foundations
- Notifications
- CMS
- Reporter workspace
- Media library
- Advertisement management
- Analytics hooks
- AI service integration points
- Social publishing integration points

## Production notes

This repository is intentionally modular. Provider-specific credentials, payment provider configuration,
OAuth secrets, push credentials, S3 buckets, Elasticsearch/RabbitMQ clusters, Cloudflare configuration,
Google services and AI providers must be configured before production deployment.

Run migrations:

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

Run tests:

```bash
npm test
```

## Design direction

The supplied screenshot is used as the visual reference: premium newspaper hierarchy, deep-red accents,
large serif headlines, compact utility navigation, editorial grids, breaking-news ticker, district carousel,
and a dense but highly legible desktop layout. The implementation also adapts that system for mobile.

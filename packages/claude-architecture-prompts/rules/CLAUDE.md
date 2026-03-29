# Fullstack AI Portfolio

This is a portfolio of 8 progressive fullstack AI apps. Each app builds on patterns from prior apps.

## Apps

| # | Directory | Repo | What it demonstrates |
|---|-----------|------|---------------------|
| 1 | `job-tracker-ai` | `job-tracker-ai` | Structured extraction + Zod validation |
| 2 | `link-saver-ai-summarizer` | `link-saver-ai` | SSE streaming + Redis caching |
| 3 | `async-ai-content-pipeline` | `ai-content-pipeline` | Tool calling + BullMQ async processing |
| 4 | `document-qa-rag` | `doc-qa-rag` | RAG with pgvector + citation system |
| 5 | `multitenant-ai-assistant` | `multitenant-ai-assistant` | Multi-tenant context scoping + conversation summarization |
| 6 | `realtime-ai-collaboration` | `realtime-ai-collab` | Human-in-the-loop + Socket.IO real-time |
| 7 | `ai-research-assistant` | `ai-research-assistant` | Compound AI: all patterns from 1-6 combined |
| 8 | `agentic-travel-agent` | `agentic-travel-agent` | Agentic tool-use loop with real external APIs |

## How to build an app

1. `cd` into the app directory
2. Read `FULL_APPLICATION_SPEC.md` — it is the complete spec (product summary, system design, DB schema, task breakdown)
3. Follow the three-phase task list: **POC (Days 1-3)** → **Week 1** → **Week 2**
4. Each phase has a "done" paragraph describing the deliverable, then checkbox tasks

## Shared stack (all apps)

- **Frontend:** Next.js on Vercel
- **API:** Express + TypeScript on Railway
- **Database:** PostgreSQL on Neon (pgvector in apps 4-8)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **Queue/Cache:** Railway Redis + BullMQ (apps 3+)
- **LLM:** Anthropic Claude API
- **Monorepo:** `packages/api`, `packages/worker` (apps 3+), `packages/web`, `packages/common` (apps 4+)

## MCP servers available

These are configured and available for use during development:

| Server | What it does |
|--------|-------------|
| `railway` | Deploy services, check logs, manage env vars |
| `neon` | Create databases, run migrations, query data |
| `supabase` | Manage auth, storage buckets, RLS policies |
| `vercel` | Deploy frontends, check builds, manage env vars |
| `sentry` | View/triage errors, analyze patterns |
| `cloudflare` | Manage R2 storage buckets |
| `github` | Repos, PRs, issues, Actions CI/CD |
| `google-maps` | Google Places API for app 8 experiences |
| `amadeus` | Flight/hotel search API for app 8 |
| `resend` | Transactional email for apps 5, 7 |

## Code Convention Files

These files define the standardized rules for every app in this portfolio. **Read the relevant file(s) before writing any code or running any deployment.** Use the guide that matches what you are working on — do not skip this step.

| File | When to read | Covers |
|------|-------------|--------|
| `CLAUDE-FRONTEND.md` | Any work in `packages/web` or `web-client/` | Components, hooks, state, API calls, Next.js patterns, formatting |
| `CLAUDE-BACKEND.md` | Any work in `packages/api` or `packages/worker` | Express layers, handlers, repos, services, validation, formatting |
| `CLAUDE-DATABASE.md` | Writing or modifying migrations, queries, or schema | Schema design, migrations, SQL patterns, type mapping |
| `CLAUDE-STYLING.md` | Any frontend styling work | SCSS modules, CSS custom properties, responsive, typography |
| `CLOUD-DEPLOYMENT.md` | Any deployment task (Railway, Cloudflare, Vercel, env vars) | Railway deploy workflow, env var requirements, Cloudflare R2 setup, staging vs production checklist |

**Quick reference — which file applies:**
- Writing a React component or page → `CLAUDE-FRONTEND.md` + `CLAUDE-STYLING.md`
- Writing an Express route, service, or repo → `CLAUDE-BACKEND.md`
- Writing a BullMQ worker → `CLAUDE-BACKEND.md`
- Adding or changing a DB table or migration → `CLAUDE-DATABASE.md`
- Deploying to Railway, setting env vars, or configuring Cloudflare storage → `CLOUD-DEPLOYMENT.md`
- Deploying the frontend to Vercel → `CLOUD-DEPLOYMENT.md`

## Conventions

- Every app has its own repo but lives in this portfolio directory during development
- FULL_APPLICATION_SPEC.md is the source of truth — don't deviate from the spec without discussion
- Reuse code from prior apps where noted (chunking from app 4, SSE from app 2, etc.)
- POC phase = get the core loop working end-to-end, deployed. Everything else is polish.
- **Commit after every TODO task** — each completed checkbox task in the spec gets its own commit. Do not batch multiple tasks into a single commit.
- **Branch per task** — every TODO task gets its own branch off `main`. Once the task is complete and tests pass, merge the branch into `main` and delete it. This enables multiple agents to work in parallel without conflicts.

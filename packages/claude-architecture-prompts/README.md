# @bottomlessmargaritas/claude-architecture-prompts

Canonical Claude convention files for fullstack TypeScript applications. Install once, get standardized rules for backend, frontend, database, styling, and deployment.

## Installation

```bash
npm install @bottomlessmargaritas/claude-architecture-prompts
```

On install, the postinstall hook copies all rule files into `.claude/bottomlessmargaritas/` at your project root.

## What's included

| File | Covers |
|------|--------|
| `CLAUDE.md` | Index — lists all convention files, shared stack, testing, and commit conventions |
| `CLAUDE-BACKEND.md` | Express layers, handlers, repos, services, Zod validation, Pino logging, formatting |
| `CLAUDE-FRONTEND.md` | Next.js App Router, React components, TanStack Query, hooks, API calls, formatting |
| `CLAUDE-DATABASE.md` | PostgreSQL schema design, node-pg-migrate migrations, SQL patterns, type mapping |
| `CLAUDE-STYLING.md` | SCSS modules, CSS custom properties, responsive breakpoints, typography |
| `CLOUD-DEPLOYMENT.md` | Railway, Vercel, Cloudflare R2, GCP Secret Manager, env vars, staging/production |
| `CLAUDE-MULTI-REPO.md` | Multi-agent work, audit-first workflow, prompt minimization, model routing |
| `CLAUDE-SPEC-TO-BUILD.md` | Spec-to-build workflow, task decomposition, TDD process, feasibility assessment |

## Referencing from your app's CLAUDE.md

Claude Code only auto-loads files named `CLAUDE.md`. To make the convention files discoverable, add a reference block to your project's `CLAUDE.md`:

```markdown
## Shared convention files

Read the relevant file in `.claude/bottomlessmargaritas/` **before writing code** in that layer:

- **Backend:** `.claude/bottomlessmargaritas/CLAUDE-BACKEND.md`
- **Frontend:** `.claude/bottomlessmargaritas/CLAUDE-FRONTEND.md`
- **Database:** `.claude/bottomlessmargaritas/CLAUDE-DATABASE.md`
- **Styling:** `.claude/bottomlessmargaritas/CLAUDE-STYLING.md`
- **Deployment:** `.claude/bottomlessmargaritas/CLOUD-DEPLOYMENT.md`
```

Only include the files relevant to your project. A backend-only app doesn't need the frontend or styling references.

## CLI usage

The postinstall hook runs automatically. You can also run it manually:

```bash
# Copy rules to .claude/bottomlessmargaritas/
npx claude-architecture-prompts

# Preview what would be copied
npx claude-architecture-prompts --dry-run
```

## Updating

```bash
npm update @bottomlessmargaritas/claude-architecture-prompts
```

The postinstall hook runs again, overwriting changed files and removing stale ones. Unchanged files are skipped.

## Version control

**Commit the `.claude/bottomlessmargaritas/` directory to git.** This ensures convention files are available immediately on clone — before `npm install` runs — so Claude has access to them from the start of any session.

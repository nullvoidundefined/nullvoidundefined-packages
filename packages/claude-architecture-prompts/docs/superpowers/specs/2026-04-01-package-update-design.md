# Design: Update @bottomlessmargaritas/claude-architecture-prompts to v3.0.0

**Date:** 2026-04-01
**Status:** Approved

## Goal

Make `@bottomlessmargaritas/claude-architecture-prompts` the single source of truth for Claude convention files. Eliminate the duplicate set of files at `personal/.claude/` and update all consuming apps to reference the package-installed copies.

## Current State

Two copies of convention files exist:
1. `personal/.claude/` — manually maintained, latest content, referenced via absolute paths from each app's `CLAUDE.md`
2. Package `rules/` directory — published to npm, installed via postinstall into `.claude/bottomlessmargaritas/`, content is stale

Apps reference the `personal/.claude/` copies using absolute paths like `/Users/iangreenough/Desktop/code/personal/.claude/CLAUDE-BACKEND.md`. This breaks on other machines.

## Design

### 1. Content Merge

Replace 5 stale files in `rules/` with latest versions from `personal/.claude/`:
- `CLAUDE-BACKEND.md` — latest from `personal/.claude/`
- `CLAUDE-FRONTEND.md` — latest from `personal/.claude/`
- `CLAUDE-DATABASE.md` — latest from `personal/.claude/`
- `CLAUDE-STYLING.md` — latest from `personal/.claude/`
- `CLOUD-DEPLOYMENT.md` — latest from `personal/.claude/`

Keep 2 package-only files as-is:
- `CLAUDE-MULTI-REPO.md` — multi-agent work guidance
- `CLAUDE-SPEC-TO-BUILD.md` — spec-to-build workflow

Update `CLAUDE.md` index:
- Keep the existing convention file table and quick-reference
- Add a "Testing" section (Vitest + Supertest backend, Vitest + RTL frontend, Playwright E2E)
- Add a "UI Component Library" section (Radix UI primitives, SCSS module styling)

### 2. README

New `README.md` covering:
- What the package does (one-liner)
- Installation (`npm install @bottomlessmargaritas/claude-architecture-prompts`)
- What happens on install (postinstall copies rules to `.claude/bottomlessmargaritas/`)
- File listing with one-line descriptions
- How to reference from your app's `CLAUDE.md` (copy-pasteable reference block)
- Manual CLI usage (`npx claude-architecture-prompts`, `--dry-run`)

### 3. Version Bump

Bump to **3.0.0** — breaking change because file contents changed significantly.

### 4. No CLI Changes

`bin/cli.js` already handles:
- Project root detection (walks up for `package.json`)
- Copy with skip-if-unchanged (content comparison)
- Stale file cleanup (removes old files matching `CLAUDE-*`, `CLOUD-*` prefixes)
- `--dry-run` flag

No changes needed.

### 5. Cleanup Outside Package

**Remove from `personal/.claude/`:**
- `CLAUDE-BACKEND.md`
- `CLAUDE-FRONTEND.md`
- `CLAUDE-DATABASE.md`
- `CLAUDE-STYLING.md`
- `CLOUD-DEPLOYMENT.md`

**Keep in `personal/.claude/`:**
- `CLAUDE.md` — generic root-level guide (not the same as the package's index)
- `settings.local.json` — permissions

**Update each app's `CLAUDE.md`:**
Change the "Shared convention files" section from absolute paths to local references:
```markdown
## Shared convention files

Read the relevant file in `.claude/bottomlessmargaritas/` **before writing code** in that layer:

- **Backend:** `.claude/bottomlessmargaritas/CLAUDE-BACKEND.md`
- **Frontend:** `.claude/bottomlessmargaritas/CLAUDE-FRONTEND.md`
- **Database:** `.claude/bottomlessmargaritas/CLAUDE-DATABASE.md`
- **Styling:** `.claude/bottomlessmargaritas/CLAUDE-STYLING.md`
- **Deployment:** `.claude/bottomlessmargaritas/CLOUD-DEPLOYMENT.md`
```

### 6. Publish

```bash
cd tools/nullvoidundefined-packages/packages/claude-architecture-prompts
npm publish --access public
```

## Out of Scope

- Auto-injecting references into app `CLAUDE.md` (manual, documented in README)
- Changing the postinstall target directory (stays `.claude/bottomlessmargaritas/`)
- Changes to `bin/cli.js` logic
- Changes to other packages in the monorepo

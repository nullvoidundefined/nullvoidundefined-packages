# Generating Technical Summary Content

This prompt defines how to generate the `technical-summary.md` file for the `App Documents/` folder. The Technical Summary is the second link in the nav bar and serves as a mid-level technical overview for developers who want to understand the system without reading the full codebase.

---

## Purpose

The Technical Summary answers: **"How is this app built, and what are the key technical decisions?"** It is written for developers — engineers evaluating the project, teammates onboarding, or the original author returning after time away. It covers architecture, patterns, and decisions at a level between the non-technical Summary and the exhaustive Technical Overview.

## Target File

```
App Documents/technical-summary.md
```

## Structure

Generate the markdown file with exactly these sections, in this order:

### 1. Title

```markdown
# [App Name] — Technical Summary
```

### 2. Architecture Overview

A section under `## Architecture` with 2–3 paragraphs describing the system's high-level shape:

- What are the major components? (frontend, API, workers, database, external services)
- How do they communicate? (REST, WebSocket, queues, direct calls)
- What is the deployment topology? (monorepo vs multi-repo, where each piece runs)

**Rules:**

- Name specific technologies: "Express API on Railway", not "a backend server"
- Describe the data flow at a high level: request comes in here, goes through here, ends up here
- No code — this is prose with technical vocabulary
- If the app has a monorepo structure, describe the package layout

### 3. Stack

A section under `## Stack` organized as a markdown table:

```markdown
## Stack

| Layer        | Technology             | Purpose                              |
| ------------ | ---------------------- | ------------------------------------ |
| Frontend     | Next.js 15 (App Router)| SSR, routing, React UI               |
| API          | Express + TypeScript   | REST endpoints, validation           |
| Database     | PostgreSQL (Neon)      | Persistent storage                   |
| Auth         | Supabase Auth          | JWT sessions, OAuth                  |
| AI           | Claude API (Anthropic) | Structured extraction, generation    |
| Queue        | BullMQ + Redis         | Async job processing                 |
| Deployment   | Vercel + Railway       | Frontend hosting + API hosting       |
```

**Rules:**

- One row per technology, not per package
- "Purpose" column uses 3–6 word phrases, not sentences
- Include every significant technology in the stack — don't omit the boring ones (linting, formatting)
- Group by layer: Frontend, API/Backend, Database, Auth, AI/LLM, Infrastructure, Dev Tooling

### 4. Key Patterns

A section under `## Key Patterns` with 3–6 patterns, each as a `###` subheading with a 2–4 sentence explanation.

A "pattern" is a recurring architectural or implementation approach used in the app. Examples:

- Structured extraction with schema validation
- SSE streaming for real-time AI responses
- Tool calling with async job processing
- RAG with vector search and citation
- Multi-tenant context scoping
- Human-in-the-loop approval flows

```markdown
### Structured Extraction + Validation

Claude receives unstructured text (job postings, emails) and returns JSON matching a Zod schema. The API validates every response before persisting, catching hallucinated fields, wrong types, and missing data. Failed validations trigger a retry with the validation errors fed back to the prompt.
```

**Rules:**

- Each pattern gets a descriptive name as a heading
- Explain what the pattern is, why it's used, and how it works at a high level
- Reference specific technologies by name
- No code snippets — save those for the Technical Overview
- These should be the patterns that make this app architecturally interesting

### 5. Data Flow

A section under `## Data Flow` describing the primary request lifecycle as a numbered sequence:

```markdown
## Data Flow

1. **User pastes a job posting** into the frontend form
2. **Frontend sends POST** to `/api/jobs/extract` with the raw text
3. **API constructs a Claude prompt** with the system message and Zod schema description
4. **Claude returns structured JSON** with extracted fields
5. **API validates with Zod** — retries up to 2 times on validation failure
6. **Validated data is persisted** to PostgreSQL via the job repository
7. **API returns the structured job** to the frontend for display
```

**Rules:**

- 5–10 steps covering the primary happy path
- Bold the first phrase of each step (the actor or action)
- Name specific endpoints, functions, or services where it clarifies
- One data flow only — pick the most representative request. If the app has multiple distinct flows, pick the one that showcases the most patterns and mention the others exist in a closing sentence.

### 6. API Surface

A section under `## API Endpoints` with a markdown table listing the key endpoints:

```markdown
## API Endpoints

| Method | Path                    | Purpose                        |
| ------ | ----------------------- | ------------------------------ |
| POST   | `/api/jobs/extract`     | Extract structured job data    |
| GET    | `/api/jobs`             | List all saved jobs            |
| GET    | `/api/jobs/:id`         | Get a single job by ID         |
| DELETE | `/api/jobs/:id`         | Delete a job                   |
```

**Rules:**

- Only list the endpoints that exist in the app — don't invent CRUD operations that aren't implemented
- Method, path, and a 3–6 word purpose description
- If the app has no REST API (e.g., it's frontend-only), skip this section entirely
- Group related endpoints together (jobs, auth, settings)

### 7. Database Schema

A section under `## Database Schema` describing the key tables. For each table, a brief markdown table showing columns:

```markdown
## Database Schema

### `jobs`

| Column       | Type         | Notes                   |
| ------------ | ------------ | ----------------------- |
| `id`         | `uuid`       | Primary key, generated  |
| `title`      | `text`       | Extracted job title     |
| `company`    | `text`       | Extracted company name  |
| `salary_min` | `integer`    | Nullable                |
| `salary_max` | `integer`    | Nullable                |
| `created_at` | `timestamptz`| Default `now()`         |
```

**Rules:**

- Only include tables that the app creates and owns — not third-party tables (Supabase auth tables, etc.)
- Column, type, and a brief note (nullable, default, foreign key, etc.)
- If the app has no database, skip this section entirely
- Don't list every column of every table — focus on the interesting ones. Omit standard audit columns if there are many tables.

### 8. Environment Variables

A section under `## Environment Variables` as a markdown table:

```markdown
## Environment Variables

| Variable              | Required | Description                      |
| --------------------- | -------- | -------------------------------- |
| `DATABASE_URL`        | Yes      | Neon PostgreSQL connection string|
| `ANTHROPIC_API_KEY`   | Yes      | Claude API key                   |
| `SUPABASE_URL`        | Yes      | Supabase project URL             |
| `SUPABASE_ANON_KEY`   | Yes      | Supabase anonymous key           |
| `REDIS_URL`           | No       | Redis connection (for BullMQ)    |
```

**Rules:**

- List every environment variable the app requires
- Mark required vs optional
- Brief description — what it's for, not how to get it
- Never include actual values, secrets, or example keys
- If the app has no env vars, skip this section

### 9. Key Decisions

A section under `## Decisions` with 3–5 bullet points explaining the most important architectural decisions and their reasoning:

```markdown
## Decisions

- **Zod over Joi/Yup** — TypeScript-first with `z.infer<>` for zero-drift between schema and types. Parse-don't-validate philosophy matches the extraction pattern.
- **No ORM** — Raw SQL via a thin repository layer. The queries are simple enough that an ORM adds complexity without benefit. Repositories return plain objects, not model instances.
- **SSE over WebSocket** — Unidirectional streaming (server → client) is all that's needed for AI responses. SSE is simpler, works through proxies, and auto-reconnects natively.
```

**Rules:**

- Format: `**Decision** — Reasoning`
- Each decision explains what was chosen AND why the alternatives were not
- Focus on decisions where reasonable engineers might disagree
- These should be genuinely interesting trade-offs, not obvious choices

---

## Content Rules

1. **Length:** 800–1200 words total (excluding headings and tables)
2. **Markdown only:** No HTML, no JSX, no frontmatter
3. **No code blocks** of application code — use endpoint paths, table/column names, and technology names inline instead
4. **Technical vocabulary is expected** — don't over-explain what REST or PostgreSQL is
5. **Headings hierarchy:** `#` for title, `##` for sections, `###` for sub-items
6. **Tables:** Use markdown tables for structured reference information (stack, endpoints, schema, env vars)
7. **Tone:** Direct, precise, opinionated. Write as if you're briefing a senior engineer joining the project.

---

## Example: Generating for a New App

1. Read the app's CLAUDE.md, README, package.json, and source code
2. Map the architecture: what are the pieces and how do they connect?
3. Identify the key patterns — what makes this app technically interesting?
4. Trace the primary data flow from user action to stored result
5. Catalog the API endpoints, database tables, and environment variables
6. Identify the 3–5 most important architectural decisions
7. Write the document following the structure above
8. Verify: could a senior engineer read this and have a solid mental model of the system? If not, add detail.
9. Verify: is anything duplicating the Summary (too high-level) or the Technical Overview (too detailed)? Adjust.
10. Save to `App Documents/technical-summary.md`

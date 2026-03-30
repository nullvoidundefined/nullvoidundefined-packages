# Generating Technical Overview Content

This prompt defines how to generate the `technical-overview.md` file for the `App Documents/` folder. The Technical Overview is the third link in the nav bar and serves as a deep-dive reference document — the most detailed and comprehensive of the four content types.

---

## Purpose

The Technical Overview answers: **"How does every part of this system actually work, down to the implementation level?"** It is the document a developer reads when they need to modify, debug, or extend the application. It includes code patterns, file-by-file explanations, configuration details, and implementation rationale that go far beyond the Technical Summary.

Think of it this way:

- **Summary** → What the app does (non-technical)
- **Technical Summary** → How the app is built (architectural overview)
- **Technical Overview** → How every piece works (implementation reference)

## Target File

```
App Documents/technical-overview.md
```

## Structure

Generate the markdown file with these sections. Unlike the Summary and Technical Summary, the Technical Overview is longer and more detailed. Not every section applies to every app — skip sections that don't apply, but include all that do.

### 1. Title

```markdown
# [App Name] — Technical Overview
```

### 2. Table of Contents

Generate a markdown table of contents with links to each section. This document is long enough to need navigation.

```markdown
## Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Frontend](#frontend)
- [API Layer](#api-layer)
- [Database](#database)
- [AI Integration](#ai-integration)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Configuration](#configuration)
```

### 3. Architecture

A section under `## Architecture` with a detailed description of the system architecture. This goes deeper than the Technical Summary's architecture section:

- Describe each major component and its responsibility
- Explain the communication protocols between components
- Describe the deployment topology in detail
- If there's a monorepo, explain the package boundaries and what each package owns
- Include an ASCII architecture diagram if helpful:

```markdown
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Next.js    │────▶│   Express   │────▶│  PostgreSQL   │
│   Frontend   │     │     API     │     │   (Neon)      │
└─────────────┘     └──────┬──────┘     └──────────────┘
                           │
                    ┌──────▼──────┐
                    │   Claude    │
                    │    API      │
                    └─────────────┘
```

**Rules:**

- ASCII diagrams are encouraged but not required
- Label every arrow with the protocol or method (REST, WebSocket, SQL, etc.)
- Mention port numbers and base URLs if they're configurable

### 4. Project Structure

A section under `## Project Structure` with the complete directory tree of the project, annotated:

```markdown
## Project Structure

\```
packages/
├── api/
│   ├── src/
│   │   ├── handlers/          # Express route handlers (one per resource)
│   │   │   ├── jobHandler.ts  # POST /extract, GET /, GET /:id, DELETE /:id
│   │   │   └── healthHandler.ts
│   │   ├── services/          # Business logic (orchestration, AI calls)
│   │   │   └── extractionService.ts
│   │   ├── repositories/      # Database access (raw SQL, returns plain objects)
│   │   │   └── jobRepository.ts
│   │   ├── middleware/         # Auth, error handling, CORS, rate limiting
│   │   ├── schemas/           # Zod schemas (shared validation)
│   │   ├── config/            # Environment, database pool, Redis client
│   │   └── index.ts           # Express app setup + route registration
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # Shared React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # API client, query client, utilities
│   │   └── types/             # Frontend TypeScript types
│   └── package.json
└── common/                    # Shared types and schemas
    └── src/
        ├── types.ts
        └── schemas.ts
\```
```

**Rules:**

- Show the actual directory structure of the app — don't invent one
- Annotate key directories and files with inline comments (`# purpose`)
- Go 3–4 levels deep, deeper for important directories
- Omit `node_modules`, `.git`, build output directories, and lockfiles
- If the structure is flat (few files), show every file. If deep, show the pattern and representative files.

### 5. Frontend

A section under `## Frontend` covering:

#### Component Architecture

- List the key components and their responsibilities
- Describe the component hierarchy (what renders what)
- Explain any component patterns (compound components, render props, HOCs)

#### State Management

- What state management approach is used (Context, TanStack Query, useState, etc.)
- What state lives where (server state vs client state vs URL state)
- How data flows from API → cache → component

#### Routing

- Route structure and any route groups
- Protected vs public routes
- How auth state affects routing

#### Key Components (Detail)

For the 3–5 most important or complex components, provide a detailed description:

```markdown
### `ChatBox`

The main chat interface component. Manages message history, streaming responses, and tool-use display.

**State:**
- `messages` — array of message objects, managed via `useReducer`
- `isStreaming` — boolean, true while an SSE response is active
- `toolProgress` — map of tool call IDs to their status

**Behavior:**
- On submit, appends the user message and opens an EventSource to `/api/chat/stream`
- Streaming tokens are appended to the last assistant message in real-time
- Tool calls create progress indicators that update as results arrive
- Auto-scrolls to bottom on new content via `useRef` on the message container

**Key implementation detail:** The EventSource is stored in a `useRef` to survive re-renders. Cleanup on unmount calls `.close()` to prevent orphaned connections.
```

**Rules:**

- Focus on components that are architecturally interesting — not every button and form
- Describe state, behavior, and key implementation details
- Mention any non-obvious patterns or gotchas
- Include the component name as an inline code heading

### 6. API Layer

A section under `## API Layer` covering:

#### Layered Architecture

Explain the handler → service → repository pattern (or whatever pattern the app uses):

- **Handlers** — HTTP concerns: parse request, call service, format response
- **Services** — Business logic: orchestration, AI calls, validation
- **Repositories** — Data access: SQL queries, returns plain objects

#### Endpoint Details

For each endpoint or endpoint group, provide:

- Method, path, and purpose
- Request body/params shape
- Response shape
- Error cases and status codes
- Any middleware applied (auth, rate limiting, validation)

#### Middleware

List and explain each middleware:

- What it does
- What routes it applies to
- Configuration or environment variables it depends on

### 7. Database

A section under `## Database` covering:

- Complete schema with all tables, columns, types, constraints, and indexes
- Migration strategy (how migrations are run, naming conventions)
- Query patterns (raw SQL, query builder, ORM — and why)
- Connection pooling configuration
- Any extensions (pgvector, pg_trgm, etc.)

### 8. AI Integration

A section under `## AI Integration` covering:

- Which AI provider and model(s) are used
- System prompt strategy (where prompts live, how they're constructed)
- Input/output schemas for AI calls
- Retry and error handling for AI responses
- Streaming implementation details (if applicable)
- Token usage and cost considerations
- Any prompt chaining or multi-step AI workflows

This section should include actual prompt templates or describe their structure in detail. The AI integration is often the most architecturally interesting part of these apps.

### 9. Authentication

A section under `## Authentication` covering:

- Auth provider and strategy (JWT, session, OAuth, etc.)
- How auth state is managed (cookies, headers, context)
- Protected route implementation
- Token refresh and expiration handling
- CORS and CSRF configuration

Skip this section if the app has no authentication.

### 10. Error Handling

A section under `## Error Handling` covering:

- Error handling strategy (global error handler, per-route, etc.)
- Error response format
- Frontend error display (toast, inline, error boundaries)
- Logging approach
- How AI errors are handled differently from regular errors

### 11. Testing

A section under `## Testing` covering:

- Testing framework and tools
- Test structure and naming conventions
- What is tested (unit, integration, e2e)
- How to run tests
- Any test utilities or helpers

Skip this section if the app has no tests.

### 12. Deployment

A section under `## Deployment` covering:

- Where each component is deployed
- CI/CD pipeline (GitHub Actions, etc.)
- Environment variable management per environment
- Build and deploy commands
- Any infrastructure-as-code (Terraform, Pulumi, etc.)

### 13. Configuration Reference

A final section under `## Configuration` with a comprehensive table of every configuration value:

```markdown
## Configuration

| Variable              | Required | Default | Description                              |
| --------------------- | -------- | ------- | ---------------------------------------- |
| `DATABASE_URL`        | Yes      | —       | PostgreSQL connection string              |
| `ANTHROPIC_API_KEY`   | Yes      | —       | Claude API key                            |
| `PORT`                | No       | `3001`  | API server port                           |
| `NODE_ENV`            | No       | `development` | Environment mode                    |
```

---

## Content Rules

1. **Length:** 1500–3000 words total (excluding code blocks, tables, and headings). This is the longest document.
2. **Markdown only:** No HTML, no JSX, no frontmatter
3. **Code blocks are encouraged** — unlike the Summary and Technical Summary, the Technical Overview should include representative code snippets showing key patterns. Use fenced code blocks with language tags.
4. **Keep code snippets focused** — show the pattern, not the entire file. 5–20 lines per snippet. Add a comment above explaining what the snippet demonstrates.
5. **Headings hierarchy:** `#` for title, `##` for major sections, `###` for subsections, `####` for sub-subsections
6. **Tables** for structured reference data (schema, config, endpoints)
7. **Tone:** Precise, thorough, reference-style. Write as if creating internal documentation that the team will consult daily. No hand-holding, but no assumptions about project-specific knowledge.

---

## Example: Generating for a New App

1. Read every source file in the project — this document requires full codebase knowledge
2. Map the complete architecture: components, layers, data flow, external services
3. For each section, extract the relevant details from the source code
4. Include code snippets that demonstrate key patterns (not boilerplate)
5. Document every configuration value, environment variable, and deployment step
6. Write the document following the structure above, skipping sections that don't apply
7. Verify: could a developer who has never seen this codebase modify any part of it using only this document? If not, add detail.
8. Verify: are there implementation details here that aren't in the Technical Summary? (There should be many.) Are there high-level explanations here that belong in the Summary instead? (There should be none.)
9. Save to `App Documents/technical-overview.md`

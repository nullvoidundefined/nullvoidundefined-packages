# Generating Technical Overview Content

This prompt defines how to generate the `technical-overview.md` file. The Technical Overview is the third link in the doc-bar and serves as a deep-dive reference document — the most detailed and comprehensive of the four content types.

---

## Purpose

The Technical Overview answers: **"How does every part of this system actually work, down to the implementation level?"** It is the document a developer reads when they need to modify, debug, or extend the application. It includes code patterns, file-by-file explanations, configuration details, and implementation rationale that go far beyond the Technical Summary.

Think of it this way:

- **Summary** → What the app does (non-technical)
- **Technical Summary** → How the app is built (architectural overview)
- **Technical Overview** → How every piece works (implementation reference)

## Target File

```
technical-overview.md
```

## Structure

Generate the markdown file with these sections. Unlike the Summary and Technical Summary, the Technical Overview is longer and more detailed. Not every section applies to every project — skip sections that don't apply, but include all that do.

### Version Stamp (required first line)

The very first line of the generated file **must** be the following HTML comment. The doc-bar component checks for this stamp and will prompt the user to regenerate if it is missing or outdated.

```markdown
<!-- @bottomlessmargaritas/doc-bar format:1 -->
```

This line must appear before anything else — before the title, before any blank lines.

### 1. Title

```markdown
<!-- @bottomlessmargaritas/doc-bar format:1 -->
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
- Include an ASCII architecture diagram if helpful

**Rules:**

- ASCII diagrams are encouraged but not required
- Label every arrow with the protocol or method (REST, WebSocket, SQL, etc.)
- Mention port numbers and base URLs if they're configurable

### 4. Project Structure

A section under `## Project Structure` with the complete directory tree of the project, annotated:

**Rules:**

- Show the actual directory structure of the project — don't invent one
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

For the 3–5 most important or complex components, provide a detailed description including state, behavior, and key implementation details.

**Rules:**

- Focus on components that are architecturally interesting — not every button and form
- Mention any non-obvious patterns or gotchas
- Include the component name as an inline code heading

### 6. API Layer

A section under `## API Layer` covering:

- Layered architecture (handler → service → repository, or whatever pattern the app uses)
- Endpoint details: method, path, request/response shapes, error cases, middleware
- Middleware list with what each does and where it applies

### 7. Database

A section under `## Database` covering:

- Complete schema with all tables, columns, types, constraints, and indexes
- Migration strategy (how migrations are run, naming conventions)
- Query patterns (raw SQL, query builder, ORM — and why)
- Connection pooling configuration
- Any extensions (pgvector, pg_trgm, etc.)

### 8. Authentication

A section under `## Authentication` covering:

- Auth provider and strategy (JWT, session, OAuth, etc.)
- How auth state is managed (cookies, headers, context)
- Protected route implementation
- Token refresh and expiration handling
- CORS and CSRF configuration

Skip this section if the app has no authentication.

### 9. Error Handling

A section under `## Error Handling` covering:

- Error handling strategy (global error handler, per-route, etc.)
- Error response format
- Frontend error display (toast, inline, error boundaries)
- Logging approach

### 10. Testing

A section under `## Testing` covering test framework, structure, what is tested, how to run tests.

Skip this section if the app has no tests.

### 11. Deployment

A section under `## Deployment` covering where each component is deployed, CI/CD, env var management, build commands.

### 12. Configuration Reference

A final section under `## Configuration` with a comprehensive table of every configuration value.

---

## External Documentation Links

**This is important.** When the Technical Overview references specific technologies, patterns, or concepts that a developer might want to learn more about, include links to the official documentation or authoritative resources. These links add significant value for developers who are unfamiliar with a particular technology in the stack.

### When to Include Links

Include a link when:

- Introducing a technology for the first time in the document (e.g., first mention of a framework, library, or service)
- Describing a specific pattern or concept that has canonical documentation (e.g., React Server Components, CSS custom properties, middleware pipelines)
- Referencing a configuration option or API that has dedicated docs (e.g., Next.js `next.config.ts` options, ESLint rule documentation)
- Explaining an architectural decision where the alternative is well-documented (link to both)

### How to Include Links

- Use inline markdown links: `[React Server Components](https://react.dev/reference/rsc/server-components)`
- Link to the most specific page possible — not the homepage, but the relevant concept or API page
- Prefer official documentation over blog posts or tutorials
- Include links naturally in the prose — don't create a separate "Resources" section

### Examples

```markdown
The API uses the [repository pattern](https://martinfowler.com/eaaCatalog/repository.html) to separate data access from business logic.

Authentication is handled by [Supabase Auth](https://supabase.com/docs/guides/auth) using JWT tokens stored in HTTP-only cookies.

The frontend uses [CSS Modules](https://github.com/css-modules/css-modules) for component-scoped styling, which avoids class name collisions without runtime overhead.

State management follows the [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) pattern where server state is cached and synchronized automatically.

Error boundaries use React's [`ErrorBoundary`](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) API to catch rendering errors without crashing the entire app.
```

### Common Documentation Sources

Use these as reference points when linking:

| Technology | Documentation Root |
|---|---|
| React | `https://react.dev/reference/react` |
| Next.js | `https://nextjs.org/docs` |
| TypeScript | `https://www.typescriptlang.org/docs/handbook` |
| Node.js | `https://nodejs.org/docs/latest/api` |
| Express | `https://expressjs.com/en/guide` |
| PostgreSQL | `https://www.postgresql.org/docs/current` |
| ESLint | `https://eslint.org/docs/latest` |
| Prettier | `https://prettier.io/docs/en` |
| Sass/SCSS | `https://sass-lang.com/documentation` |
| Tailwind CSS | `https://tailwindcss.com/docs` |
| Supabase | `https://supabase.com/docs` |
| Vercel | `https://vercel.com/docs` |
| Martin Fowler (patterns) | `https://martinfowler.com/eaaCatalog` |
| MDN Web Docs (web APIs) | `https://developer.mozilla.org/en-US/docs/Web` |

---

## Content Rules

1. **Length:** 1500–3000 words total (excluding code blocks, tables, and headings). This is the longest document.
2. **Markdown only:** No HTML, no JSX, no frontmatter
3. **Code blocks are encouraged** — unlike the Summary and Technical Summary, the Technical Overview should include representative code snippets showing key patterns. Use fenced code blocks with language tags.
4. **Keep code snippets focused** — show the pattern, not the entire file. 5–20 lines per snippet. Add a comment above explaining what the snippet demonstrates.
5. **External documentation links are encouraged** — link to official docs for technologies, patterns, and concepts. See the External Documentation Links section above.
6. **Headings hierarchy:** `#` for title, `##` for major sections, `###` for subsections, `####` for sub-subsections
7. **Tables** for structured reference data (schema, config, endpoints)
8. **Tone:** Precise, thorough, reference-style. Write as if creating internal documentation that the team will consult daily. No hand-holding, but no assumptions about project-specific knowledge.

---

## Generating for a New Project

1. Read every source file in the project — this document requires full codebase knowledge
2. Map the complete architecture: components, layers, data flow, external services
3. For each section, extract the relevant details from the source code
4. Include code snippets that demonstrate key patterns (not boilerplate)
5. Add links to official documentation for every significant technology, pattern, or concept referenced
6. Document every configuration value, environment variable, and deployment step
7. Write the document following the structure above, skipping sections that don't apply
8. Verify: could a developer who has never seen this codebase modify any part of it using only this document? If not, add detail.
9. Verify: are external links present for key technologies and patterns? A developer should be able to click through to learn more about anything unfamiliar.

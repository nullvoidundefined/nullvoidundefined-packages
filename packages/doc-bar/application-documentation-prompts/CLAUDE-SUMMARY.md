# Generating Summary Content

This prompt defines how to generate the `summary.md` file. The Summary is the first link in the doc-bar and serves as a high-level, non-technical overview of the application for a general audience.

---

## Purpose

The Summary document answers: **"What does this app do, and why does it matter?"** It is written for a broad audience — product managers, designers, stakeholders, or developers unfamiliar with the project. No code, no architecture diagrams, no implementation details.

## Target File

```
summary.md
```

## Structure

Generate the markdown file with exactly these sections, in this order:

### Version Stamp (required first line)

The very first line of the generated file **must** be the following HTML comment. The doc-bar component checks for this stamp and will prompt the user to regenerate if it is missing or outdated.

```markdown
<!-- @bottomlessmargaritas/doc-bar format:1 -->
```

This line must appear before anything else — before the title, before any blank lines.

### 1. Title

A single `#` heading with the app name.

```markdown
<!-- @bottomlessmargaritas/doc-bar format:1 -->
# [App Name]
```

### 2. One-Line Description

A single sentence immediately below the title that captures the app's purpose in plain language. Maximum 20 words. No jargon.

```markdown
A [what it is] that [what it does] for [who it serves].
```

### 3. Overview

A 2–3 paragraph section under `## Overview` explaining:

- What problem the app solves
- Who the intended users are
- What the core user experience looks like (from the user's perspective, not the developer's)
- What makes this app interesting or different from alternatives

**Tone:** Conversational, clear, confident. Write as if explaining the app to a smart friend who is not a developer. Avoid hedging language ("kind of", "sort of", "basically").

### 4. Key Features

A section under `## Key Features` with 4–6 features, each as a subheading (`###`) with a 1–2 sentence description.

**Rules:**

- Feature names should be user-facing capabilities, not technical components
- Describe what the user experiences, not how it's built
- Each feature description must be self-contained — no forward references
- No bullet lists inside features — use prose

**Good:** `### Instant Search` — "Find any document across your entire workspace in milliseconds. Results update as you type with highlighted matches."

**Bad:** `### ElasticSearch Integration` — "Uses ElasticSearch with BM25 ranking to query the documents index."

### 5. How It Works

A section under `## How It Works` with 3–5 numbered steps describing the user flow from start to finish. Each step is a `###` subheading with a short description.

```markdown
## How It Works

### 1. [Action the user takes]
[1–2 sentences describing this step from the user's perspective]

### 2. [Next action]
[1–2 sentences]
```

**Rules:**

- Steps describe the user's journey, not the system architecture
- Use active voice: "You upload...", "The app processes...", "You review..."
- Keep it to the happy path — no error handling, edge cases, or branching
- Maximum 5 steps — if the flow is longer, combine steps

### 6. Use Cases

A section under `## Use Cases` with 3–4 concrete scenarios. Each is a `###` subheading with a 2–3 sentence narrative.

```markdown
## Use Cases

### Teams Managing Shared Documents
Your team collaborates on hundreds of documents and needs a single place to search, organize, and review them. Upload your files and get an instant searchable archive with version history.
```

**Rules:**

- Each use case tells a mini-story: who, situation, how the app helps
- Use second person ("You're...") or third person ("A developer needs...")
- Concrete and specific — avoid generic "useful for teams" language
- Distinct scenarios — don't repeat the same use case in different words

### 7. Tech Stack (Brief)

A section under `## Built With` listing the major technologies as a simple, readable paragraph — not a bullet list. One sentence. Name 3–5 core technologies.

```markdown
## Built With

Built with React and Express on Node.js, backed by PostgreSQL, with Claude powering the AI features.
```

**Rules:**

- One sentence, plain language
- Name the framework/tool, not the version
- No links in this section
- No explanations of what each tool does — just the names

---

## Content Rules

1. **Length:** 400–600 words total (excluding headings)
2. **Markdown only:** No HTML, no JSX, no frontmatter
3. **No code blocks** of actual application code — this is a summary, not documentation
4. **No architecture details** — save those for Technical Summary and Technical Overview
5. **No links to external resources** — keep the document self-contained
6. **No images** unless the consuming app provides them in a known location
7. **Headings hierarchy:** `#` for title, `##` for sections, `###` for sub-items
8. **No horizontal rules** (`---`) between sections — headings provide enough separation
9. **Tone:** Professional but approachable. Informative without being dry. Enthusiastic without being salesy.

---

## Generating for a New Project

1. Read the project's README, configuration files, and source code to understand what it does
2. Identify the user-facing features (not the technical implementation)
3. Map out the user flow from first interaction to final result
4. Write the summary following the structure above
5. Verify: could a non-technical person read this and understand the app? If not, simplify.
6. Verify: does every section exist and follow the rules? Check length is 400–600 words.

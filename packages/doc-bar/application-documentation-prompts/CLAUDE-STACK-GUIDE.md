# Generating Stack Guide Content

This prompt defines how to generate the `stack.md` file. The Stack Guide is the second link in the doc-bar and answers the question every vibe coder has: **"What are all these technologies in my project, and what do they actually do?"**

---

## Purpose

The Stack Guide is a beginner-friendly glossary of every technology, framework, library, and tool in the project. It's written for someone who built a working app but doesn't fully understand the tools that make it work. They see `tsconfig.json` and wonder what TypeScript is. They have `react-dom` in their `package.json` but couldn't explain what the DOM is.

This document answers all of those questions — simply, clearly, without judgment.

## CRITICAL: Privacy & Security

**DO NOT** read, reference, or include content from `.env` files, credentials, API keys, secrets, PII, PHI, database dumps with real user data, or any file that could compromise security or privacy. If you encounter sensitive data, skip it entirely. Reference environment variables by name only (e.g., "requires `DATABASE_URL`") without revealing values.

## Target File

```
stack.md
```

## Structure

Generate the markdown file with these sections:

### Version Stamp (required first line)

```markdown
<!-- @bottomlessmargaritas/doc-bar format:1 -->
```

### 1. Title

```markdown
<!-- @bottomlessmargaritas/doc-bar format:1 -->
# What's In Your Toolbox
```

### 2. Introduction

A short 2–3 sentence intro. Example:

```markdown
Your project uses a bunch of different tools and technologies. Here's what each one does, why it's in your project, and where to learn more. Think of this as a cheat sheet for everything in your `package.json` and config files.
```

### 3. Technology Entries

For EVERY significant technology in the project, create a `###` section with this structure:

```markdown
### React

**What it is:** A JavaScript library for building user interfaces. It lets you create reusable pieces of UI (called "components") and automatically updates the page when your data changes.

**What it does in your project:** React is the foundation of your entire frontend. Every page, button, form, and piece of UI you see is a React component. Your app uses React 19, the latest version.

**Why this and not something else:** React is the most popular frontend library in the world. Vue and Svelte are alternatives that some developers prefer, but React has the largest ecosystem of tools, tutorials, and job listings. Your AI assistant likely chose React because it's the most well-documented option.

**Learn more:** [React Quick Start](https://react.dev/learn) — the official tutorial, takes about an hour
```

### 4. Entry Rules

**What counts as a "technology" worth documenting:**

- **Frameworks:** React, Next.js, Vue, Express, etc.
- **Languages:** TypeScript, JavaScript, SCSS/Sass
- **Key libraries:** Any dependency that's imported in source code (not just dev tools)
- **Build tools:** Vite, Webpack, Turbopack, esbuild
- **Dev tools:** ESLint, Prettier, TypeScript (as a dev tool)
- **Styling:** Tailwind, SCSS, CSS Modules, styled-components
- **Config files:** Explain what each config file does (`tsconfig.json` → TypeScript, `next.config.ts` → Next.js, `.eslintrc` → ESLint)
- **Significant npm packages:** If it's in `package.json` and has a meaningful role, include it

**What NOT to document:**

- Internal utility functions within the project
- Every transitive dependency (don't explain `loose-envify` just because React depends on it)
- Test fixtures or mock data
- Lock files (`package-lock.json`, `pnpm-lock.yaml`)

### 5. Tone and Language Rules

This is the most important section. The Stack Guide must be:

- **Plain language first.** Explain what something IS before using any jargon. "TypeScript is a version of JavaScript that checks your code for mistakes before it runs" — not "TypeScript is a statically typed superset of JavaScript."
- **Relatable analogies.** "Think of React as the engine and Next.js as the car" works. Technical metaphors that require prior knowledge don't.
- **Specific to this project.** Don't just explain what React is generically — explain what React does IN THIS PROJECT. "React renders the login page, the dashboard, and the settings panel" is better than "React renders UI."
- **Honest about alternatives.** Don't pretend the chosen technology is the only option. Name 1–2 alternatives briefly and explain why this project uses what it uses. If the reason is "the AI chose it" or "the tutorial used it," say that — it's not a bad reason.
- **One link per entry.** Link to the BEST beginner resource, not the API reference. The official "getting started" or "learn" page is usually right. Avoid linking to blog posts that might go stale.

### 6. Grouping

Group technologies by role in the project:

```markdown
## The Foundation
<!-- Framework, language, runtime -->

### Next.js
...

### React
...

### TypeScript
...

## Styling
<!-- How things look -->

### SCSS (Sass)
...

### CSS Modules
...

## Code Quality
<!-- Tools that check your code -->

### ESLint
...

### Prettier
...

## Config Files Explained
<!-- What all those dotfiles do -->

### `package.json`
...

### `tsconfig.json`
...

### `next.config.ts`
...
```

Use `##` for group headings, `###` for individual technologies. Group headings should have a casual one-line description in a comment-style format.

### 7. Config Files Section

This section is especially important for vibe coders. Every config file in the project root should be explained:

```markdown
### `package.json`

**What it is:** The ID card for your project. It lists your project's name, version, what libraries it needs (dependencies), and what commands you can run (scripts).

**Why you have it:** Every JavaScript/TypeScript project has one. It's how npm knows what to install when you run `npm install`.

**Should you edit it?** You'll add new dependencies by running `npm install <package-name>`, which updates this file automatically. You might also add new scripts. Don't manually edit the `dependencies` section unless you know what you're doing.
```

---

## Content Rules

1. **Length:** Scale with the project. Small projects (5–10 deps): 800–1200 words. Large projects (30+ deps): 2000–4000 words.
2. **Markdown only.** No HTML, no JSX, no frontmatter.
3. **No code blocks of application code.** Show config file names and commands, not source code.
4. **Every technology gets a "Learn more" link.** One link, beginner-friendly, official docs preferred.
5. **Tone:** Casual, warm, zero condescension. You're explaining, not teaching down. Imagine you're sitting next to someone showing them around their own project.
6. **Don't skip the "obvious" ones.** If the project uses JavaScript, explain what JavaScript is. Your reader might not know. It's better to over-explain than to assume knowledge.

---

## Generating for a New Project

1. Read `package.json` for all dependencies and devDependencies
2. Scan the project root for config files (`.eslintrc`, `tsconfig.json`, `vite.config.ts`, etc.)
3. Read import statements in source files to see which libraries are actually used
4. For each technology, research the best beginner resource (official "learn" or "getting started" page)
5. Group by role in the project
6. Write each entry following the format above
7. Verify: would someone who has never written code understand each entry? If not, simplify.
8. Verify: is every config file in the project root explained? If not, add it.

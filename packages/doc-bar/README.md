# @bottomlessmargaritas/doc-bar

Embed interactive documentation directly in your app. A sticky navigation bar that opens modals for **Summary**, **Technical Summary**, **Technical Overview**, **Quiz**, and **Code Review** — all rendered from markdown files in your public directory.

If no documentation exists yet, the bar shows a single **"Generate Documents"** button that gives you a prompt to copy into your preferred AI assistant. Your assistant generates the docs from your source code. No API keys needed — everything stays local.

Built for junior developers, hobbyists, and anyone learning unfamiliar codebases.

---

## Install

```bash
npm install @bottomlessmargaritas/doc-bar
```

## Quick Start (React)

```tsx
'use client'; // Next.js only
import AppDocBar from '@bottomlessmargaritas/doc-bar';
import '@bottomlessmargaritas/doc-bar/styles.css';

export default function DocBar() {
  return <AppDocBar appName="My App" />;
}
```

Drop that component anywhere in your layout. The bar appears fixed to the bottom of the viewport.

If your docs aren't generated yet, click **"Generate Documents"**, copy the prompt, paste it into Claude/ChatGPT/your AI of choice, and save the output files.

---

## Framework Exports

| Framework | Import |
|-----------|--------|
| React | `import AppDocBar from '@bottomlessmargaritas/doc-bar'` |
| Vue | `import AppDocBar from '@bottomlessmargaritas/doc-bar/vue'` |
| Svelte | `import AppDocBar from '@bottomlessmargaritas/doc-bar/svelte'` |
| SolidJS | `import AppDocBar from '@bottomlessmargaritas/doc-bar/solid'` |
| Preact | `import AppDocBar from '@bottomlessmargaritas/doc-bar/preact'` |
| Angular | `import { AppDocBarComponent } from '@bottomlessmargaritas/doc-bar/angular'` |
| Web Component | `import '@bottomlessmargaritas/doc-bar/web-component'` → `<app-doc-bar>` |
| Vanilla JS | `import { DocBar, inject } from '@bottomlessmargaritas/doc-bar/vanilla'` |

All exports require the CSS: `import '@bottomlessmargaritas/doc-bar/styles.css'`

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appName` | `string` | `''` | App name shown in the nav bar |
| `position` | `'top' \| 'bottom'` | `'bottom'` | Which edge the bar sits on |
| `fixed` | `boolean` | `true` | Stick to viewport edge (transparent, hover-to-reveal) |
| `theme` | `'dark' \| 'light'` | `'dark'` | Color scheme |
| `basePath` | `string` | `/.bottomlessmargaritas/application-documentation` | Path to doc files |

---

## Documentation Files

Place markdown files in your public directory at the `basePath` location:

```
public/.bottomlessmargaritas/application-documentation/
├── summary.md              # Non-technical overview
├── technical-summary.md    # Architecture and stack
├── technical-overview.md   # Deep implementation reference
├── quiz.md                 # Interactive knowledge quiz
└── review.md               # Code review with severity badges
```

Each file must start with a version stamp on line 1:

```markdown
<!-- @bottomlessmargaritas/doc-bar format:1 -->
```

If any file is missing or lacks the stamp, the bar shows **"Generate Documents"** instead of the nav links.

### Quiz Format

```markdown
**1. What does this component do?**
@ easy
- A) Renders a footer
- **B) Renders a nav bar**
- C) Renders a sidebar
- D) Renders a breadcrumb

? Clarification shown before answering (must not hint at the answer).

> Explanation shown after answering. Can include [links](https://example.com).
```

Questions are displayed one at a time, ordered by difficulty (easy → hard), with a progress bar, score tracking, and a results screen with letter grades.

### Review Format

Review headings with severity keywords render as colored badges:

```markdown
### SQL Injection Risk — CRITICAL
### Missing Error Boundary — HIGH
### Unused Import — LOW
```

Supported levels: **CRITICAL** (red), **HIGH** (orange), **MEDIUM** (amber), **LOW** (green), **INFO** (blue).

---

## Vanilla JS

```js
import { DocBar, inject } from '@bottomlessmargaritas/doc-bar/vanilla';
import '@bottomlessmargaritas/doc-bar/styles.css';

// Auto-inject at bottom of page
inject({ appName: 'My App' });

// Or mount manually
const bar = new DocBar({ appName: 'My App' });
bar.mount(document.getElementById('doc-bar'));
bar.destroy(); // cleanup
```

---

## Architecture

TypeScript source with a framework-agnostic core. All framework exports are thin wrappers that mount/destroy a `DocBar` instance.

```
src/core/
├── DocBar.ts           # Main class — nav, modals, doc checking
├── QuizRenderer.ts     # Quiz state machine (start → questions → results)
├── PromptUI.ts         # Generate/regenerate prompt modals
├── dom.ts              # Shared DOM helpers
├── markdown.ts         # Markdown → sanitized HTML with severity badges
├── parseQuiz.ts        # Quiz markdown parser with difficulty sorting
├── prompts.ts          # Embedded generation prompts (bundled at build)
└── constants.ts        # Shared default values
```

Single dependency: [DOMPurify](https://github.com/cure53/DOMPurify) for HTML sanitization.

# @bottomlessmargaritas/doc-bar

A narrow navigation bar that links to app documentation modals: **Summary**, **Technical Summary**, **Technical Overview**, and **Quiz**. Clicking a link opens a full-page modal with a markdown reader or an interactive quiz. Content is loaded at runtime from markdown files in your app's public directory.

Exports for React, Vue, Svelte, SolidJS, Preact, Angular, and Web Components — all thin wrappers over a shared vanilla JS core.

---

## Installation

```bash
npm install @bottomlessmargaritas/doc-bar
```

---

## Quick start

### 1. Add the styles

Import the stylesheet once, anywhere in your app:

```js
import '@bottomlessmargaritas/doc-bar/styles.css';
```

### 2. Place your content files

Create a `.bottomlessmargaritas/application-documentation/` folder inside your app's **public** directory and add four markdown files:

```
public/
└── .bottomlessmargaritas/
    └── application-documentation/
        ├── summary.md
        ├── technical-summary.md
        ├── technical-overview.md
        └── quiz.md
```

The bar fetches these files at runtime via `fetch()`. They are never bundled.

> **Generating content** — each file has a corresponding Claude prompt in `application-documentation-prompts/` (shipped with this package). Read the relevant prompt file before generating content for a new app.

### 3. Mount the component

Pick the export for your framework (see below) and drop the component into your layout.

---

## Framework usage

### React

```jsx
import AppDocBar from '@bottomlessmargaritas/doc-bar';
import '@bottomlessmargaritas/doc-bar/styles.css';

export default function Layout({ children }) {
  return (
    <>
      <AppDocBar appName="My App" fixed position="top" theme="dark" />
      {children}
    </>
  );
}
```

### Vue

```vue
<script setup>
import AppDocBar from '@bottomlessmargaritas/doc-bar/vue';
import '@bottomlessmargaritas/doc-bar/styles.css';
</script>

<template>
  <AppDocBar app-name="My App" fixed theme="dark" />
  <slot />
</template>
```

### Svelte

```svelte
<script>
  import AppDocBar from '@bottomlessmargaritas/doc-bar/svelte';
  import '@bottomlessmargaritas/doc-bar/styles.css';
</script>

<AppDocBar appName="My App" fixed theme="dark" />
<slot />
```

### SolidJS

```jsx
import AppDocBar from '@bottomlessmargaritas/doc-bar/solid';
import '@bottomlessmargaritas/doc-bar/styles.css';

export default function Layout(props) {
  return (
    <>
      <AppDocBar appName="My App" fixed theme="dark" />
      {props.children}
    </>
  );
}
```

### Preact

```jsx
import AppDocBar from '@bottomlessmargaritas/doc-bar/preact';
import '@bottomlessmargaritas/doc-bar/styles.css';

export default function Layout({ children }) {
  return (
    <>
      <AppDocBar appName="My App" fixed theme="dark" />
      {children}
    </>
  );
}
```

### Angular

The Angular export ships as TypeScript source and is compiled by Angular CLI when you build your app.

**1. Configure Angular CLI to compile the package source**

In `tsconfig.app.json`, add the source file to `include`:

```json
{
  "include": [
    "src/**/*.ts",
    "node_modules/@bottomlessmargaritas/doc-bar/src/angular.ts",
    "node_modules/@bottomlessmargaritas/doc-bar/src/core/**/*.ts"
  ]
}
```

**2. Import the standalone component**

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { AppDocBarComponent } from '@bottomlessmargaritas/doc-bar/angular';

@Component({
  standalone: true,
  imports: [AppDocBarComponent],
  template: `
    <app-doc-bar appName="My App" theme="dark" [fixed]="true"></app-doc-bar>
    <router-outlet />
  `,
})
export class AppComponent {}
```

**NgModule apps (Angular < 14)**

```typescript
import { NgModule } from '@angular/core';
import { AppDocBarModule } from '@bottomlessmargaritas/doc-bar/angular';

@NgModule({
  imports: [AppDocBarModule],
})
export class AppModule {}
```

> **Prefer Web Components for Angular?** The `web-component` export requires no TypeScript compilation and works in any Angular version with no configuration beyond `CUSTOM_ELEMENTS_SCHEMA`.

### Web Components

Works in any framework or plain HTML. This is the recommended approach for Angular apps that don't want to configure TypeScript compilation of `node_modules`.

**Register and use in plain HTML:**

```html
<script type="module">
  import '@bottomlessmargaritas/doc-bar/web-component';
  import '@bottomlessmargaritas/doc-bar/styles.css';
</script>

<app-doc-bar app-name="My App" theme="dark" fixed></app-doc-bar>
```

**Angular with Web Components:**

```typescript
// main.ts
import '@bottomlessmargaritas/doc-bar/web-component';

// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

```html
<!-- template -->
<app-doc-bar app-name="My App" theme="dark" fixed></app-doc-bar>
```

---

## Props / attributes

All framework components accept the same options. Web Components use kebab-case attributes.

| Prop (JS) | Attribute (HTML) | Type | Default | Description |
|---|---|---|---|---|
| `basePath` | `base-path` | `string` | `/.bottomlessmargaritas/application-documentation` | Public path where markdown files are served |
| `position` | `position` | `'top' \| 'bottom'` | `'top'` | Which edge of the page the bar sits on |
| `fixed` | `fixed` | `boolean` | `false` | `position: fixed` — bar sticks to the viewport edge |
| `appName` | `app-name` | `string` | `''` | App name shown at the left of the bar |
| `theme` | `theme` | `'dark' \| 'light'` | `'dark'` | Color scheme |

---

## Content files

### File → modal mapping

| File | Nav label | Modal |
|---|---|---|
| `summary.md` | Summary | Markdown reader |
| `technical-summary.md` | Technical Summary | Markdown reader |
| `technical-overview.md` | Technical Overview | Markdown reader |
| `quiz.md` | Quiz | Interactive quiz |

### Markdown support

The markdown reader supports: headings, bold, italic, inline code, fenced code blocks, links, images, unordered lists, ordered lists, blockquotes, and horizontal rules. All rendered HTML is sanitized with DOMPurify.

### Quiz format

Quiz questions must follow this format exactly:

```markdown
**1. What does this component do?**
- A) Renders a footer
- **B) Renders a nav bar with documentation modals**
- C) Renders a sidebar
- D) Renders a breadcrumb

? This is an optional clarification shown before answering.

> This is the explanation shown after answering. It can span
> multiple lines by starting each line with "> ".
```

- The correct answer is marked with `**bold**`
- `?` lines are shown as a clarification hint before the user answers
- `>` lines are shown as an explanation after the user answers
- Questions can be answered in any order — all questions are visible at once
- A letter grade and score appear after all questions are answered

---

## Generating content with Claude

This package ships prompt files in `application-documentation-prompts/` that define exactly how to generate each content file. Before generating content for a new app, read the relevant prompt:

| Prompt file | Generates | Content type |
|---|---|---|
| `CLAUDE-SUMMARY.md` | `summary.md` | Non-technical overview, 400–600 words |
| `CLAUDE-TECHNICAL-SUMMARY.md` | `technical-summary.md` | Architectural overview, 600–900 words |
| `CLAUDE-TECHNICAL-OVERVIEW.md` | `technical-overview.md` | Deep-dive reference, 1500–3000 words |
| `CLAUDE-QUIZ.md` | `quiz.md` | 10–20 quiz questions |

The prompts are in `node_modules/@bottomlessmargaritas/doc-bar/application-documentation-prompts/`.

---

## Architecture

All logic lives in the vanilla JS core. Framework exports are thin wrappers that mount and destroy a `DocBar` instance.

```
src/
├── core/
│   ├── DocBar.js          # Vanilla JS class — nav bar, modals, markdown, quiz
│   ├── markdown.js        # Markdown → sanitized HTML (no dependencies)
│   └── parseQuiz.js       # Quiz markdown parser
├── react.jsx              # useEffect mount/destroy
├── vue.js                 # onMounted/onUnmounted mount/destroy
├── svelte.svelte          # onMount + reactive $: remount
├── solid.jsx              # createEffect + onCleanup
├── preact.js              # useEffect + h() (no Preact plugin needed)
├── angular.ts             # TypeScript source — compiled by Angular CLI
├── web-component.js       # Custom element — works everywhere
└── styles.css             # All styles: nav bar, modals, markdown reader, quiz
```

The modal appends to `document.body` at `z-index: 2147483647` (max 32-bit int) so it sits above everything in the consuming app.

---

## Customizing the content path

If your app can't serve files from `/.bottomlessmargaritas/application-documentation/`, pass a different `basePath`:

```jsx
<AppDocBar basePath="/docs/app" />
```

The bar will fetch `${basePath}/summary.md`, `${basePath}/technical-summary.md`, etc.

---

## Publishing

```bash
# from the workspace root
pnpm run publish:doc-bar
```

This runs `vite build` then publishes to npm with public access.

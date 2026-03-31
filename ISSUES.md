# Known Issues

## @bottomlessmargaritas/doc-bar

### Type declarations are hand-maintained
The `.d.ts` files in `types/` are manually written and not generated from source. If new props or methods are added to DocBar or the framework wrappers, the corresponding type declarations must be updated manually.

**Fix:** Add a build step that generates `.d.ts` from JSDoc annotations or migrate core source to TypeScript.

### Svelte wrapper uses legacy reactive syntax
The Svelte wrapper (`src/svelte.svelte`) uses Svelte 4's `$:` reactive directive and `export let` props. Svelte 5 introduces runes (`$state`, `$effect`, `$props`) as the new reactivity system. The current code works under Svelte 5's backward-compatibility mode but should be updated to use runes for Svelte 5+ projects.

### No Svelte type declarations
The `./svelte` export has no `types` condition in `package.json` because Svelte components use their own type system (`.svelte` files are self-typed by the Svelte language server). This is intentional but may confuse TypeScript users who expect a `.d.ts` for every export.

### Vue wrapper may trigger unnecessary remounts
Vue's `watch()` on the props array fires even when a prop is set to the same value it already has. This causes an unnecessary destroy/remount cycle. Should add a shallow equality check before remounting.

### formatting-configs postinstall warns about bin script
Publishing `@bottomlessmargaritas/formatting-configs` produces a warning: `"bin[formatting-configs]" script name bin/cli.js was invalid and removed`. The `bin` field in package.json needs to be fixed or removed if CLI usage isn't intended.

### No automated tests
None of the three packages have test suites. The doc-bar quiz state machine, parseQuiz parser, markdown renderer, and postinstall scripts should all have unit tests.

### Doc-bar bundle size increased with embedded prompts
Embedding all 4 generation prompts added ~15KB gzipped to the DocBar chunk (from 13.7KB to 28.5KB). This is acceptable for a dev tool but could be optimized by lazy-loading prompts only when a document is missing/outdated rather than bundling them unconditionally.

### CSS not auto-imported
Consumers must manually import `@bottomlessmargaritas/doc-bar/styles.css`. If they forget, the doc-bar renders unstyled with no warning or error message. Consider adding a runtime check or console warning if styles are not loaded.

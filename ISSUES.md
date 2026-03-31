# Known Issues

## @bottomlessmargaritas/doc-bar

### Framework wrapper types are hand-maintained
The `.d.ts` files for React, Vue, Solid, Preact, and Web Component exports are manually written since their peer dependencies are optional and not installed during the package build. Core + vanilla types are auto-generated via `tsc --emitDeclarationOnly`.

### Svelte wrapper uses legacy reactive syntax
The Svelte wrapper uses Svelte 4's `$:` reactive directive and `export let` props. Should be updated to Svelte 5 runes (`$state`, `$effect`, `$props`) for future compatibility.

### No automated tests
The package has no test suite. The quiz parser, markdown renderer, severity badge rendering, and doc version checking should all have unit tests.

### Default export is React-specific
`import AppDocBar from '@bottomlessmargaritas/doc-bar'` gives you the React component. Non-React users must use framework-specific imports (`/vue`, `/solid`, etc.). Consider making the default export framework-agnostic in a future major version.

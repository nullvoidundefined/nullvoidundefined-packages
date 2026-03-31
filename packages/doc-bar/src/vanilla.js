/**
 * Vanilla JS entry point for DocBar.
 *
 * Usage (manual mount):
 *
 *   import { DocBar } from '@bottomlessmargaritas/doc-bar/vanilla';
 *   import '@bottomlessmargaritas/doc-bar/styles.css';
 *
 *   const bar = new DocBar({
 *     basePath: '/.bottomlessmargaritas/application-documentation',
 *     appName: 'My App',
 *     position: 'top',
 *     theme: 'dark',
 *   });
 *   bar.mount(document.getElementById('doc-bar'));
 *
 *   // Later, to clean up:
 *   bar.destroy();
 *
 * Usage (auto-inject):
 *
 *   import { inject } from '@bottomlessmargaritas/doc-bar/vanilla';
 *   import '@bottomlessmargaritas/doc-bar/styles.css';
 *
 *   const bar = inject({ appName: 'My App' });
 */
import { DocBar } from './core/DocBar.js';

export { DocBar };

/**
 * Creates a container div, prepends it to document.body, and mounts
 * a DocBar instance. Returns the instance (call .destroy() to remove).
 */
export function inject(options = {}) {
  const container = document.createElement('div');
  container.setAttribute('data-doc-bar', '');
  document.body.prepend(container);

  const instance = new DocBar(options);
  instance.mount(container);
  return instance;
}

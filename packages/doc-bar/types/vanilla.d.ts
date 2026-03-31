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
import { DocBar } from './core/DocBar.ts';
export { DocBar };
export interface InjectOptions {
    basePath?: string;
    position?: 'top' | 'bottom';
    fixed?: boolean;
    appName?: string;
    theme?: 'dark' | 'light';
}
/**
 * Creates a container div, prepends it to document.body, and mounts
 * a DocBar instance. Returns the instance (call .destroy() to remove).
 */
export declare function inject(options?: InjectOptions): InstanceType<typeof DocBar>;

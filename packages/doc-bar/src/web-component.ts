import { DocBar } from './core/DocBar.ts';

/**
 * <app-doc-bar> — a custom element wrapping DocBar.
 *
 * Works in any framework (Angular, Ember, plain HTML, etc.)
 * without framework-specific setup.
 *
 * Attributes (kebab-case):
 *   base-path, position, fixed (boolean — present=true, absent or "false"=false),
 *   app-name, theme
 *
 * Usage:
 *   <app-doc-bar app-name="My App" theme="dark"></app-doc-bar>
 *   <app-doc-bar app-name="My App" fixed="false" position="top"></app-doc-bar>
 */
class AppDocBarElement extends HTMLElement {
  static observedAttributes = ['base-path', 'position', 'fixed', 'app-name', 'theme'];

  #instance: InstanceType<typeof DocBar> | null = null;

  connectedCallback() {
    this.#mount();
  }

  disconnectedCallback() {
    this.#instance?.destroy();
    this.#instance = null;
  }

  attributeChangedCallback() {
    if (this.#instance) {
      this.#instance.destroy();
      this.#mount();
    }
  }

  #mount() {
    const fixedAttr = this.getAttribute('fixed');
    const fixed = fixedAttr === null ? true : fixedAttr !== 'false';

    this.#instance = new DocBar({
      basePath: this.getAttribute('base-path') ?? '/.bottomlessmargaritas/application-documentation',
      position: (this.getAttribute('position') as 'top' | 'bottom') ?? 'bottom',
      fixed,
      appName: this.getAttribute('app-name') ?? '',
      theme: (this.getAttribute('theme') as 'dark' | 'light') ?? 'dark',
    });
    this.#instance.mount(this);
  }
}

if (!customElements.get('app-doc-bar')) {
  customElements.define('app-doc-bar', AppDocBarElement);
}

export { AppDocBarElement };

import { DocBar } from './core/DocBar.js';

/**
 * <app-doc-bar> — a custom element wrapping DocBar.
 *
 * Works in any framework (Angular, Ember, plain HTML, etc.)
 * without framework-specific setup.
 *
 * Angular usage:
 *   // app.module.ts — add CUSTOM_ELEMENTS_SCHEMA
 *   import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
 *   @NgModule({ schemas: [CUSTOM_ELEMENTS_SCHEMA] })
 *
 *   // main.ts — register the element before bootstrapping
 *   import '@bottomlessmargaritas/doc-bar/web-component';
 *
 *   // template
 *   <app-doc-bar app-name="My App" theme="dark"></app-doc-bar>
 *
 * Attributes (kebab-case):
 *   base-path, position, fixed (boolean), app-name, theme
 */
class AppDocBarElement extends HTMLElement {
  static observedAttributes = ['base-path', 'position', 'fixed', 'app-name', 'theme'];

  #instance = null;

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
    this.#instance = new DocBar({
      basePath: this.getAttribute('base-path') ?? '/.bottomlessmargaritas/application-documentation',
      position: this.getAttribute('position') ?? 'top',
      fixed: this.hasAttribute('fixed'),
      appName: this.getAttribute('app-name') ?? '',
      theme: this.getAttribute('theme') ?? 'dark',
    });
    this.#instance.mount(this);
  }
}

if (!customElements.get('app-doc-bar')) {
  customElements.define('app-doc-bar', AppDocBarElement);
}

export { AppDocBarElement };

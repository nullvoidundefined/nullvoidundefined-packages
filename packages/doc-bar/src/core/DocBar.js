import DOMPurify from 'dompurify';
import { markdownToHtml } from './markdown.js';
import { parseQuiz } from './parseQuiz.js';
import { DOC_FORMAT_VERSION, parseDocVersion } from './prompts.js';
import { el, createOverlay, createPanel, createLoadingSkeleton } from './dom.js';
import { buildQuiz } from './QuizRenderer.js';
import { buildGenerateUI, buildPromptUI } from './PromptUI.js';

const NAV_LINKS = [
  { key: 'summary', label: 'Summary', file: 'summary.md' },
  { key: 'technical-summary', label: 'Technical Summary', file: 'technical-summary.md' },
  { key: 'technical-overview', label: 'Technical Overview', file: 'technical-overview.md' },
  { key: 'quiz', label: 'Quiz', file: 'quiz.md' },
  { key: 'review', label: 'Review', file: 'review.md' },
];

export class DocBar {
  constructor(options = {}) {
    this.options = {
      basePath: '/.bottomlessmargaritas/application-documentation',
      position: 'bottom',
      fixed: true,
      appName: '',
      theme: 'dark',
      ...options,
    };
    this._container = null;
    this._modal = null;
    this._activeBtn = null;
    this._abortController = null;
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  async mount(container) {
    this._container = container;
    this._docsAvailable = await this._checkDocs();
    this._renderNav();
  }

  destroy() {
    this._closeModal();
    if (this._container) this._container.innerHTML = '';
  }

  async _checkDocs() {
    try {
      const results = await Promise.all(
        NAV_LINKS.map(async ({ file }) => {
          try {
            const res = await fetch(`${this.options.basePath}/${file}`);
            if (!res.ok) return false;
            const text = await res.text();
            const version = parseDocVersion(text);
            return version !== null && version >= DOC_FORMAT_VERSION;
          } catch (err) {
            console.warn(`[DocBar] Failed to check ${file}:`, err.message);
            return false;
          }
        })
      );
      return results.every(Boolean);
    } catch (err) {
      console.warn('[DocBar] Failed to check docs:', err.message);
      return false;
    }
  }

  _renderNav() {
    const { position, fixed, appName, theme } = this.options;

    const nav = el('nav', [
      'doc-bar',
      `doc-bar-theme-${theme}`,
      `doc-bar-${position}`,
      fixed ? 'doc-bar-fixed' : '',
    ].filter(Boolean).join(' '), {
      role: 'navigation',
      'aria-label': 'App documentation',
    });

    if (appName) {
      const span = el('span', 'doc-bar-app-name');
      span.textContent = appName;
      nav.appendChild(span);
    }

    const ul = el('ul', 'doc-bar-links');

    if (this._docsAvailable) {
      for (const { key, label, file } of NAV_LINKS) {
        const li = el('li');
        const btn = el('button', 'doc-bar-link');
        btn.textContent = label;
        btn.addEventListener('click', () => this._open(key, label, file, btn));
        li.appendChild(btn);
        ul.appendChild(li);
      }
    } else {
      const li = el('li');
      const btn = el('button', 'doc-bar-link doc-bar-link-generate');
      btn.textContent = 'Generate Documents';
      btn.addEventListener('click', () => this._openModal('Generate Documents', (body) => {
        body.appendChild(buildGenerateUI(this.options.basePath, NAV_LINKS));
      }, btn));
      li.appendChild(btn);
      ul.appendChild(li);
    }

    nav.appendChild(ul);
    this._container.appendChild(nav);
  }

  _openModal(title, renderContent, btn, panelClass = 'doc-bar-panel') {
    this._closeModal();

    if (btn) {
      btn.classList.add('doc-bar-link-active');
      this._activeBtn = btn;
    }

    const overlay = createOverlay(() => this._closeModal());
    const { panel, body } = createPanel(panelClass, title, () => this._closeModal());

    renderContent(body);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    this._modal = overlay;

    this._abortController = new AbortController();
    document.addEventListener('keydown', this._onKeyDown, { signal: this._abortController.signal });
  }

  async _open(key, title, file, btn) {
    this._openModal(title, (body) => {
      body.appendChild(createLoadingSkeleton());
    }, btn, key === 'quiz' ? 'doc-bar-panel doc-bar-panel-wide' : 'doc-bar-panel');

    const body = this._modal?.querySelector('.doc-bar-panel-body');
    if (!body) return;

    try {
      const res = await fetch(`${this.options.basePath}/${file}`);
      if (!res.ok) {
        console.warn(`[DocBar] ${file} not found: HTTP ${res.status}`);
        body.innerHTML = '';
        body.appendChild(buildPromptUI(key, 'missing', file, this.options.basePath));
        return;
      }
      const text = await res.text();
      const docVersion = parseDocVersion(text);

      if (docVersion === null || docVersion < DOC_FORMAT_VERSION) {
        console.warn(`[DocBar] ${file} version mismatch: found ${docVersion}, expected >= ${DOC_FORMAT_VERSION}`);
        body.innerHTML = '';
        body.appendChild(buildPromptUI(key, docVersion === null ? 'unversioned' : 'outdated', file, this.options.basePath));
        return;
      }

      body.innerHTML = '';
      body.appendChild(key === 'quiz' ? buildQuiz(parseQuiz(text), this.options.appName) : this._buildMarkdown(text));
    } catch (err) {
      console.warn(`[DocBar] Failed to load ${file}:`, err.message);
      body.innerHTML = '';
      body.appendChild(buildPromptUI(key, 'missing', file, this.options.basePath));
    }
  }

  _buildMarkdown(text) {
    const wrapper = el('div', 'doc-bar-md');
    wrapper.innerHTML = DOMPurify.sanitize(markdownToHtml(text), {
      ADD_ATTR: ['target', 'rel'],
    });

    wrapper.addEventListener('click', (e) => {
      const anchor = e.target.closest('a.doc-bar-anchor-link');
      if (!anchor) return;
      e.preventDefault();
      const targetId = anchor.getAttribute('href').slice(1);
      const targetEl = wrapper.querySelector(`[id="${targetId}"]`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    return wrapper;
  }

  _closeModal() {
    this._modal?.remove();
    this._modal = null;
    this._activeBtn?.classList.remove('doc-bar-link-active');
    this._activeBtn = null;
    this._abortController?.abort();
    this._abortController = null;
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') this._closeModal();
  }
}

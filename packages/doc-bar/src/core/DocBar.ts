import DOMPurify from 'dompurify';
import { DEFAULT_OPTIONS } from './constants.ts';
import { markdownToHtml } from './markdown.ts';
import { parseQuiz } from './parseQuiz.ts';
import { DOC_FORMAT_VERSION, parseDocVersion } from './prompts.ts';
import { el, createOverlay, createPanel, createLoadingSkeleton } from './dom.ts';
import { buildQuiz } from './QuizRenderer.ts';
import { buildGenerateUI, buildPromptUI } from './PromptUI.ts';

export interface DocBarOptions {
  basePath?: string;
  position?: 'top' | 'bottom';
  fixed?: boolean;
  appName?: string;
  theme?: 'dark' | 'light';
}

interface ResolvedOptions {
  basePath: string;
  position: 'top' | 'bottom';
  fixed: boolean;
  appName: string;
  theme: 'dark' | 'light';
}

export interface NavLink {
  key: string;
  label: string;
  file: string;
}

const NAV_LINKS: readonly NavLink[] = [
  { key: 'summary', label: 'Summary', file: 'summary.md' },
  { key: 'technical-summary', label: 'Technical Summary', file: 'technical-summary.md' },
  { key: 'technical-overview', label: 'Technical Overview', file: 'technical-overview.md' },
  { key: 'quiz', label: 'Quiz', file: 'quiz.md' },
  { key: 'review', label: 'Review', file: 'review.md' },
] as const;

export class DocBar {
  private options: ResolvedOptions;
  private _container: HTMLElement | null = null;
  private _modal: HTMLElement | null = null;
  private _activeBtn: HTMLElement | null = null;
  private _abortController: AbortController | null = null;
  private _docsAvailable = false;

  constructor(options: DocBarOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  async mount(container: HTMLElement): Promise<void> {
    this._container = container;
    this._docsAvailable = await this._checkDocs();
    this._renderNav();
  }

  destroy(): void {
    this._closeModal();
    if (this._container) this._container.innerHTML = '';
  }

  private async _checkDocs(): Promise<boolean> {
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
            console.warn(`[DocBar] Failed to check ${file}:`, (err as Error).message);
            return false;
          }
        })
      );
      return results.every(Boolean);
    } catch (err) {
      console.warn('[DocBar] Failed to check docs:', (err as Error).message);
      return false;
    }
  }

  private _renderNav(): void {
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
        body.appendChild(buildGenerateUI(this.options.basePath, NAV_LINKS as NavLink[]));
      }, btn));
      li.appendChild(btn);
      ul.appendChild(li);
    }

    nav.appendChild(ul);
    this._container!.appendChild(nav);
  }

  private _openModal(
    title: string,
    renderContent: (body: HTMLElement) => void,
    btn?: HTMLElement,
    panelClass = 'doc-bar-panel',
  ): void {
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

  private async _open(key: string, title: string, file: string, btn: HTMLElement): Promise<void> {
    this._openModal(title, (body) => {
      body.appendChild(createLoadingSkeleton());
    }, btn, key === 'quiz' ? 'doc-bar-panel doc-bar-panel-wide' : 'doc-bar-panel');

    const body = this._modal?.querySelector('.doc-bar-panel-body') as HTMLElement | null;
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
      console.warn(`[DocBar] Failed to load ${file}:`, (err as Error).message);
      body.innerHTML = '';
      body.appendChild(buildPromptUI(key, 'missing', file, this.options.basePath));
    }
  }

  private _buildMarkdown(text: string): HTMLElement {
    const wrapper = el('div', 'doc-bar-md');
    wrapper.innerHTML = DOMPurify.sanitize(markdownToHtml(text), {
      ADD_ATTR: ['target', 'rel'],
    });

    wrapper.addEventListener('click', (e) => {
      const anchor = (e.target as HTMLElement).closest('a.doc-bar-anchor-link');
      if (!anchor) return;
      e.preventDefault();
      const targetId = anchor.getAttribute('href')!.slice(1);
      const targetEl = wrapper.querySelector(`[id="${targetId}"]`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    return wrapper;
  }

  private _closeModal(): void {
    this._modal?.remove();
    this._modal = null;
    this._activeBtn?.classList.remove('doc-bar-link-active');
    this._activeBtn = null;
    this._abortController?.abort();
    this._abortController = null;
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') this._closeModal();
  }
}

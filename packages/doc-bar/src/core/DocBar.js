import DOMPurify from 'dompurify';
import { markdownToHtml } from './markdown.js';
import { parseQuiz } from './parseQuiz.js';

const NAV_LINKS = [
  { key: 'summary', label: 'Summary', file: 'summary.md' },
  { key: 'technical-summary', label: 'Technical Summary', file: 'technical-summary.md' },
  { key: 'technical-overview', label: 'Technical Overview', file: 'technical-overview.md' },
  { key: 'quiz', label: 'Quiz', file: 'quiz.md' },
];

const GRADES = [
  { min: 90, letter: 'A' },
  { min: 80, letter: 'B' },
  { min: 70, letter: 'C' },
  { min: 60, letter: 'D' },
  { min: 0, letter: 'F' },
];

function getGrade(pct) {
  return GRADES.find((g) => pct >= g.min)?.letter ?? 'F';
}

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function buildQuestionCard(question, index, onAnswer) {
  const card = el('div', 'doc-bar-quiz-card');

  const numEl = el('div', 'doc-bar-quiz-question-num');
  numEl.textContent = `Question ${index + 1}`;

  const textEl = el('p', 'doc-bar-quiz-question-text');
  textEl.textContent = question.text;

  const optionsEl = el('div', 'doc-bar-quiz-options');

  let answered = false;

  const buttons = question.options.map((option, i) => {
    const btn = el('button', 'doc-bar-quiz-option');
    btn.textContent = option;
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      const isCorrect = i === question.correctIndex;
      card.classList.add(isCorrect ? 'doc-bar-correct' : 'doc-bar-incorrect');

      buttons.forEach((b, j) => {
        b.disabled = true;
        if (j === question.correctIndex) {
          b.className = 'doc-bar-quiz-option doc-bar-option-correct';
        } else if (j === i && !isCorrect) {
          b.className = 'doc-bar-quiz-option doc-bar-option-wrong';
        } else {
          b.className = 'doc-bar-quiz-option doc-bar-option-dim';
        }
      });

      if (question.explanation) {
        const wrap = el('div', 'doc-bar-quiz-explanation-wrap');
        const toggle = el('button', 'doc-bar-quiz-toggle');
        toggle.textContent = 'Show explanation';
        let open = false;
        let explNode = null;
        toggle.addEventListener('click', () => {
          open = !open;
          toggle.textContent = open ? 'Hide explanation' : 'Show explanation';
          if (open) {
            explNode = el('div', 'doc-bar-quiz-explanation');
            explNode.textContent = question.explanation;
            wrap.appendChild(explNode);
          } else {
            explNode?.remove();
            explNode = null;
          }
        });
        wrap.appendChild(toggle);
        card.appendChild(wrap);
      }

      onAnswer(isCorrect);
    });
    return btn;
  });

  buttons.forEach((btn) => optionsEl.appendChild(btn));
  card.appendChild(numEl);
  card.appendChild(textEl);
  card.appendChild(optionsEl);

  if (question.clarification) {
    const clarEl = el('div', 'doc-bar-quiz-clarification');
    const icon = el('span', 'doc-bar-quiz-clarification-icon');
    icon.textContent = '?';
    clarEl.appendChild(icon);
    clarEl.appendChild(document.createTextNode(question.clarification));
    card.appendChild(clarEl);
  }

  return card;
}

export class DocBar {
  constructor(options = {}) {
    this.options = {
      basePath: '/.bottomlessmargaritas/application-documentation',
      position: 'top',
      fixed: false,
      appName: '',
      theme: 'dark',
      ...options,
    };
    this._container = null;
    this._modal = null;
    this._activeBtn = null;
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  mount(container) {
    this._container = container;
    this._renderNav();
  }

  destroy() {
    this._closeModal();
    if (this._container) this._container.innerHTML = '';
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
    for (const { key, label, file } of NAV_LINKS) {
      const li = el('li');
      const btn = el('button', 'doc-bar-link');
      btn.textContent = label;
      btn.addEventListener('click', () => this._open(key, label, file, btn));
      li.appendChild(btn);
      ul.appendChild(li);
    }

    nav.appendChild(ul);
    this._container.appendChild(nav);
  }

  async _open(key, title, file, btn) {
    this._closeModal();

    btn.classList.add('doc-bar-link-active');
    this._activeBtn = btn;

    const overlay = el('div', 'doc-bar-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this._closeModal();
    });

    const panel = el('div', key === 'quiz' ? 'doc-bar-panel doc-bar-panel-wide' : 'doc-bar-panel', {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': title,
    });
    panel.addEventListener('click', (e) => e.stopPropagation());

    const header = el('div', 'doc-bar-panel-header');
    const h2 = el('h2', 'doc-bar-panel-title');
    h2.textContent = title;
    const closeBtn = el('button', 'doc-bar-close', { 'aria-label': 'Close' });
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this._closeModal());
    header.appendChild(h2);
    header.appendChild(closeBtn);

    const body = el('div', 'doc-bar-panel-body');
    const loadingEl = el('div', 'doc-bar-loading');
    loadingEl.textContent = 'Loading…';
    body.appendChild(loadingEl);

    panel.appendChild(header);
    panel.appendChild(body);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    this._modal = overlay;
    document.addEventListener('keydown', this._onKeyDown);

    try {
      const res = await fetch(`${this.options.basePath}/${file}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      body.innerHTML = '';
      body.appendChild(key === 'quiz' ? this._buildQuiz(text) : this._buildMarkdown(text));
    } catch (err) {
      body.innerHTML = '';
      body.appendChild(this._buildError(err.message));
    }
  }

  _buildMarkdown(text) {
    const wrapper = el('div', 'doc-bar-md');
    wrapper.innerHTML = DOMPurify.sanitize(markdownToHtml(text), {
      ADD_ATTR: ['target', 'rel'],
    });
    return wrapper;
  }

  _buildError(message) {
    const wrapper = el('div', 'doc-bar-md');
    wrapper.innerHTML = DOMPurify.sanitize(
      `<blockquote>Error loading document: ${message}</blockquote>`
    );
    return wrapper;
  }

  _buildQuiz(markdown) {
    const questions = parseQuiz(markdown);
    const { appName } = this.options;

    const root = el('div', 'doc-bar-quiz-view');

    // Header
    const header = el('div', 'doc-bar-quiz-header');
    if (appName) {
      const nameEl = el('h2', 'doc-bar-quiz-app-name');
      nameEl.textContent = appName;
      header.appendChild(nameEl);
    }
    const meta = el('div', 'doc-bar-quiz-meta');
    const countEl = el('span');
    countEl.textContent = `${questions.length} questions`;
    const scoreEl = el('span');
    meta.appendChild(countEl);
    meta.appendChild(scoreEl);
    header.appendChild(meta);
    root.appendChild(header);

    if (!questions.length) {
      const empty = el('div', 'doc-bar-quiz-empty');
      empty.textContent = 'No questions found.';
      root.appendChild(empty);
      return root;
    }

    const answers = {};

    const updateScore = () => {
      const answered = Object.keys(answers).length;
      const correct = Object.values(answers).filter(Boolean).length;
      scoreEl.textContent = answered > 0 ? `${correct}/${answered} correct` : '';
      if (answered === questions.length) showSummary();
    };

    let summaryEl = null;
    const showSummary = () => {
      if (summaryEl) return;
      const correct = Object.values(answers).filter(Boolean).length;
      const pct = Math.round((correct / questions.length) * 100);

      summaryEl = el('div', 'doc-bar-quiz-summary');

      const gradeEl = el('div', 'doc-bar-quiz-grade');
      gradeEl.textContent = getGrade(pct);

      const scoreDisplay = el('div', 'doc-bar-quiz-score');
      scoreDisplay.textContent = `${correct} / ${questions.length}`;

      const pctEl = el('div', 'doc-bar-quiz-pct');
      pctEl.textContent = `${pct}%`;

      summaryEl.appendChild(gradeEl);
      summaryEl.appendChild(scoreDisplay);
      summaryEl.appendChild(pctEl);
      root.appendChild(summaryEl);
    };

    const list = el('div', 'doc-bar-quiz-list');
    questions.forEach((q, i) => {
      list.appendChild(buildQuestionCard(q, i, (isCorrect) => {
        answers[i] = isCorrect;
        updateScore();
      }));
    });
    root.appendChild(list);

    return root;
  }

  _closeModal() {
    this._modal?.remove();
    this._modal = null;
    this._activeBtn?.classList.remove('doc-bar-link-active');
    this._activeBtn = null;
    document.removeEventListener('keydown', this._onKeyDown);
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') this._closeModal();
  }
}

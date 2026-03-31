import DOMPurify from 'dompurify';
import { markdownToHtml } from './markdown.js';
import { parseQuiz, sortByDifficulty, getDifficultyBreakdown } from './parseQuiz.js';
import { DOC_FORMAT_VERSION, VERSION_COMMENT, PROMPTS, parseDocVersion } from './prompts.js';

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

const RESULT_MESSAGES = {
  A: 'Absolutely nailed it. You know this codebase inside and out.',
  B: 'Solid work. A few gaps, but you clearly understand the architecture.',
  C: 'Not bad, but there\'s room to grow. Re-read the technical overview.',
  D: 'Barely scraping by. Time to revisit the docs.',
  F: 'Ouch. Did you even read the documentation?',
};

const GRADE_COLORS = {
  A: '#16a34a',
  B: '#3b82f6',
  C: '#eab308',
  D: '#f97316',
  F: '#dc2626',
};

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
      if (!res.ok) {
        body.innerHTML = '';
        body.appendChild(this._buildPromptUI(key, 'missing', file));
        return;
      }
      const text = await res.text();
      const docVersion = parseDocVersion(text);

      if (docVersion === null || docVersion < DOC_FORMAT_VERSION) {
        body.innerHTML = '';
        body.appendChild(this._buildPromptUI(key, docVersion === null ? 'unversioned' : 'outdated', file));
        return;
      }

      body.innerHTML = '';
      body.appendChild(key === 'quiz' ? this._buildQuiz(text) : this._buildMarkdown(text));
    } catch (err) {
      body.innerHTML = '';
      body.appendChild(this._buildPromptUI(key, 'missing', file));
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

  _buildError(message) {
    const wrapper = el('div', 'doc-bar-md');
    wrapper.innerHTML = DOMPurify.sanitize(
      `<blockquote>Error loading document: ${message}</blockquote>`
    );
    return wrapper;
  }

  _buildQuiz(markdown) {
    const parsed = parseQuiz(markdown);
    const questions = sortByDifficulty(parsed);
    const { appName } = this.options;

    const root = el('div', 'doc-bar-quiz-view');

    if (!questions.length) {
      const empty = el('div', 'doc-bar-quiz-empty');
      empty.textContent = 'No questions found.';
      root.appendChild(empty);
      return root;
    }

    // State
    let screen = 'start';
    let currentIndex = 0;
    let score = 0;
    let answers = {};

    const render = () => {
      root.innerHTML = '';
      if (screen === 'start') renderStart();
      else if (screen === 'quiz') renderQuestion();
      else if (screen === 'results') renderResults();
    };

    const renderStart = () => {
      const breakdown = getDifficultyBreakdown(questions);

      if (appName) {
        const nameEl = el('h2', 'doc-bar-quiz-app-name');
        nameEl.textContent = appName;
        root.appendChild(nameEl);
      }

      const subtitle = el('p', 'doc-bar-quiz-subtitle');
      subtitle.textContent = 'Test your knowledge';
      root.appendChild(subtitle);

      const stats = el('div', 'doc-bar-quiz-stats');

      const countStat = el('div', 'doc-bar-quiz-stat');
      const countValue = el('span', 'doc-bar-quiz-stat-value');
      countValue.textContent = questions.length;
      const countLabel = el('span', 'doc-bar-quiz-stat-label');
      countLabel.textContent = 'Questions';
      countStat.appendChild(countValue);
      countStat.appendChild(countLabel);
      stats.appendChild(countStat);

      const diffEl = el('div', 'doc-bar-quiz-difficulty-breakdown');
      for (const [level, count] of Object.entries(breakdown)) {
        if (count === 0) continue;
        const pill = el('span', `doc-bar-quiz-diff-pill doc-bar-quiz-diff-${level}`);
        pill.textContent = `${count} ${level.charAt(0).toUpperCase() + level.slice(1)}`;
        diffEl.appendChild(pill);
      }
      stats.appendChild(diffEl);
      root.appendChild(stats);

      const startBtn = el('button', 'doc-bar-quiz-start-btn');
      startBtn.textContent = 'Start Quiz';
      startBtn.addEventListener('click', () => {
        screen = 'quiz';
        render();
      });
      root.appendChild(startBtn);
    };

    const renderQuestion = () => {
      const q = questions[currentIndex];

      // Progress header
      const progressHeader = el('div', 'doc-bar-quiz-progress-header');
      const progressText = el('span', 'doc-bar-quiz-progress-text');
      progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
      const scoreText = el('span', 'doc-bar-quiz-score-text');
      scoreText.textContent = `Score: ${score}/${Object.keys(answers).length}`;
      progressHeader.appendChild(progressText);
      progressHeader.appendChild(scoreText);
      root.appendChild(progressHeader);

      // Progress bar
      const progressBar = el('div', 'doc-bar-quiz-progress-bar');
      const progressFill = el('div', 'doc-bar-quiz-progress-fill');
      progressFill.style.width = `${(currentIndex / questions.length) * 100}%`;
      progressBar.appendChild(progressFill);
      root.appendChild(progressBar);

      // Question card
      const card = el('div', 'doc-bar-quiz-card');
      card.style.animation = 'doc-bar-slide-up 0.2s ease';

      // Question number + difficulty badge
      const numEl = el('div', 'doc-bar-quiz-question-num');
      numEl.textContent = `Question ${currentIndex + 1}`;
      const badge = el('span', `doc-bar-quiz-diff-badge doc-bar-quiz-diff-${q.difficulty}`);
      badge.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
      numEl.appendChild(badge);
      card.appendChild(numEl);

      // Question text
      const textEl = el('p', 'doc-bar-quiz-question-text');
      textEl.textContent = q.text;
      card.appendChild(textEl);

      // Clarification (before options)
      if (q.clarification) {
        const clarEl = el('div', 'doc-bar-quiz-clarification');
        const icon = el('span', 'doc-bar-quiz-clarification-icon');
        icon.textContent = '?';
        clarEl.appendChild(icon);
        clarEl.appendChild(document.createTextNode(q.clarification));
        card.appendChild(clarEl);
      }

      // Options
      const optionsEl = el('div', 'doc-bar-quiz-options');
      let answered = false;

      const buttons = q.options.map((option, i) => {
        const btn = el('button', 'doc-bar-quiz-option');
        btn.textContent = option;
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;

          const isCorrect = i === q.correctIndex;
          answers[currentIndex] = isCorrect;
          if (isCorrect) score++;

          card.classList.add(isCorrect ? 'doc-bar-correct' : 'doc-bar-incorrect');

          buttons.forEach((b, j) => {
            b.disabled = true;
            if (j === q.correctIndex) {
              b.className = 'doc-bar-quiz-option doc-bar-option-correct';
            } else if (j === i && !isCorrect) {
              b.className = 'doc-bar-quiz-option doc-bar-option-wrong';
            } else {
              b.className = 'doc-bar-quiz-option doc-bar-option-dim';
            }
          });

          // Update score display
          scoreText.textContent = `Score: ${score}/${Object.keys(answers).length}`;

          // Update progress bar
          progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;

          // Show explanation inline
          if (q.explanation) {
            const explEl = el('div', 'doc-bar-quiz-explanation');
            explEl.textContent = q.explanation;
            card.appendChild(explEl);
          }

          // Next / See Results button
          const isLast = currentIndex === questions.length - 1;
          const nextBtn = el('button', 'doc-bar-quiz-next-btn');
          nextBtn.textContent = isLast ? 'See Results' : 'Next Question';
          nextBtn.addEventListener('click', () => {
            if (isLast) {
              screen = 'results';
            } else {
              currentIndex++;
            }
            render();
          });
          card.appendChild(nextBtn);
        });
        return btn;
      });

      buttons.forEach((btn) => optionsEl.appendChild(btn));
      card.appendChild(optionsEl);
      root.appendChild(card);
    };

    const renderResults = () => {
      const correct = Object.values(answers).filter(Boolean).length;
      const pct = Math.round((correct / questions.length) * 100);
      const grade = getGrade(pct);

      const container = el('div', 'doc-bar-quiz-results');

      if (appName) {
        const nameEl = el('h2', 'doc-bar-quiz-app-name');
        nameEl.textContent = appName;
        container.appendChild(nameEl);
      }

      const title = el('h3', 'doc-bar-quiz-results-title');
      title.textContent = 'Quiz Complete';
      container.appendChild(title);

      const gradeEl = el('div', 'doc-bar-quiz-grade');
      gradeEl.textContent = grade;
      gradeEl.style.color = GRADE_COLORS[grade] || '#3b82f6';
      container.appendChild(gradeEl);

      const scoreEl = el('div', 'doc-bar-quiz-score');
      scoreEl.textContent = `${correct} / ${questions.length}`;
      container.appendChild(scoreEl);

      const pctEl = el('div', 'doc-bar-quiz-pct');
      pctEl.textContent = `${pct}%`;
      container.appendChild(pctEl);

      const msgEl = el('div', 'doc-bar-quiz-result-message');
      msgEl.textContent = RESULT_MESSAGES[grade] || '';
      container.appendChild(msgEl);

      const retakeBtn = el('button', 'doc-bar-quiz-start-btn');
      retakeBtn.textContent = 'Retake Quiz';
      retakeBtn.addEventListener('click', () => {
        screen = 'start';
        currentIndex = 0;
        score = 0;
        answers = {};
        render();
      });
      container.appendChild(retakeBtn);

      root.appendChild(container);
    };

    render();
    return root;
  }

  _buildPromptUI(key, reason, file) {
    const prompt = PROMPTS[key];
    const wrapper = el('div', 'doc-bar-prompt-view');

    // Header message
    const header = el('div', 'doc-bar-prompt-header');
    const icon = el('div', 'doc-bar-prompt-icon');
    icon.textContent = reason === 'missing' ? '📄' : '🔄';
    header.appendChild(icon);

    const title = el('h3', 'doc-bar-prompt-title');
    if (reason === 'missing') {
      title.textContent = 'Document not generated yet';
    } else if (reason === 'unversioned') {
      title.textContent = 'Document needs to be regenerated';
    } else {
      title.textContent = 'Document is outdated';
    }
    header.appendChild(title);

    const desc = el('p', 'doc-bar-prompt-desc');
    if (reason === 'missing') {
      desc.textContent = `The file ${file} doesn't exist yet. Use the prompt below with your preferred AI assistant to generate it.`;
    } else {
      desc.textContent = `The file ${file} was generated with an older version of doc-bar. Regenerate it using the prompt below to get the latest format.`;
    }
    header.appendChild(desc);
    wrapper.appendChild(header);

    // Target path info
    const pathInfo = el('div', 'doc-bar-prompt-path');
    pathInfo.innerHTML = DOMPurify.sanitize(
      `Save the output to: <code>${this.options.basePath}/${file}</code>`
    );
    wrapper.appendChild(pathInfo);

    // Version stamp reminder
    const stampInfo = el('div', 'doc-bar-prompt-stamp');
    stampInfo.innerHTML = DOMPurify.sanitize(
      `The generated document must start with: <code>${VERSION_COMMENT}</code>`
    );
    wrapper.appendChild(stampInfo);

    // Copy button
    const copyBtn = el('button', 'doc-bar-prompt-copy-btn');
    copyBtn.textContent = 'Copy Prompt to Clipboard';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(prompt).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('doc-bar-prompt-copy-success');
        setTimeout(() => {
          copyBtn.textContent = 'Copy Prompt to Clipboard';
          copyBtn.classList.remove('doc-bar-prompt-copy-success');
        }, 2000);
      });
    });
    wrapper.appendChild(copyBtn);

    // Prompt preview
    const previewLabel = el('div', 'doc-bar-prompt-preview-label');
    previewLabel.textContent = 'Generation prompt';
    wrapper.appendChild(previewLabel);

    const preview = el('pre', 'doc-bar-prompt-preview');
    const code = el('code');
    code.textContent = prompt;
    preview.appendChild(code);
    wrapper.appendChild(preview);

    return wrapper;
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

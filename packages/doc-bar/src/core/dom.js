/**
 * Shared DOM helpers used across all modules.
 */

export function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export function createOverlay(onClose) {
  const overlay = el('div', 'doc-bar-overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });
  return overlay;
}

export function createPanel(className, title, onClose) {
  const panel = el('div', className, {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title,
  });
  panel.addEventListener('click', (e) => e.stopPropagation());

  const header = el('div', 'doc-bar-panel-header');
  const h2 = el('h2', 'doc-bar-panel-title');
  h2.textContent = title;
  const closeBtn = el('button', 'doc-bar-close', { 'aria-label': 'Close' });
  closeBtn.textContent = '\u00d7';
  closeBtn.addEventListener('click', onClose);
  header.appendChild(h2);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const body = el('div', 'doc-bar-panel-body');
  panel.appendChild(body);

  return { panel, body };
}

export function createLoadingSkeleton() {
  const skeleton = el('div', 'doc-bar-skeleton');
  for (let i = 0; i < 4; i++) {
    const line = el('div', i === 0 ? 'doc-bar-skeleton-line doc-bar-skeleton-line-title' : 'doc-bar-skeleton-line');
    if (i === 3) line.classList.add('doc-bar-skeleton-line-short');
    skeleton.appendChild(line);
  }
  return skeleton;
}

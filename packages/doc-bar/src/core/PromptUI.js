import DOMPurify from 'dompurify';
import { el } from './dom.js';
import { PROMPTS, COMBINED_PROMPT } from './prompts.js';

function createCopyButton(text, label) {
  const btn = el('button', 'doc-bar-prompt-copy-btn');
  btn.textContent = label;
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('doc-bar-prompt-copy-success');
      setTimeout(() => {
        btn.textContent = label;
        btn.classList.remove('doc-bar-prompt-copy-success');
      }, 2000);
    });
  });
  return btn;
}

export function buildGenerateUI(basePath, navLinks) {
  const wrapper = el('div', 'doc-bar-prompt-view');

  const header = el('div', 'doc-bar-prompt-header');
  const title = el('h3', 'doc-bar-prompt-title');
  title.textContent = 'Documentation not generated yet';
  header.appendChild(title);

  const desc = el('p', 'doc-bar-prompt-desc');
  desc.textContent = 'Copy the generation prompt and paste it into your preferred AI assistant. Your assistant will generate the docs based on your project\'s source code. Feel free to modify the resulting docs however you wish.';
  header.appendChild(desc);
  wrapper.appendChild(header);

  const warning = el('div', 'doc-bar-prompt-warning');
  const warningIcon = el('span', 'doc-bar-prompt-warning-icon');
  warningIcon.textContent = '\u26a0';
  warning.appendChild(warningIcon);
  const warningText = el('span');
  warningText.textContent = 'This tool is intended for personal projects. If you work within an organization, respect your organization\'s rules and requirements for sharing code with an LLM before using this prompt.';
  warning.appendChild(warningText);
  wrapper.appendChild(warning);

  const pathInfo = el('div', 'doc-bar-prompt-path');
  pathInfo.innerHTML = DOMPurify.sanitize(
    `Save generated files to: <code>${basePath}/</code>`
  );
  wrapper.appendChild(pathInfo);

  const fileList = el('div', 'doc-bar-prompt-file-list');
  for (const { file } of navLinks) {
    const fileEl = el('code', 'doc-bar-prompt-file-item');
    fileEl.textContent = file;
    fileList.appendChild(fileEl);
  }
  wrapper.appendChild(fileList);

  wrapper.appendChild(createCopyButton(COMBINED_PROMPT, 'Copy Prompt to Clipboard'));

  return wrapper;
}

export function buildPromptUI(key, reason, file, basePath) {
  const prompt = PROMPTS[key];
  const wrapper = el('div', 'doc-bar-prompt-view');

  const header = el('div', 'doc-bar-prompt-header');
  const title = el('h3', 'doc-bar-prompt-title');
  title.textContent = reason === 'missing' ? 'Document not generated yet' :
    reason === 'unversioned' ? 'Document needs to be regenerated' :
    'Document is outdated';
  header.appendChild(title);

  const desc = el('p', 'doc-bar-prompt-desc');
  desc.textContent = reason === 'missing'
    ? `Copy the prompt below and paste it into your preferred AI assistant along with your project's source code to generate ${file}.`
    : `This document was generated with an older format. Copy the prompt below and regenerate ${file} to get the latest version.`;
  header.appendChild(desc);
  wrapper.appendChild(header);

  const pathInfo = el('div', 'doc-bar-prompt-path');
  pathInfo.innerHTML = DOMPurify.sanitize(
    `Save the output to: <code>${basePath}/${file}</code>`
  );
  wrapper.appendChild(pathInfo);

  wrapper.appendChild(createCopyButton(prompt, 'Copy Prompt to Clipboard'));

  return wrapper;
}

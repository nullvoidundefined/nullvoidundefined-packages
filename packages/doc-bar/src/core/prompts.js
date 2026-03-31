/**
 * Embedded generation prompts for each document type.
 * Imported as raw strings at build time via Vite's ?raw suffix.
 *
 * DOC_FORMAT_VERSION is incremented only when the expected document format
 * changes in a breaking way (e.g. new required sections, changed quiz syntax).
 * It is independent of the package version.
 */

import summaryPrompt from '../../application-documentation-prompts/CLAUDE-SUMMARY.md?raw';
import technicalSummaryPrompt from '../../application-documentation-prompts/CLAUDE-TECHNICAL-SUMMARY.md?raw';
import technicalOverviewPrompt from '../../application-documentation-prompts/CLAUDE-TECHNICAL-OVERVIEW.md?raw';
import quizPrompt from '../../application-documentation-prompts/CLAUDE-QUIZ.md?raw';

export const DOC_FORMAT_VERSION = 1;

export const VERSION_COMMENT = `<!-- @bottomlessmargaritas/doc-bar format:${DOC_FORMAT_VERSION} -->`;

export const PROMPTS = {
  summary: summaryPrompt,
  'technical-summary': technicalSummaryPrompt,
  'technical-overview': technicalOverviewPrompt,
  quiz: quizPrompt,
};

/**
 * Parses the format version from the first line of a document.
 * Returns the version number, or null if the stamp is missing.
 */
export function parseDocVersion(text) {
  const match = text.match(/^<!--\s*@bottomlessmargaritas\/doc-bar\s+format:(\d+)\s*-->/);
  return match ? parseInt(match[1], 10) : null;
}

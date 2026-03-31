/**
 * Embedded generation prompts for each document type.
 * Imported as raw strings at build time via Vite's ?raw suffix.
 *
 * DOC_FORMAT_VERSION is incremented only when the expected document format
 * changes in a breaking way (e.g. new required sections, changed quiz syntax).
 * It is independent of the package version.
 */

import summaryPrompt from '../../application-documentation-prompts/CLAUDE-SUMMARY.md?raw';
import stackGuidePrompt from '../../application-documentation-prompts/CLAUDE-STACK-GUIDE.md?raw';
import technicalSummaryPrompt from '../../application-documentation-prompts/CLAUDE-TECHNICAL-SUMMARY.md?raw';
import technicalOverviewPrompt from '../../application-documentation-prompts/CLAUDE-TECHNICAL-OVERVIEW.md?raw';
import quizPrompt from '../../application-documentation-prompts/CLAUDE-QUIZ.md?raw';
import reviewPrompt from '../../application-documentation-prompts/CLAUDE-REVIEW.md?raw';

export const DOC_FORMAT_VERSION = 1;

export const VERSION_COMMENT = `<!-- @bottomlessmargaritas/doc-bar format:${DOC_FORMAT_VERSION} -->`;

export const PROMPTS: Record<string, string> = {
  summary: summaryPrompt,
  stack: stackGuidePrompt,
  'technical-summary': technicalSummaryPrompt,
  'technical-overview': technicalOverviewPrompt,
  quiz: quizPrompt,
  review: reviewPrompt,
};

export const COMBINED_PROMPT = `# Generate Application Documentation

Generate all six documentation files for this project. Read the entire codebase first, then produce each file following the specifications below. Each file must start with the version stamp: \`${VERSION_COMMENT}\`

## CRITICAL: Privacy & Security

**DO NOT** read, reference, or include content from:
- \`.env\`, \`.env.local\`, \`.env.production\`, or any environment variable files
- Files containing API keys, secrets, tokens, passwords, or credentials
- Files containing personally identifiable information (PII) or protected health information (PHI)
- Database dumps, seed files with real user data, or fixture files with real names/emails
- Any file that could compromise the security or privacy of the project or its users

If you encounter sensitive data while reading the codebase, **skip it entirely**. Document the existence of environment variables by name only (e.g., "requires \`DATABASE_URL\`") without revealing values. Never include real secrets, credentials, or personal data in any generated document.

Output all six files clearly separated with the filename as a heading.

---

## File 1: summary.md

${summaryPrompt}

---

## File 2: stack.md

${stackGuidePrompt}

---

## File 3: technical-summary.md

${technicalSummaryPrompt}

---

## File 4: technical-overview.md

${technicalOverviewPrompt}

---

## File 5: quiz.md

${quizPrompt}

---

## File 6: review.md

${reviewPrompt}
`;

/**
 * Parses the format version from the first line of a document.
 * Returns the version number, or null if the stamp is missing.
 */
export function parseDocVersion(text: string): number | null {
  const match = text.match(/^<!--\s*@bottomlessmargaritas\/doc-bar\s+format:(\d+)\s*-->/);
  return match ? parseInt(match[1], 10) : null;
}

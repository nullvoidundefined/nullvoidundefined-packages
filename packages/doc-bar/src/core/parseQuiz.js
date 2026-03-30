/**
 * Parses quiz markdown into an array of question objects.
 *
 * Expected format per question:
 *
 * **1. Question text?**
 * - A) Option text
 * - **B) Correct option text**
 * - C) Option text
 * - D) Option text
 *
 * ? Clarification line
 *
 * > Explanation line
 */
export function parseQuiz(markdown) {
  const questions = [];
  const blocks = markdown.split(/\n(?=\*\*\d+\.)/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const questionMatch = trimmed.match(/^\*\*(\d+)\.\s+([\s\S]+?)\*\*/);
    if (!questionMatch) continue;

    const number = parseInt(questionMatch[1], 10);
    const text = questionMatch[2].trim();

    const options = [];
    let correctIndex = -1;
    const optionLines = trimmed.match(/^- (\*\*)?([A-D]\)[\s\S]+?)(\*\*)?$/gm) || [];

    for (let i = 0; i < optionLines.length; i++) {
      const line = optionLines[i];
      const isBold = /^- \*\*/.test(line);
      const optionText = line
        .replace(/^- \*\*/, '')
        .replace(/\*\*$/, '')
        .replace(/^- /, '')
        .trim();
      options.push(optionText);
      if (isBold) correctIndex = i;
    }

    const clarificationLines = (trimmed.match(/^\? .+$/gm) || []).map((l) =>
      l.replace(/^\? /, '').trim()
    );
    const clarification = clarificationLines.length > 0 ? clarificationLines.join(' ') : null;

    const explanationLines = (trimmed.match(/^> .+$/gm) || []).map((l) =>
      l.replace(/^> /, '').trim()
    );
    const explanation = explanationLines.length > 0 ? explanationLines.join(' ') : null;

    if (options.length >= 2 && correctIndex >= 0) {
      questions.push({ number, text, options, correctIndex, clarification, explanation });
    }
  }

  return questions;
}

export function shuffleQuestions(questions) {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

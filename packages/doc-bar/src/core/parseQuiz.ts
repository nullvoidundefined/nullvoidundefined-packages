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

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  number: number;
  text: string;
  options: string[];
  correctIndex: number;
  clarification: string | null;
  explanation: string | null;
  difficulty: Difficulty;
}

export function parseQuiz(markdown: string): Question[] {
  const questions: Question[] = [];
  const blocks = markdown.split(/\n(?=\*\*\d+\.)/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const questionMatch = trimmed.match(/^\*\*(\d+)\.\s+([\s\S]+?)\*\*/);
    if (!questionMatch) continue;

    const number = parseInt(questionMatch[1], 10);
    const text = questionMatch[2].trim();

    const options: string[] = [];
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

    const difficultyMatch = trimmed.match(/^@ ?(easy|medium|hard)$/im);
    const difficulty = (difficultyMatch ? difficultyMatch[1].toLowerCase() : 'medium') as Difficulty;

    if (options.length >= 2 && correctIndex >= 0) {
      questions.push({ number, text, options, correctIndex, clarification, explanation, difficulty });
    }
  }

  return questions;
}

const DIFFICULTY_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

export function sortByDifficulty(questions: Question[]): Question[] {
  return [...questions].sort(
    (a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.difficulty] ?? 1)
  );
}

export function getDifficultyBreakdown(questions: Question[]): Record<Difficulty, number> {
  const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  for (const q of questions) {
    counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
  }
  return counts;
}

export function shuffleQuestions(questions: Question[]): Question[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

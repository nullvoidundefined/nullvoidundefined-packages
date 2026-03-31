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
export declare function parseQuiz(markdown: string): Question[];
export declare function sortByDifficulty(questions: Question[]): Question[];
export declare function getDifficultyBreakdown(questions: Question[]): Record<Difficulty, number>;
export declare function shuffleQuestions(questions: Question[]): Question[];

# Generating Quiz Content

This prompt defines how to generate the `quiz.md` file. The Quiz is the fourth link in the doc-bar and renders as an interactive quiz with a start screen, one-question-at-a-time progression (ordered from easy to hard), and a results screen with letter grade and feedback.

---

## Purpose

The Quiz tests the reader's understanding of the application — its architecture, tools, APIs, patterns, and concepts. It reinforces learning from the Summary, Technical Summary, and Technical Overview documents. A well-written quiz turns passive reading into active recall.

## CRITICAL: Privacy & Security

**DO NOT** read, reference, or include content from `.env` files, credentials, API keys, secrets, PII, PHI, database dumps with real user data, or any file that could compromise security or privacy. If you encounter sensitive data, skip it entirely. Never create quiz questions that reference real secrets, credentials, or personal data.

## Target File

```
quiz.md
```

## Markdown Format

The quiz parser (`parseQuiz.js`) expects a specific markdown format. Every question **must** follow this structure exactly or it will be silently dropped by the parser.

### Single Question Format

```markdown
**[NUMBER]. [QUESTION TEXT]?**
@ [easy|medium|hard]
- A) [Option text]
- **B) [Correct option text — wrapped in bold]**
- C) [Option text]
- D) [Option text]

? [Clarification line — explains the question's concepts]
? [Additional clarification line — can span multiple lines]

> [Explanation line — explains why the correct answer is correct]
> [Additional explanation line — can span multiple lines]
```

### Format Rules (Parser Requirements)

These are not style preferences — the parser will fail to extract questions that violate them:

1. **Question line:** Must start with `**` followed by a number, a period, a space, the question text, and end with `**`. The question text should end with `?` but this is not parser-required.

2. **Difficulty line** (optional but strongly recommended): A line starting with `@ ` followed by `easy`, `medium`, or `hard`. Must appear after the question line and before the options. If omitted, the question defaults to `medium`. Difficulty determines display order in the quiz (easy first, hard last).

3. **Options:** Exactly four options, each on its own line starting with `- `. Option letters must be `A)`, `B)`, `C)`, `D)` in order. Exactly one option must be wrapped in `**bold**` to mark it as correct.

4. **Clarification lines** (optional but strongly recommended): Each line starts with `? ` (question mark + space). Multiple lines are joined into a single paragraph. Supports inline markdown: `[links](url)` and `` `code` ``.

5. **Explanation lines** (optional but strongly recommended): Each line starts with `> ` (greater-than + space). Multiple lines are joined into a single paragraph. Supports inline markdown: `[links](url)` and `` `code` ``.

6. **Separation:** Questions are separated by the next `**[NUMBER].` pattern. An optional `---` horizontal rule can be placed between questions for readability but is not required.

7. **Numbering:** Questions must be numbered sequentially starting from 1. Gaps in numbering won't break the parser but should be avoided.

### File Header

Start the file with a version stamp and descriptive header (not parsed as a question). The version stamp on line 1 is **required** — the doc-bar component checks for it and will prompt the user to regenerate if it is missing or outdated.

```markdown
<!-- @bottomlessmargaritas/doc-bar format:1 -->
# [App Name] — Quiz Questions

Each question has four options. Only one is correct (marked with **bold**).

---
```

---

## Content Guidelines

### Question Categories

Generate questions across these categories, roughly evenly distributed:

| Category              | What it tests                                              | Example                                                    |
| --------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| **Architecture**      | System design, component relationships, data flow          | "What layer handles database queries in this app?"         |
| **Tools & Libraries** | Specific technologies used and why                         | "What library validates structured output from the API?"   |
| **API & Endpoints**   | REST design, request/response patterns, status codes       | "What HTTP method does the create endpoint use?"           |
| **Patterns**          | Design patterns, coding patterns, architectural patterns   | "What pattern ensures type safety between schema and API?" |
| **Configuration**     | Environment variables, deployment, infrastructure          | "Where is the database hosted?"                            |
| **Frontend**          | Components, state management, routing, styling             | "What styling approach does the app use?"                  |
| **Database**          | Schema design, query patterns, migrations                  | "What column type stores the primary key?"                 |
| **Error Handling**    | How failures are managed across the stack                  | "How does the API respond to invalid input?"               |

### Question Difficulty

Aim for a mix of difficulty levels:

- **30% Easy** — Facts that anyone who read the Summary would know. Tests basic recall.
- **50% Medium** — Requires understanding from the Technical Summary. Tests comprehension of patterns and decisions.
- **20% Hard** — Requires deep knowledge from the Technical Overview. Tests implementation details, edge cases, and trade-off reasoning.

### Question Count

Generate **20–100 questions** per project, scaling with the size and complexity of the codebase. The quiz presents questions one at a time, ordered from easy to hard, with a start screen showing question count and difficulty breakdown, and a results screen with letter grade and feedback.

- **Small projects** (< 10 source files, single-page apps, templates): 20–30 questions
- **Medium projects** (10–50 source files, multiple features, API routes): 30–60 questions
- **Large projects** (50+ source files, multiple services, complex architecture): 60–100 questions

Use your judgment — a project with 5 files but deeply complex patterns may warrant 40 questions, while a project with 100 files of boilerplate may only need 50. The goal is comprehensive coverage without padding with low-quality filler.

### Writing Good Questions

**Question text rules:**

- Ask one thing per question — no compound questions
- Be specific: "What library does X use for Y?" not "What tools does X use?"
- Avoid negatives: "Which is NOT..." questions are confusing and test elimination rather than knowledge
- Avoid "all of the above" and "none of the above" options
- Question text should be self-contained — don't reference other questions

**Option rules:**

- All four options must be plausible — no joke answers, no obviously wrong options
- Options should be roughly the same length — a much longer option signals the correct answer
- Options should be mutually exclusive — no overlapping answers
- Wrong options should be real technologies/concepts that a reasonable person might confuse with the correct answer
- Alphabetize options when they're proper nouns (library names, service names) unless the ordering matters

**Clarification rules (the `?` lines):**

- Explain the concepts and terminology in the question BEFORE the reader has answered
- Must NOT hint at the correct answer — this is educational context, not a clue
- Written for someone who understands programming but may not know the specific domain
- 2–4 sentences typical
- Think of this as: "What do I need to know to understand what this question is asking?"

**Example of good clarification:**

```markdown
? Runtime validation libraries check data at execution time (not just compile time) to ensure it conforms to a defined schema — correct types, required fields present, values within expected ranges. This is important when processing user input or external API responses where the shape of the data is not guaranteed.
```

**Example of bad clarification (hints at answer):**

```markdown
? Zod is a popular TypeScript-first validation library that uses a parse-don't-validate approach...
```

This is bad because it names the correct answer in the clarification.

**Explanation rules (the `>` lines):**

- Explain WHY the correct answer is correct, not just that it is
- If relevant, briefly explain why the wrong options are wrong
- Include links to official documentation where helpful: `[link text](url)`
- Include inline code references where helpful: `` `functionName()` ``, `` `config.ts` ``
- 3–6 sentences typical
- Think of this as: "Now that you've answered, here's what you should learn from this question."

**Example of good explanation:**

```markdown
> [Zod](https://zod.dev/) is a TypeScript-first schema declaration and validation library. The API validates every response against a Zod schema before persisting, catching hallucinated fields, wrong types, and missing required values at runtime — not just at compile time. Joi and Yup are alternatives but lack Zod's `z.infer<>` for zero-drift type inference.
```

---

## Complete Example Question

```markdown
**12. What pattern does the API use to handle failed validation?**
@ hard
- A) Silently discards the response and returns an empty object
- B) Logs the error and returns a 500 status with a generic message
- **C) Returns a 422 status with structured validation errors**
- D) Falls back to a regex-based parser for the same input

? When incoming data doesn't match the expected schema, the application needs a strategy for communicating what went wrong. Options range from generic error messages to structured responses that tell the client exactly which fields failed and why, enabling the UI to display targeted feedback.

> The API catches validation errors and returns a 422 Unprocessable Entity status with a structured error response containing the specific fields that failed and their validation messages. This enables the frontend to display inline error messages next to the relevant form fields rather than a generic error banner. A 400 status would also be reasonable, but 422 more precisely communicates that the request was syntactically correct but semantically invalid.
```

---

## Anti-Patterns to Avoid

1. **Trivia questions** — "In what year was React released?" Tests memorization, not understanding.
2. **Reading comprehension** — "According to the README, what is the app's tagline?" Tests copy-paste, not knowledge.
3. **Vague questions** — "What is the best approach for this app?" "Best" is subjective without criteria.
4. **Implementation details that change** — "What is the exact SQL query for fetching users?" Too brittle — any refactor invalidates the question.
5. **Questions about file names or line numbers** — "What file contains the main handler?" Tests directory memory, not understanding.
6. **Questions with >1 defensible correct answer** — If a reasonable engineer could argue for two options, the question is flawed. Tighten the question text or fix the options.

---

## Content Rules

1. **20–100 questions** per quiz file, scaled to codebase size
2. **Every question must have all 4 options** — the parser drops questions with fewer
3. **Every question must have a difficulty tag** — `@ easy`, `@ medium`, or `@ hard` on the line after the question text
4. **Every question should have both clarification and explanation** — they're technically optional but should always be included
5. **Markdown format must be exact** — see Parser Requirements above
6. **No HTML** in question text or options — HTML is only supported in clarification and explanation (via inline markdown conversion)
7. **Sequential numbering** starting from 1
8. **Even distribution** across the 8 question categories
9. **Mixed difficulty** — 30% easy, 50% medium, 20% hard

---

## Generating for a New Project

1. Read the project's Summary, Technical Summary, and Technical Overview documents first — the quiz should test knowledge from all three
2. Read the project's source code to verify facts and find implementation details for hard questions
3. Create a question distribution plan: how many per category, what difficulty
4. Write easy questions first (facts from the Summary), then medium (patterns from Technical Summary), then hard (implementation from Technical Overview)
5. For each question, write the clarification BEFORE the explanation — clarification should not know the answer
6. Review all questions: are any options ambiguous? Could two answers be correct? Is any clarification accidentally hinting at the answer?
7. Verify the markdown format by checking every question against the parser requirements
8. Number sequentially, add the file header, save as `quiz.md`

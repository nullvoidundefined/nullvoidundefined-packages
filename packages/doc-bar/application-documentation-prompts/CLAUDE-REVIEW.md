# Generating Code Review Content

This prompt defines how to generate the `review.md` file. The Review is the fifth link in the doc-bar and serves as an internal engineering audit of the codebase from the perspective of a staff-level engineer.

---

## Purpose

The Review document answers: **"What could be improved in this codebase, and how?"** It is an honest, constructive code audit that identifies bugs, security vulnerabilities, race conditions, code smells, architectural opportunities, and areas where the code could be stronger. Think of it as a friendly senior engineer sitting down with you over coffee to walk through your code — pointing things out, explaining why they matter, and showing you exactly how to fix them.

The tone should be **kind, encouraging, and educational**. The target audience is junior developers and vibe coders who are learning by building. Every finding should teach something — link to resources, explain the "why" behind best practices, and offer concrete solutions. Never be condescending or dismissive. Celebrate what's done well alongside what needs improvement.

## CRITICAL: Privacy & Security

**DO NOT** read, reference, or include content from `.env` files, credentials, API keys, secrets, PII, PHI, database dumps with real user data, or any file that could compromise security or privacy. If you encounter sensitive data, skip it entirely. You may note that secrets are improperly stored or exposed (e.g., "API key is hardcoded in source") without revealing the actual value.

## Target File

```
review.md
```

## Structure

Generate the markdown file with these sections:

### Version Stamp (required first line)

The very first line of the generated file **must** be the following HTML comment. The doc-bar component checks for this stamp and will prompt the user to regenerate if it is missing or outdated.

```markdown
<!-- @bottomlessmargaritas/doc-bar format:1 -->
```

### 1. Title

```markdown
<!-- @bottomlessmargaritas/doc-bar format:1 -->
# [App Name] — Code Review
```

### 2. Executive Summary

A 2–3 sentence overall assessment of the codebase quality. Be direct. Examples:

- "Solid foundation with good separation of concerns, but several security vulnerabilities and missing error handling need immediate attention."
- "Prototype-quality code that works but is not production-ready. Significant refactoring needed in the API layer and database access patterns."
- "Well-structured and maintainable. A few code smells and one race condition, but overall this is clean, professional code."

### 3. Severity Legend

Include this legend so readers understand the ratings:

```markdown
## Severity

| Level | Meaning |
|-------|---------|
| **CRITICAL** | Security vulnerability, data loss risk, or crash in production. Fix immediately. |
| **HIGH** | Bug that affects users, race condition, or architectural flaw. Fix before next release. |
| **MEDIUM** | Code smell, missing validation, or non-standard practice. Fix during normal development. |
| **LOW** | Style issue, minor optimization, or documentation gap. Fix when convenient. |
| **INFO** | Observation or suggestion. Not a problem, but worth knowing. |
```

### 4. Findings

The bulk of the document. Each finding is a `###` subheading with a structured format:

```markdown
### [SHORT TITLE] — [SEVERITY]

**Location:** `path/to/file.ts:42` (or `path/to/file.ts`, lines 42–58)

**What's happening:** [2–4 sentences explaining the issue in plain language. Be specific — name the function, variable, or pattern. Explain what could go wrong and why it matters. Use a friendly tone: "This could cause..." not "This is wrong."]

**Example:** [Optional — include a short code snippet showing the current code, 3–10 lines max]

**How to fix it:** [2–4 sentences with a concrete solution. Show the fixed code if helpful. Link to documentation or learning resources that explain the concept. If there are multiple approaches, suggest the simplest one first.]

**Learn more:** [Optional — 1–2 links to official docs, tutorials, or articles that explain the underlying concept. E.g., "[OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Scripting_Prevention_Cheat_Sheet.html)"]
```

**Finding categories to check systematically:**

#### Security
- XSS vulnerabilities (innerHTML, dangerouslySetInnerHTML, template literals in HTML)
- SQL injection (string concatenation in queries, missing parameterization)
- Authentication/authorization gaps (missing auth checks, privilege escalation)
- Secrets in source code (hardcoded API keys, tokens, passwords)
- Insecure dependencies (known CVEs, outdated packages with security patches)
- CSRF/CORS misconfiguration
- Input validation gaps (user input flowing into dangerous operations)
- Path traversal (user input in file paths)

#### Bugs & Correctness
- Race conditions (concurrent state mutations, async operations without locks)
- Null/undefined access (missing null checks, optional chaining opportunities)
- Off-by-one errors (array bounds, pagination, loop conditions)
- Type coercion issues (== vs ===, truthy/falsy traps)
- Uncaught promise rejections (missing .catch, unhandled async errors)
- State management bugs (stale closures, missing dependency arrays, shared mutable state)
- Resource leaks (unclosed connections, event listeners not removed, timers not cleared)

#### Architecture & Design
- God classes/functions (too many responsibilities)
- Tight coupling (components that know too much about each other)
- Missing abstraction (repeated patterns that should be extracted)
- Wrong abstraction (premature generalization, unnecessary complexity)
- Circular dependencies
- Layer violations (UI code in business logic, data access in handlers)

#### Performance
- N+1 queries (fetching related data in loops)
- Missing pagination (unbounded result sets)
- Unnecessary re-renders (missing memoization, unstable references)
- Large bundle impact (importing entire libraries for one function)
- Missing caching (repeated expensive computations)
- Blocking operations (synchronous I/O, long-running loops on main thread)

#### Code Quality
- Dead code (unused functions, imports, variables)
- Inconsistent naming (camelCase vs snake_case, abbreviations)
- Missing error handling (empty catch blocks, swallowed errors)
- Magic numbers/strings (unexplained literals)
- Overly complex logic (deeply nested conditionals, long functions)
- Missing TypeScript types (any, unknown without narrowing, missing return types)

#### Testing Gaps
- Untested critical paths (auth, payment, data mutation)
- Missing edge case tests (empty input, null, boundary values)
- Test anti-patterns (testing implementation details, brittle selectors)

### 5. Positive Findings

A section under `## What's Done Well` with 3–5 bullet points acknowledging good practices. Every codebase has strengths — call them out. This prevents the review from being purely negative and reinforces good habits.

```markdown
## What's Done Well

- **Clean separation of concerns** — Handlers, services, and repositories each own a single responsibility. This makes the API layer easy to test and extend.
- **Comprehensive ESLint configuration** — Security, accessibility, and TypeScript rules are all enabled with sensible defaults.
- **Defensive input validation** — Every API endpoint validates input with Zod schemas before processing.
```

### 6. Priority Recommendations

A final section under `## Recommendations` with a numbered list of the top 5–10 actions, ordered by impact:

```markdown
## Recommendations

1. **Fix the SQL injection in `userRepository.ts:34`** — This is the highest-risk finding. Parameterize the query immediately.
2. **Add error boundaries to the React frontend** — Unhandled rendering errors currently crash the entire app.
3. **Remove hardcoded API key from `config.ts`** — Move to environment variable.
4. **Add rate limiting to auth endpoints** — Currently unlimited login attempts are possible.
5. **Write integration tests for the payment flow** — Zero test coverage on the most critical path.
```

**Rules:**

- Order by severity, then by effort (quick fixes first among equal severity)
- Each recommendation references the specific finding it addresses
- Include the file and line number for quick navigation

---

## Content Rules

1. **Length:** Scale with codebase complexity. Small projects: 500–1000 words. Large projects: 2000–5000 words.
2. **Markdown only:** No HTML, no JSX, no frontmatter
3. **Code blocks are encouraged** — Show the problematic code, not just describe it
4. **Be specific:** Name files, functions, line numbers. Vague findings are useless.
5. **Be actionable:** Every finding must have a recommendation. "This is bad" without "do this instead" is not helpful.
6. **Be kind and educational:** Friendly, not harsh. "Hey, this function has a race condition — here's what that means and how to fix it" not "this is wrong." Remember the audience is learning. Frame findings as growth opportunities, not failures.
7. **External links encouraged:** Link to official docs, OWASP references, or authoritative sources when explaining why something is a problem.
8. **Headings hierarchy:** `#` for title, `##` for sections, `###` for individual findings

---

## Review Process

1. Read every source file in the project — this review requires full codebase knowledge
2. Check each category systematically (security, bugs, architecture, performance, quality, testing)
3. For each finding, determine severity and write the structured finding
4. Identify 3–5 positive practices to acknowledge
5. Rank all findings by severity and create the priority recommendation list
6. Write the executive summary last — it should reflect the overall picture
7. Verify: is every finding specific (file, line, function)? Is every recommendation actionable? Are severities calibrated correctly?
8. Verify: would a developer receiving this review know exactly what to fix and in what order? If not, add detail.

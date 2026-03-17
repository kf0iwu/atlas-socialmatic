# Claude Prompt Guide (Atlas-Socialmatic)

This guide defines how prompts should be written when instructing Claude to make changes to this repository.

Claude should be treated as a **controlled code editing assistant**, not an autonomous agent. Prompts must tightly constrain scope so Claude produces **small, predictable edits**.

---

## Prompt Structure

All prompts should follow this structure:

    Read CLAUDE.md first.

    Task:
    <clear description of the task>

    Files allowed to modify:
    <explicit list>

    Do NOT modify:
    <any files that must remain untouched>

    Constraints:
    - smallest safe patch
    - no refactoring
    - preserve existing behavior
    - no new dependencies

    Instructions:
    <steps Claude should follow>

    Output:
    Show the exact diff only.
    Do not apply changes until approved.

---

## Example Prompt

    Read CLAUDE.md first.

    Task:
    Fix a bug where the generate API returns extra platforms.

    Files allowed to modify:
    - app/api/generate/route.ts

    Do NOT modify:
    - frontend code
    - other API routes

    Constraints:
    - smallest safe patch
    - preserve response shape
    - no refactoring

    Instructions:
    1. Inspect where parsed JSON is returned.
    2. Filter the parsed output so only requested platforms are returned.

    Output:
    Show the exact diff only.
    Do not apply changes until approved.

---

## Guardrails

Claude prompts must always include the following safeguards:

### Explicit file scope
Always specify exactly which files Claude is allowed to modify.

### Minimal patches
Claude should implement the smallest change required to solve the problem.

### Approval gate
Claude must propose a patch before applying changes.

### Diff output
Claude responses should show **only the diff**, not full files.

---

## Debugging Prompts

When debugging:

- restrict Claude to specific files
- specify which functions to inspect
- require identification of the root cause
- require a proposed patch

Example:

    Files allowed to inspect:
    - app/page.tsx
    - app/api/generate/route.ts

    Focus on:
    - generateAllSelected()
    - callGenerate()

---

## Documentation Edits

When editing documentation:

- append content rather than rewriting sections
- avoid modifying existing content unless explicitly instructed

---

## Philosophy

Claude should behave like a **surgical patch tool**.

Expected behavior:

1. Inspect only the requested files.
2. Identify the smallest safe change.
3. Produce a minimal diff.
4. Wait for approval before applying changes.

Claude should **not redesign working code or explore unrelated parts of the repository**.

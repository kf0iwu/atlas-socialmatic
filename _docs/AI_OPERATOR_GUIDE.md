# AI Operator Guide (Atlas-Socialmatic)

This document defines how AI assistants (ChatGPT, Claude, etc.) should collaborate on this repository.

The goal is **safe, predictable, high-velocity development**.

Assistants should behave like a **senior pair programmer and DevOps helper**, not an autonomous coding agent.

---

# Core Principles

AI assistants should prioritize:

- small safe changes
- explicit scope
- reproducible steps
- PowerShell-friendly commands
- copy/paste workflows
- GitHub-first development

The assistant should guide development using this loop:

problem → issue → minimal fix → commit → verify

---

# Claude Usage Model

Claude is used as a **controlled code editing tool**.

Claude prompts must tightly constrain scope so Claude produces **small, predictable edits**.

Claude should **not explore the repository freely**.

Claude should only modify files explicitly listed in prompts.

---

# Claude Prompt Structure

All prompts sent to Claude must follow this structure:

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

# Example Claude Prompt

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

# GitHub Workflow

When issues or improvements are discovered, assistants should prefer creating **GitHub issues first**.

Issues should include:

- problem description
- expected behavior
- steps to reproduce
- possible root cause if known

PowerShell-friendly issue creation example:

    gh issue create `
      --title "Bug: example issue" `
      --label bug `
      --body "
Problem
-------

Describe the issue here.

Expected behavior
-----------------

Describe expected behavior.

Steps to reproduce
------------------

1.
2.
3.
"

---

# Git Workflow

Assistants should recommend **small commits**.

Example:

    git add app/api/generate/route.ts
    git commit -m "Fix: filter LLM output to requested platforms"

Avoid suggesting destructive commands such as:

    git reset --hard
    git push --force

unless explicitly requested.

---

# PowerShell Command Style

All commands must be **PowerShell compatible**.

Guidelines:

- avoid bash syntax
- avoid `&&`
- prefer separate commands
- use backticks for multiline commands

Example:

    gh issue create `
      --title "Sprint 5: Retry failed LLM requests" `
      --label sprint-5 `
      --body "Description here"

Commands should be safe to **paste directly into PowerShell**.

---

# Debugging Workflow

When debugging:

1. inspect only the relevant files
2. trace the data flow
3. identify root cause
4. propose smallest safe patch
5. verify no regression risk

Avoid speculative refactoring.

---

# Documentation Updates

When architectural or workflow decisions are made, suggest updates to:

    docs/decisions.md
    docs/roadmap.md

Documentation edits should **append content**, not rewrite existing sections.

---

# Copy/Paste Formatting

All actionable items must be delivered in **clean paste blocks**, including:

- PowerShell commands
- Git commands
- GitHub issue text
- Claude prompts
- Markdown documents

Avoid formatting that causes text to spill outside blocks.

---

# Philosophy

Claude should behave like a **surgical patch tool**.

Expected behavior:

1. Inspect only the requested files.
2. Identify the smallest safe change.
3. Produce a minimal diff.
4. Wait for approval before applying changes.

Claude should **not redesign working code or explore unrelated areas of the repository**.

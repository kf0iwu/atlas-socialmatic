# Atlas-Socialmatic Project Context

This file provides quick orientation for AI assistants working on the project.

---

# Project Overview

Atlas-Socialmatic is a **Next.js + TypeScript application** that generates social media content using LLMs.

It allows users to generate posts for multiple platforms from a single topic.

Supported platforms:

- LinkedIn
- X (Twitter)
- Instagram
- Threads
- Blog

The system generates **multiple variants per platform**.

---

# Architecture

Key frontend file:

    app/page.tsx

Key backend endpoints:

    app/api/generate/route.ts
    app/api/intel/route.ts
    app/api/suggest-topics/route.ts

LLM integration:

    lib/llm/provider.ts

Rate limiting:

    lib/llm/rateLimit.ts

Draft storage:

    SQLite

---

# Current Development Phase

The project is currently in:

Sprint 5 (pre-v1.0 stabilization)

Remaining Sprint 5 issues include:

- Retry failed LLM requests
- API rate limiting
- prompt quality improvements
- dark mode implementation

---

# Recent Fixes

Recent bugs resolved:

- LLM returning extra platforms
- frontend ignoring platform selection on first generate

---

# Development Workflow

The repository follows the workflow defined in:

_docs/AI_OPERATOR_GUIDE.md

Key principles:

- minimal patches
- GitHub issue driven
- PowerShell compatible commands
- Claude used for controlled edits

---

# Key Constraints

Important rules:

- avoid large refactors during Sprint 5
- prioritize stability before v1.0
- backend responses must remain stable
- LLM output must be validated

---

# Next Milestones

Near-term goals:

Sprint 5 completion
v1.0 release stabilization
post-v1 improvements to content quality

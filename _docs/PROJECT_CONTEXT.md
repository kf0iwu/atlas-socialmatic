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

    Currently calls OpenAI Responses API (/responses).
    Planned migration to /v1/chat/completions for multi-provider support:
    - OpenAI
    - Anthropic
    - Google Gemini
    - Ollama / LM Studio (local)

Rate limiting:

    lib/llm/rateLimit.ts

Draft storage:

    SQLite

---

# Current Development Phase

The project is currently in:

Post-Sprint 6 / v0.9.0-alpha.0 released (2026-03-17)

Active focus: Multi-provider expansion (Phases 1–4)

- Phase 1: Environment variable schema overhaul (LLM_* vars)
- Phase 2: Migrate provider.ts to /v1/chat/completions
- Phase 3: Validate Anthropic, Gemini, Ollama integration
- Phase 4: Provider selector UI (stretch goal)

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

- avoid large refactors unrelated to multi-provider migration
- prioritize stability before v1.0
- backend responses must remain stable
- LLM output must be validated
- do not introduce authentication, multi-user support, or remote databases in v1

---

# Next Milestones

Near-term goals:

Multi-provider expansion Phases 1–4
v1.0 release stabilization
post-v1 improvements to content quality

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
    app/api/settings/route.ts
    app/api/drafts/route.ts
    app/api/drafts/[id]/route.ts
    app/api/health/db/route.ts

LLM integration:

    lib/llm/provider.ts

    Calls /v1/chat/completions — the industry-standard endpoint supported by
    OpenAI, Anthropic (via proxy), Google Gemini (OpenAI-compat), Ollama,
    LM Studio, and any compatible local server.

    Key exports:
    - callChatCompletions(messages, opts) — sends request with retry logic
    - resolveLlmConfig(fallback?) — resolves LLM_* env vars with OPENAI_* fallbacks
    - friendlyLlmError(status) — maps HTTP status codes to user-facing messages

Rate limiting:

    lib/llm/rateLimit.ts

    Per-IP time-window limiter (10 req/min, max 3 concurrent).
    In-memory only — resets on restart.
    "unknown" bucket shared when IP headers absent (no reverse proxy).

Draft storage:

    SQLite via better-sqlite3 (WAL mode, global singleton)
    DB auto-created at data/atlas.db

Settings storage:

    SQLite singleton row (id=1) in settings table.
    Stores: default_platforms, default_tone, default_audience, default_length_tier,
            llm_provider, llm_base_url, llm_model.

---

# Current Development Phase

v0.9.1-alpha.0 released (2026-03-18)

Post-v0.9.0-alpha work completed:

- Multi-provider expansion: all LLM calls migrated to /v1/chat/completions (#63–#66)
- Security audit: SSRF prevention on llm_base_url, DB error detail scrubbing (#67)
- v1.0 scope finalization: non-essential features deferred to v2.0
- Friendly error handling across all LLM endpoints (#68)
- Repo cleanup: stale files, license headers, CLAUDE.md corrections

Active open issues (non-blocking):

- #52 — rate limiter shared "unknown" bucket (deferred to v2.0; documented in README)
- #38 — screenshots (deferred to pre-v1.0 release prep)
- #33 — future UX improvements backlog

---

# Key Constraints

Important rules:

- avoid large refactors unrelated to the task at hand
- prioritize stability before v1.0
- backend responses must remain stable
- LLM output must be validated and filtered
- do not introduce authentication, multi-user support, or remote databases in v1
- no external pull requests accepted without explicit copyright agreement

---

# Next Milestones

Near-term:

- v1.0 documentation pass (DEPLOYMENT.md, CONFIGURATION.md, USER_GUIDE.md, TROUBLESHOOTING.md)
- Pre-v1.0 manual multi-provider validation (Ollama, Gemini, Anthropic)
- Screenshots for README (#38)
- v1.0.0 tag

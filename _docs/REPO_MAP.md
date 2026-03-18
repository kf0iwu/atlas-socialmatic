# Repository Map (Atlas-Socialmatic)

This document provides a quick map of the repository so AI assistants can locate relevant code quickly without scanning the entire project.

Assistants should consult this file before exploring the repository.

---

# Project Structure Overview

High-level structure:

    app/
    lib/
    _docs/
    public/

---

# Frontend

Primary frontend logic lives in:

    app/page.tsx

Responsibilities:

- main UI
- platform selection
- topic / audience / tone inputs
- post generation triggers
- result rendering
- draft loading / saving
- provider configuration panel

Key frontend functions:

    callGenerate()
    generateAllSelected()
    regenerateOne()
    saveProviderSettings()

---

# API Routes

Backend logic is implemented using Next.js route handlers.

### Generate Endpoint

    app/api/generate/route.ts

Responsibilities:

- receives generation request
- normalizes requested platforms
- builds LLM prompt
- calls /v1/chat/completions via callChatCompletions()
- parses returned JSON, strips code fences
- filters output to requested platforms only
- returns posts

---

### Intel Endpoint

    app/api/intel/route.ts

Responsibilities:

- generate LinkedIn hooks
- generate hashtag packs (Broad / Niche / Long-tail)
- merge metadata into drafts
- uses prompt-embedded JSON structure hint (provider-agnostic)

---

### Topic Suggestions

    app/api/suggest-topics/route.ts

Responsibilities:

- generate topic ideas for content creation

---

### Settings

    app/api/settings/route.ts

Responsibilities:

- GET: return current settings row + env override flags
- PUT: validate and persist provider config (llm_provider, llm_base_url, llm_model)
  and default settings (platforms, tone, audience, length tier)
- llm_base_url validated for http/https scheme (SSRF prevention)

---

### Drafts

    app/api/drafts/route.ts          — list / create
    app/api/drafts/[id]/route.ts     — GET / PUT (optimistic locking) / DELETE

---

### Health

    app/api/health/db/route.ts       — DB connectivity check

---

# LLM Integration

Core LLM wrapper:

    lib/llm/provider.ts

Responsibilities:

- callChatCompletions(messages, opts) — POST to /v1/chat/completions with retry
- resolveLlmConfig(fallback?) — resolves LLM_* env vars, OPENAI_* fallbacks, DB fallback
- friendlyLlmError(status) — maps HTTP status to user-facing error message
- Retry logic: max 3 attempts, exponential backoff, respects Retry-After header
- Transient statuses: 429, >=500

---

# Rate Limiting

Request guard:

    lib/llm/rateLimit.ts

Responsibilities:

- per-IP time-window limiter (10 req/min window, max 3 concurrent)
- RateLimitError class with code: "RATE_LIMIT" | "SERVER_BUSY"
- acquireOrThrow(req) — checks concurrency then per-IP quota
- isRateLimitError(error) — type guard used in all route catch blocks
- In-memory only; resets on restart
- Falls back to "unknown" bucket when IP headers absent (documented limitation)

---

# Draft Persistence

Draft storage:

    SQLite via better-sqlite3 (WAL mode)
    DB singleton: lib/db.ts (global.__atlasDb survives hot reloads)
    DB path: data/atlas.db (auto-created, gitignored)

Relevant API routes:

    app/api/drafts/
    app/api/drafts/[id]/

Optimistic locking on PUT via if_match_updated_at (returns 409 on mismatch).

---

# Documentation

Repository documentation lives in:

    _docs/

Key files:

    DECISIONS.md        — architectural decisions (read before structural changes)
    ACCEPTANCE_CRITERIA.md — v1.0 completion checklist
    ROADMAP.md          — version scope definitions
    SPRINTS.md          — sprint history and release notes
    PROJECT_CONTEXT.md  — AI assistant orientation
    REPO_MAP.md         — this file

---

# AI Collaboration Rules

AI collaboration workflow lives in:

    _docs/AI_OPERATOR_GUIDE.md

---

# Development Phase

Current stage:

    v0.9.1-alpha.0 (2026-03-18)

Focus areas for v1.0:

- documentation (DEPLOYMENT.md, CONFIGURATION.md, USER_GUIDE.md, TROUBLESHOOTING.md)
- manual multi-provider validation
- screenshots

---

# When Investigating Bugs

Generation bugs:

    app/page.tsx
    app/api/generate/route.ts

LLM response / provider issues:

    lib/llm/provider.ts

Rate limit problems:

    lib/llm/rateLimit.ts

Draft persistence issues:

    app/api/drafts/
    lib/db.ts

Settings / provider config issues:

    app/api/settings/route.ts
    lib/db.ts

---

# Important Constraints

Assistants should:

- make minimal changes
- avoid large refactors
- preserve API response shapes
- maintain frontend/backend compatibility
- read DECISIONS.md before architectural changes

---

# Design Goal

Atlas-Socialmatic should remain:

- simple
- predictable
- easy to debug
- easy to extend

Architecture should remain **clear and minimal**.

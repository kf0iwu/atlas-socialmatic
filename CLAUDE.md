# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Atlas-Socialmatic is a self-hosted, open-source AI-assisted content generator for producing platform-optimized social media posts and blog drafts. It uses a BYO API key model and targets OpenAI and OpenAI-compatible endpoints configured via environment variables.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No automated test suite exists yet (deferred to v2+).

## Editing Rules

When modifying code:

- Make the smallest change possible
- Do not refactor large areas unless explicitly requested
- Never rewrite `app/page.tsx` unless the task specifically requires it
- Avoid introducing new dependencies
- Prefer patch-style edits over rewrites
- Always explain the proposed change before applying it

## Architectural Invariants

These design decisions should not be changed without explicit instruction:

- The project is intentionally single-file frontend (`app/page.tsx`)
- SQLite is the only database for v1
- JSON columns in `drafts` are intentional
- Missing keys in `outputs` represent not-yet-generated content
- Settings table uses a singleton row (`id=1`)
- Drafts store resolved generation inputs to prevent historical drift

## Environment Setup

Copy `.env.example` to `.env.local` and set:
- `LLM_API_KEY` — required (also accepts `OPENAI_API_KEY` as fallback)
- `LLM_BASE_URL` — optional, defaults to `https://api.openai.com/v1`
- `LLM_MODEL` — optional, defaults to `gpt-4.1-mini`

The SQLite database is auto-created at `data/atlas.db` on first run (gitignored).

## Architecture

**Next.js App Router** with TypeScript. All source lives in two directories:

- [app/](app/) — API routes and the main React SPA
- [lib/db.ts](lib/db.ts) — SQLite singleton initialization and schema

### Main SPA

[app/page.tsx](app/page.tsx) (~1050 lines) is the entire frontend. It is structured in sections:
1. Types & constants
2. Small UI helpers (`CopyButton`, `LengthSelect`, `PlatformCard`)
3. Main component with all state and handlers

State management uses only React hooks (`useState`, `useEffect`, `useMemo`) — no external state library.

### API Routes

All routes use Next.js App Router conventions with `export const runtime = "nodejs"` for DB access.

| Route | Purpose |
|---|---|
| `POST /api/generate` | Multi-platform post generation via OpenAI |
| `POST /api/suggest-topics` | LLM-powered topic suggestions |
| `POST /api/intel` | LinkedIn hooks + hashtag packs (structured outputs) |
| `GET/POST /api/drafts` | List / create drafts |
| `GET/PUT/DELETE /api/drafts/[id]` | Single draft CRUD with optimistic locking |
| `GET/PUT /api/settings` | Read/write persistent settings (defaults + provider config) |
| `GET /api/health/db` | DB connectivity check |

### Database

SQLite via `better-sqlite3`. Schema:

- **drafts** — UUID v4 PK, timestamps as Unix milliseconds, JSON columns for `platforms`, `outputs`, `hooks`, `hashtag_packs`, `meta`. Missing key in `outputs` means not-yet-generated (intentional design).
- **settings** — Singleton row (`id=1`), stores default platforms/tone/audience/length tier.

WAL mode is enabled. The DB module uses a global singleton (`global.__atlasDb`) to survive Next.js hot reloads.

**Optimistic locking**: `PUT /api/drafts/[id]` requires `if_match_updated_at` in the request body and returns 409 on mismatch to prevent lost updates.

### Intelligence Features (`/api/intel`)

Uses `/v1/chat/completions` with a prompt-embedded JSON structure hint (provider-agnostic). The schema is dynamically built based on which features are requested (`generate_hooks`, `generate_hashtags`). Hooks and hashtag packs can be regenerated independently.

## Key Decisions

- **JSON columns** for `outputs`, `hooks`, `hashtag_packs` — avoids normalization; SQL-level querying into these deferred to v2+
- **Drafts snapshot resolved inputs** — topic/audience/tone/platforms saved at generation time to prevent history drift if defaults change later
- **`default_platforms` initialized to `[]`** — DB stores state, not behavior; UI owns first-run defaults
- **Dark mode** — class-based (`.dark` on `documentElement`), toggled via localStorage; re-added in Sprint 6
- **Sole authorship** — no external PRs accepted without explicit copyright agreement (dual licensing planned for v2+)

## Documentation

Design decisions, sprint plans, acceptance criteria, and roadmap are in [_docs/](_docs/). Consult [_docs/DECISIONS.md](_docs/DECISIONS.md) before making architectural changes.

## Important Files

app/page.tsx
Main React SPA and UI state management

app/api/generate/route.ts
Main post generation endpoint

app/api/intel/route.ts
Hooks and hashtag intelligence endpoint

app/api/drafts/route.ts
Draft listing and creation

app/api/drafts/[id]/route.ts
Single draft CRUD and optimistic locking

lib/db.ts
SQLite initialization and schema

## Preferred Workflow

When making changes:

1. Analyze the existing code
2. Explain the change
3. Show a proposed diff
4. Apply the patch only after confirmation

## Scope

Version 1 focuses on:

- AI-assisted generation
- Draft persistence
- Hooks and hashtag intelligence
- BYO API keys

Do not introduce:

- Authentication
- Multi-user support
- Remote databases
- Plugin systems
- Background job queues

## Coding Style

- Use TypeScript types where possible
- Avoid unnecessary abstraction
- Prefer simple functions over classes
- Keep API handlers concise
- Avoid premature optimization

## Security Rules

Claude must never read or display the following files:

- `.env.local`
- `.env`
- any file containing API keys or secrets

If environment variables are needed for analysis, assume they exist and do not open the file.

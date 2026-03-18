# PROJECT NOTES -- Atlas-Socialmatic

## Overview

Atlas-Socialmatic is a self-hosted, open-source-friendly AI-assisted
content generator designed to produce platform-optimized social media
posts and blog drafts.

## Core Goals

-   Self-hosted / Docker-friendly
-   Bring-your-own API key
-   Privacy-respecting
-   Platform-aware content generation
-   Credit-efficient AI usage
-   Multi-provider LLM support

## Current Implemented Features

-   Platform selection (LinkedIn, X, Instagram, Threads, Blog)
-   Per-platform length controls
-   Structured JSON responses
-   Regenerate per platform
-   Topic suggestion engine (`/api/suggest-topics`)
-   Intelligence endpoint (`/api/intel`)
-   LinkedIn hook generation (Sprint 3)
-   Hashtag strategy packs (Sprint 3)
-   SQLite-backed persistent draft history (Sprint 4)
-   Persistent default settings: platforms / tone / audience / length tier (Sprint 4)
-   Shared per-IP rate-limit guard across all LLM endpoints (Sprint 5 / Issue #26)
-   Transient LLM retry with Retry-After support, max 3 attempts (Sprint 5 / Issue #27)
-   Prompt quality and structural variant diversity improvements (Sprint 5 / Issue #25)
-   Dark mode with class-based theme toggle and localStorage persistence (Sprint 6 / Issue #15, #39)
-   Light mode color palette: neutral slate-based colors throughout (Sprint 6 / Issues #40, #41)
-   Generation progress indicator (Sprint 6 / Issue #31)
-   Auto-scroll to generated posts after generation (Sprint 6 / Issue #32)
-   Multi-provider LLM support via /v1/chat/completions (#63–#66)
-   Provider selector UI in settings panel with preset table (#66)
-   Provider config persistence via /api/settings (llm_provider, llm_base_url, llm_model) (#66)
-   Friendly error handling across all LLM endpoints — no raw provider details leaked (#68)
-   AGPLv3 license headers on all source files

## Architecture

-   Next.js 16 (App Router), React 19, TypeScript
-   API routes:
    -   `/api/generate` → Posts only
    -   `/api/suggest-topics` → Topic ideas
    -   `/api/intel` → Hooks + hashtags (optional)
    -   `/api/settings` → Persistent settings + provider config
    -   `/api/drafts` → Draft list / create
    -   `/api/drafts/[id]` → Draft CRUD with optimistic locking
    -   `/api/health/db` → DB connectivity check
-   LLM provider: `lib/llm/provider.ts` — `/v1/chat/completions`, retry logic, friendly error mapping
-   Rate limiter: `lib/llm/rateLimit.ts` — per-IP time-window, in-memory
-   SQLite persistence layer (better-sqlite3, WAL mode, global singleton)
-   Env-based configuration: `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL` (with `OPENAI_*` fallbacks)

## Design Philosophy

-   Avoid SaaS lock-in
-   Let users control API costs
-   Modular intelligence layer
-   Clean separation of concerns
-   Provider-agnostic LLM interface

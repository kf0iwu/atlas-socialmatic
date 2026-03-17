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

## Current Implemented Features

-   Platform selection (LinkedIn, X, Instagram, Threads, Blog)
-   Per-platform length controls
-   Structured JSON responses
-   Regenerate per platform
-   Topic suggestion engine (`/api/suggest-topics`)
-   Intelligence endpoint (`/api/intel`)
-   LinkedIn hook generation (Sprint 3)
-   Hashtag strategy packs (Sprint 3)
- 	Local history (localStorage) — Sprint 2
- 	SQLite-backed persistent draft history (Sprint 4)
- 	Shared per-IP rate-limit guard across all LLM endpoints (Sprint 5 / Issue #26)
- 	Transient LLM retry with Retry-After support, max 3 attempts (Sprint 5 / Issue #27)
- 	Prompt quality and structural variant diversity improvements (Sprint 5 / Issue #25)
- 	Dark mode with class-based theme (Sprint 6 / Issue #15)
- 	Manual light/dark theme toggle with OS preference detection and localStorage persistence (Sprint 6 / Issue #39)
- 	Light mode color palette: neutral slate-based colors throughout (Sprint 6 / Issues #40, #41)
- 	Generation progress indicator (Sprint 6 / Issue #31)
- 	Auto-scroll to generated posts after generation (Sprint 6 / Issue #32)
- 	README.md (Sprint 6 / Issue #34)

## Architecture

-   Next.js (App Router)
-   API routes:
    -   `/api/generate` → Posts only
    -   `/api/suggest-topics` → Topic ideas
    -   `/api/intel` → Hooks + hashtags (optional)
-   Env-based configuration
- 	SQLite persistence layer (Sprint 4)

## Design Philosophy

-   Avoid SaaS lock-in
-   Let users control API costs
-   Modular intelligence layer
-   Clean separation of concerns

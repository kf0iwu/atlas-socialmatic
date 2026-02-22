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
-   LinkedIn hook generation (planned Sprint 3)
-   Hashtag strategy packs (planned Sprint 3)
-   Local history (localStorage)

## Architecture

-   Next.js (App Router)
-   API routes:
    -   `/api/generate` → Posts only
    -   `/api/suggest-topics` → Topic ideas
    -   `/api/intel` → Hooks + hashtags (optional)
-   Env-based configuration

## Design Philosophy

-   Avoid SaaS lock-in
-   Let users control API costs
-   Modular intelligence layer
-   Clean separation of concerns

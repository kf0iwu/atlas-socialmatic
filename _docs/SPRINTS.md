# SPRINTS -- Atlas-Socialmatic

## Sprint 1 -- Foundation

-   Initial Next.js setup
-   Basic post generation
-   Platform-specific outputs

## Sprint 2 -- Control & Workflow

-   Platform selection UI
-   Per-platform length tiers
-   Regenerate buttons
-   Blog generation
-   Local history
-   Topic suggestions

## Sprint 3 – Platform Intelligence (Complete)

Status: Feature Complete

Objective:
Add strategic intelligence features to enhance post generation, including hooks, hashtag packs, and improved regeneration controls while maintaining credit efficiency.

Completed:

### Hooks
- LinkedIn-optimized opening hooks (5+ per request)
- Hooks-only regeneration (credit-safe)
- Independent flag control via /api/intel
- Safe meta merge logic to avoid overwriting existing state

### Hashtag Strategy Packs
- Size tiers: Small / Medium / Large
- Grouped output: Broad / Niche / Long-tail
- Mixed line output (copy-ready)
- Per-platform support (Instagram, LinkedIn)
- Structured JSON schema enforcement

### API Improvements
- Strict JSON schema output via Responses API
- Platform-aware hashtag packs
- Credit-efficient selective generation (hooks-only / hashtags-only)
- Fallback mixed_line safety generation

### UI Improvements
- Mixed line displayed separately
- Copy button uses mixed line
- Regenerate buttons disabled appropriately when feature toggles are off
- Improved state merging safety

### Repo Hygiene
- Commit-based patch workflow documented
- _patches/ ignored
- _docs/ tracked
- Clean branch + validated patch application

Notes:
Sprint 3 considered feature complete. Remaining polish items may be addressed in a future sprint.

### Objectives

-   LinkedIn hook suggestions (5+ hooks)
-   Regenerate hooks independently
-   Hashtag strategy packs
-   Hashtag volume selector (Small / Medium / Large)
-   Audience-aware hashtags
-   Separate intelligence endpoint
-   Minimize API credit usage

### Planned Deliverables

-   `/api/intel` improvements
-   UI panels for:
    -   Hooks
    -   Hashtag packs
-   Hooks-only regeneration
-   Hashtag-only regeneration
-   Clean API response structure

## Future Sprint Candidates

-   Split busy states (hooksBusy / hashtagsBusy)
-   Brand voice profiles
-   Blog enhancements (SEO, outline mode)
-   Export pipelines
-   SQLite persistence
-   Templates / presets

## Sprint 4 — DB Schema (Issue #2)

- Designed v1 schema for SQLite persistence:
  - Drafts: UUID PK, unix-ms timestamps, snapshotted inputs, JSON per-platform outputs/hooks/hashtags, minimal meta w/ schema_version
  - Settings: single-row defaults (platforms/tone/audience/length tier)
- Key v1 principle: **history is stable** (loading a draft restores exact state; defaults only apply to new drafts)
- Deferred for post-1.0: A/B variants, structured blog sections

## Sprint 4 — Persistence, UX Stability, and Provider Flexibility (Complete)

Status: Feature Complete

Objective:
Stabilize the application around persistent drafts, improve UI reliability, and introduce provider flexibility for OpenAI-compatible endpoints.

Completed:

### Draft Persistence
- SQLite persistence layer for drafts
- Draft history view (chronological)
- Draft load / delete workflow
- Overwrite confirmation safeguards
- Draft restore with full intelligence state

### UX Improvements
- Split busy states for generation vs intelligence
- Toast notification system for key events
- Platform-aware character counts
- Improved regenerate controls and loading states

### Intelligence Stability
- Correct restore of hooks and hashtag packs
- Intel state persistence (hook count, toggles, platform targets)
- Safe meta merging for partial intelligence responses

### Infrastructure
- Environment variable wiring for provider configuration
- `OPENAI_BASE_URL` support for OpenAI-compatible endpoints
- Provider helper abstraction (`callResponsesApi`)
- Consistent default model behavior across routes

### Repo Hygiene
- Security guardrails for `.env.local`
- Updated Claude usage rules
- Branch cleanup and consistent commit workflow

Notes:
Sprint 4 completes the core architecture for the Atlas-Socialmatic MVP. The system now supports persistent drafts, intelligence add-ons, and provider-flexible LLM generation.

## Sprint 5 — Quality and Reliability

Status: Feature Complete

Objective:
Improve generated content quality and strengthen system reliability while polishing the UI.

Completed:

### Content Quality
- LinkedIn post formatting and structure improvements
- Prompt quality and variant diversity improvements (Issue #25): explicit per-variant structural guidance added for X, Instagram, and Threads; global variant diversity section strengthened

### Reliability
- Shared per-IP time-window rate-limit guard across all LLM endpoints (Issue #26)
- Transient LLM retry with Retry-After header support, max 3 attempts (Issue #27)
- Backend filters LLM output to requested platforms only in `/api/generate`; prevents extra model-returned keys from rendering unintended content (Issue #28)

## Sprint 6 — UI/UX Polish

Status: Feature Complete

Objective:
UI/UX polish pass and release preparation for v0.9.0-alpha.

### Completed

- Issue #29 — Resolved TypeScript build failure (route.ts type annotation) and pre-existing lint violations
- Issue #15 — Dark mode: full component styling with Tailwind `dark:` variants, class-based toggle via `@variant dark`
- Issue #31 — Generation progress indicator added to generate button
- Issue #32 — Auto-scroll to generated posts after generation completes
- Issue #34 — README.md created for v0.9.0-alpha release
- Issue #35 — (closed as duplicate; Docker tracked under #36)
- Issue #39 — Manual light/dark theme toggle with OS preference detection and localStorage persistence
- Issue #40 — UI color consistency: intelligence add-on rows now reflect checked/unchecked state via conditional background
- Issue #41 — Light mode text palette fix: `text-slate-900` baseline on `<main>` ensures reliable Tailwind color inheritance
- Issue #36 — Docker support: multi-stage Dockerfile (Alpine), docker-compose.yml with SQLite volume mount, .dockerignore
- Issue #42 — README updated with Docker quickstart, Unraid deployment guide, and common commands

### Remaining

- Issue #37 — Prepare and tag v0.9.0-alpha release (in progress)
- Issue #38 — Screenshots — deferred to pre-release prep ahead of v1.0; not required for alpha tag

### Notes

- Sprint 6 is the final sprint before the v0.9.0-alpha tag
- Dark mode uses class-based approach: `.dark` on `document.documentElement`, toggled in JS, persisted in localStorage
- Light mode palette uses `bg-slate-700` primary button, `border-slate-200/300` throughout (not pure black/white)
- Issue #15 (dark mode) was moved from Sprint 5 into Sprint 6

### Pre-release Investigation — TypeScript and lint failures (Issue #29) — Resolved

- **Resolved in Sprint 6.**
- These were **pre-existing issues** not introduced by Sprint 5 changes (confirmed during Sprint 5 #26/#27 verification pass).

#### TypeScript build failure
- File: `app/api/health/db/route.ts` line 10
- Cause: `row?.ok` property access on the untyped return of `better-sqlite3`'s `.get()`, which TypeScript infers as `{}`. The `ok` property does not exist on that type.
- `npm run build` fails at the `tsc` type-check phase. Turbopack compilation itself passes (`✓ Compiled successfully`).

#### Lint failures
- 29 `@typescript-eslint/no-explicit-any` errors spread across `app/api/generate/route.ts`, `app/api/intel/route.ts`, `app/api/suggest-topics/route.ts`, `app/api/drafts/route.ts`, `app/api/drafts/[id]/route.ts`, and `app/page.tsx`.
- 1 `@typescript-eslint/no-unused-vars` warning in `app/page.tsx` (`loadFromHistory`).
- `npm run lint` exits with code 1. No new violations were introduced by Sprint 5.

---

## v0.9.0-alpha — Release Summary (2026-03-17)

v0.9.0-alpha is the first public alpha of Atlas-Socialmatic, completing Sprints 1–6.

### Included

- Multi-platform content generation (LinkedIn, X, Instagram, Threads, Blog)
- Platform-aware formatting with per-platform character counters
- Per-platform regeneration
- LinkedIn intelligence: hooks (5+) and hashtag strategy packs (Broad / Niche / Long-tail)
- Independent hook and hashtag regeneration
- Topic suggestion engine
- SQLite-backed draft persistence with history, edit, and delete
- Persistent default settings (platforms, tone, audience, length tier)
- Light / Dark theme with manual toggle and localStorage persistence
- Per-IP rate limiting and LLM retry with Retry-After support
- Docker support (Dockerfile + docker-compose.yml) with persistent SQLite volume mount
- Unraid deployment guide in README

### Known Limitations

- No brand voice or template presets (planned for v1.0)
- No Markdown / JSON export (planned for v1.0)
- No per-platform busy state — single shared busy flag (planned for v1.0)
- No collapsible panels (planned for v1.0)
- No bulk history deletion UI (planned for v2.0)
- Screenshots not yet captured — deferred to pre-release prep (Issue #38)
- Known lint violations present (`no-explicit-any`) — non-blocking for alpha

### Intended Audience

Early testers comfortable with self-hosted Docker deployments and BYO API keys.

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

Objective:
Improve generated content quality and strengthen system reliability while polishing the UI.

Planned:

### Content Quality
- Improve LinkedIn post formatting and structure
- Strengthen prompt tuning for stronger hooks and variant diversity

### UX
- Dark mode theme

### Reliability
- API rate-limit guard
- Retry logic for failed LLM calls

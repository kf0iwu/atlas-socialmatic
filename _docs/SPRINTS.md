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

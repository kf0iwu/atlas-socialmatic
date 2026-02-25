# Atlas-Socialmatic — DB Schema v1 (SQLite)
Sprint 4 / Issue #2

This document describes the v1 database schema for Atlas-Socialmatic, including the intent of each field and what is stored vs derived.

## Goals
- Keep v1 simple (single-state drafts; no snapshots/versions)
- Enable persistence + history view + draft load/edit/delete
- Avoid premature normalization
- Preserve user work product and minimal debug context
- Support safe evolution of JSON shapes over time

---

# Table: `drafts`

One row represents a single saved draft state.

## Columns

### Identity
- `id` (TEXT, PRIMARY KEY)
  - UUID v4 string.
  - Chosen for uniqueness, non-guessability, and future-friendly export/import.

### Timestamps
- `created_at` (INTEGER, NOT NULL)
- `updated_at` (INTEGER, NOT NULL)
  - Unix milliseconds representing UTC instants.
  - Convert to local time at display/render time.
  - Used for history sorting and overwrite confirmation.

An index exists on `updated_at` for efficient history queries:
- `idx_drafts_updated_at`

### Snapshotted inputs (resolved values)
These are stored to ensure History is stable. Even if values originated from Settings defaults, the resolved values are persisted into the draft on save.

- `topic` (TEXT, NOT NULL)
- `audience` (TEXT, NULL)
- `tone` (TEXT, NULL)
- `length_tier` (TEXT, NULL)
- `platforms` (TEXT, NOT NULL)
  - JSON array of platform IDs, e.g. `["linkedin","x"]`.

**Rule:** Loading a draft uses these stored values. Settings defaults do not overwrite historical drafts.

### Generated outputs
All generated artifacts are stored as JSON keyed by platform ID. Keys are omitted for platforms that have not been generated.

- `outputs` (TEXT, NULL)
  - JSON: `{ [platformId]: { text: string, format: "plain"|"markdown" } }`
  - Formatting is preserved inside `text` (e.g., markdown markers). `format` indicates how to render.

Example:
```json
{
  "linkedin": { "text": "Hello **world**", "format": "markdown" },
  "x": { "text": "Hello world", "format": "plain" }
}
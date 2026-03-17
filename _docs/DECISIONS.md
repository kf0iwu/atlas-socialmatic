# DECISIONS -- Atlas-Socialmatic

## Confirmed Decisions

- Tool remains domain-agnostic
- Open-source-first mindset
- BYO API key model (v1)
- Self-hosted compatibility prioritized
- Separate endpoints for:
  - Content generation
  - Intelligence features
- Provider configuration via environment variables (v1)
- Support for:
  - OpenAI
  - OpenAI-compatible local endpoints
- All container configuration via environment variables
  - No required file editing inside container
- Single draft state (no version snapshots in v1)
- Docker-first deployment focus
  - Tested on Unraid
  - Tested on Ubuntu/Debian
- Non-intrusive donation support in v1
  - Footer link in UI
  - GitHub Sponsors
  - Optional external donation platform (e.g., Ko-fi)
- Sprint 5 rate limiting uses a shared per-IP time-window limiter across all LLM endpoints (v1 simplicity and safety)
- Existing concurrency guard remains in place alongside the time-window limiter

---

## Sprint 3 Decisions Made

- Minimum 5 LinkedIn hooks
- Hooks regenerable independently
- Hashtag packs grouped by:
  - Broad
  - Niche
  - Long-tail
- Hashtag volume uses tiers (Small / Medium / Large)
- Avoid fixed hashtag counts
- Intelligence features optional (credit efficiency)

---

## Deferred / Tabled (v2+)

- Split intelBusy state (if not fully resolved in v1 polish)
- Per-endpoint rate limit tuning (e.g. different limits for generate / intel / suggest-topics)
- X thread mode
- Blog outline / section expansion mode
- Draft version snapshots
- History search/filtering
- SEO scoring engine
- CTA suggestion engine
- CSV export
- WordPress / platform API integrations
- TikTok / short-form video support
- UI-based provider configuration
- Advanced provider plugin system

### Deferred UX (v2+)
- History bulk-deletion UX (checkboxes, "delete selected", "delete all")
- Improved error banner UX (persistent, dismissible, contextual — replacing the current inline text)
- Per-platform regenerate progress feedback (independent busy state per platform card)
- Platform icons in the UI (branded icons alongside platform name labels)

---

## Licensing (Planned for v1)

Target license: AGPLv3

Rationale:
- Preserve open-source transparency
- Prevent closed-source SaaS forks
- Require public release of modifications if used as network service
- Align with open-core philosophy

(Final license selection to be confirmed before v1.0 tag.)

---

## Decisions Pending (Future)

- Persistence model expansion beyond SQLite
- Hosted service layer (v3)
- Billing model
- Multi-user authentication
- Analytics / engagement scoring
- Advanced UX standards alignment

## Donations (v1)

- Use GitHub Sponsors
- Use Ko-fi for one-time donations
- Non-intrusive “Support Atlas” link in UI footer
- Donation links only point externally
- No embedded payment logic in app
- No storage of payment data
- Hosted billing (v3) must avoid handling sensitive payment data directly

---

## Licensing Strategy

Primary License (v1): AGPLv3

Rationale:
- Preserve open-source transparency
- Prevent closed-source SaaS forks
- Require public release of modifications if used as network service
- Align with self-hosted philosophy

Future Consideration:
- Dual licensing model
  - AGPL for community use
  - Commercial license for closed-source or enterprise deployments
- Sole authorship retained to preserve relicensing flexibility

---

## Legal / Contribution Strategy

- Sole authorship maintained for v1.x lifecycle
- No external pull requests accepted without explicit copyright agreement
- Dual licensing may be introduced in future versions:
  - AGPL for community use
  - Commercial license for closed-source or enterprise deployments
- License may be reconsidered prior to accepting external contributors

## Decision: Draft + Settings schema approach (Sprint 4 / Issue #2)

### Context
Atlas-Socialmatic v1 is self-hosted, single-user, SQLite-backed, and should remain simple and extensible. Sprint 4 requires persistence, history UI, and CRUD without overengineering.

### Decision
1) **Drafts are single-state rows** (no snapshots/versions in v1).
2) **Draft IDs use UUID v4 (TEXT PK)**:
   - Avoids predictable IDs, reduces future friction for export/import, and prevents collisions if DBs are ever merged.
3) **Timestamps are INTEGER unix milliseconds**:
   - Stored as UTC instants; safe across DST/timezone changes; convert at display time.
4) **Drafts snapshot resolved inputs** (`topic/audience/tone/length_tier/platforms`) on save:
   - Prevents “history drift” when Settings defaults change later.
   - Guarantees that loading a draft restores UI state and generation context reliably.
5) **Generated artifacts are stored as JSON blobs keyed by platform ID**:
   - `outputs` stores `{ text, format }` per platform.
   - `hooks` and `hashtag_packs` stored per platform similarly.
   - Missing key = not generated yet (supports partial generation without ambiguity).
   - Avoids normalization in v1 because we do not need SQL-level querying into these structures yet.
6) **Meta is a minimal JSON snapshot with `schema_version`**:
   - Supports backward-compatible parsing as JSON shapes evolve (without guessing).
   - Stores only what helps debugging/repro context (provider/model/toggles), not secrets or heavy telemetry.

### Out of scope / explicitly not stored (v1)
- API keys or any secrets
- Raw prompts / templates
- Full provider responses/logs, token/cost telemetry
- Derived UI metrics (character counts) and transient UI state (busy flags)

### Tradeoffs
- JSON columns reduce schema churn and keep v1 simple, at the cost of deeper SQL querying capability (acceptable for v1).
- Nullable DB columns for some inputs are allowed for migration flexibility, but app behavior snapshots resolved values to maintain stable history.

### Deferred (post-1.0)
- Multiple per-platform variants (A/B)
- Structured blog sections (title/body/CTA) instead of only platform text blobs
- Proper dark mode theming (tracked separately)

## Decision: Settings default_platforms initialization (Sprint 4)

### Context
The Settings table stores default values for new drafts. We considered whether to initialize default_platforms with a predefined starter set (e.g., ["linkedin","x"]) at DB bootstrap.

### Decision
Initialize default_platforms to an empty array ([]) at database creation.

The UI remains responsible for determining first-run default platform selections.

### Rationale
- Avoid hard-coding product opinion into the persistence layer.
- Keep DB focused on state, not behavior.
- Allow future changes to default platform behavior without requiring schema migrations.
- Preserve flexibility for v2+ where default behavior may become more structured or feature-driven.

### Future Consideration
If default behavior becomes more product-defined (e.g., workflow presets, feature flags, opinionated starter templates), reconsider moving default definitions into DB bootstrap logic in a future major version (v2.0+).

## Deferred (v2): History layout refinement
- In v1, keep History as a simple right-side panel for speed and minimal UI churn.
- Consider a cleaner v2 layout (tabs/menu/section) once Draft load/edit/delete UX stabilizes.

## 2026-03-16 — Backend must not trust LLM output schema

The generate API previously returned the LLM JSON output directly.

Because LLMs sometimes ignore schema instructions and return extra keys,
the backend now filters the parsed output so only the requested platforms
are returned to the client.

Implementation:
- After parsing the LLM JSON response, the server filters keys to the
  normalized `platforms` list from the request.
- Any unexpected keys returned by the model are discarded.

Reason:
LLM outputs are non-deterministic and cannot be trusted to obey strict
JSON schema instructions. The backend must enforce the requested contract.


## 2026-03-16 — Length constraints require structural guidance

LLMs do not reliably obey character limits alone because they do not track
character counts during generation.

Length tiers must include structural hints such as:
- approximate word ranges
- paragraph counts
- sentence counts
- structural templates

These constraints significantly improve adherence to target content lengths.

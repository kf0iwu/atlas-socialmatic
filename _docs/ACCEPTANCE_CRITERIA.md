# v1.0 Acceptance Criteria

v1.0 is complete when all of the following conditions are met.

---

## v0.9.1-alpha Status (as of 2026-03-18)

The table below tracks which v1.0 criteria are complete in the current alpha
versus still required before v1.0 is tagged.

| Area | v0.9.1-alpha | Remaining for v1.0 |
|---|---|---|
| Core engine stability | Complete | — |
| Friendly error handling (invalid key / rate limit / timeout / network) | Complete | — |
| Provider support — OpenAI | Complete | — |
| Provider support — Multi-provider (`/v1/chat/completions`) | Complete | — |
| Provider selector UI + settings persistence | Complete | — |
| Persistence (SQLite, drafts, settings) | Complete | — |
| Character counters | Complete | — |
| Hooks + hashtag intelligence | Complete | — |
| Topic suggestion | Complete | — |
| Dark / light theme toggle | Complete | — |
| Rate limiting + retry | Complete | — |
| Copy-all | Complete | — |
| Overwrite confirmation | Complete | — |
| Toast notifications | Complete | — |
| Brand voice presets | Not started | Deferred to v2.0 |
| Template presets | Not started | Deferred to v2.0 |
| Markdown / JSON export (file download) | Not started | Deferred to v2.0 |
| Split busy states (per-platform) | Not started | Deferred to v2.0 |
| Collapsible panels | Not started | Deferred to v2.0 |
| Docker (Dockerfile + Compose) | Complete | — |
| README | Complete | — |
| DEPLOYMENT.md | Not started | Required for v1.0 |
| CONFIGURATION.md | Not started | Required for v1.0 |
| USER_GUIDE.md | Not started | Required for v1.0 |
| TROUBLESHOOTING.md | Not started | Required for v1.0 |
| LICENSE file | Complete | — |
| v1.0.0 version tag | Not started | Required for v1.0 |

---

## Core Engine Stability

- Post generation works reliably across supported platforms
- Hooks regenerate independently without affecting posts
- Hashtags regenerate independently without affecting posts
- Character counter displays correctly per platform
- No unstable JSON parsing or malformed responses
- Friendly error messages for:
  - Invalid API key
  - Rate limits
  - Network failures
  - Timeout events

---

## Provider Support

- OpenAI provider works (`/v1/chat/completions`)
- OpenAI-compatible local endpoint works (Ollama, LM Studio)
- Anthropic provider works via `/v1/chat/completions`
- Google Gemini works via OpenAI-compatible endpoint
- Provider selection configurable via environment variables only
- No provider configuration required inside container
- `.env.example` documents all `LLM_*` variables

---

## Persistence

- SQLite integrated and functioning
- Drafts auto-save successfully
- Drafts can be edited
- Drafts can be deleted
- History view displays drafts in chronological order
- Persistent default settings work:
  - Default platforms
  - Default tone
  - Default audience
  - Default length tier

---

## Workflow Enhancements

- Copy-all functionality works
- Overwrite confirmation prevents accidental loss
- Blog drafts produce copyable markdown via the Copy button; file download export is a v2.0 goal

---

## UX Quality

- Toast notifications provide clear system feedback
- No obvious UI confusion or broken states

---

## Deployment

- Dockerfile builds successfully
- Docker Compose runs successfully
- All configuration via environment variables
- `.env.example` complete and accurate
- Fresh-machine deployment test passes
- Tested on:
  - Unraid Docker
  - Ubuntu/Debian Docker

---

## Documentation

- README complete and accurate
- DEPLOYMENT.md complete
- CONFIGURATION.md complete
- USER_GUIDE.md complete
- TROUBLESHOOTING.md complete
- Donation section added to README
- License selected and included
- Documentation validated on clean setup

---

## Release

- Repository cleaned
- No debug code
- License file included
- Version tagged as v1.0.0
- Changelog entry created

---

## Multi-Provider Support

**Status: Complete (v0.9.1-alpha.0, issues #63–#66)**

### Phase 1 — Environment variable schema overhaul

- [x] `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL` introduced as primary vars
- [x] `OPENAI_*` retained as backward-compat fallbacks
- [x] `.env.example` updated with all new variables
- [x] `docker-compose.yml` updated to use new variables
- [x] README documents new variable schema and provider support table

### Phase 2 — Migrate provider.ts to /v1/chat/completions

- [x] `callResponsesApi` replaced with `callChatCompletions`
- [x] All three LLM endpoints updated (generate, intel, suggest-topics)
- [x] Response parsing uses `choices[0].message.content`
- [x] No OpenAI-proprietary API calls remain
- [x] Intel endpoint uses prompt-embedded JSON hint (provider-agnostic)

### Phase 3 — Validate multi-provider compatibility

- [x] OpenAI (GPT-4o / GPT-4.1) — confirmed working
- [x] Build passes cleanly; all routes compile and type-check
- [ ] Anthropic (Claude 3.5+) via OpenAI-compatible endpoint — manual test pending
- [ ] Google Gemini via OpenAI-compatible endpoint — manual test pending
- [ ] Ollama (local) — manual test pending
- [ ] LM Studio — manual test pending

### Phase 4 — Provider selector UI

- [x] Provider preset dropdown in Settings panel (OpenAI / Gemini / Ollama / LM Studio / Custom)
- [x] Settings table persists `llm_provider`, `llm_base_url`, `llm_model`
- [x] Env vars remain the override/default mechanism
- [x] `GET/PUT /api/settings` implemented with `llm_base_url` scheme validation (SSRF prevention)

---

## Licensing

- AGPLv3 license included in root of repository
- License clearly referenced in README
- Copyright attributed to David Grilli
- No external code included that conflicts with AGPL
- No external contributors accepted without explicit copyright agreement
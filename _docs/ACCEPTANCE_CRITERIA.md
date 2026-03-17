# v1.0 Acceptance Criteria

v1.0 is complete when all of the following conditions are met.

---

## v0.9.0-alpha Status (as of 2026-03-17)

The table below tracks which v1.0 criteria are complete in the current alpha
versus still required before v1.0 is tagged.

| Area | v0.9.0-alpha | Remaining for v1.0 |
|---|---|---|
| Core engine stability | Complete | Friendly errors for invalid key / rate limit / timeout |
| Provider support | Complete | — |
| Persistence (SQLite, drafts, settings) | Complete | — |
| Character counters | Complete | — |
| Hooks + hashtag intelligence | Complete | — |
| Topic suggestion | Complete | — |
| Dark / light theme toggle | Complete | — |
| Rate limiting + retry | Complete | — |
| Copy-all | Complete | — |
| Overwrite confirmation | Complete | — |
| Toast notifications | Complete | — |
| Brand voice presets | Not started | Required for v1.0 |
| Template presets | Not started | Required for v1.0 |
| Markdown / JSON export | Not started | Required for v1.0 |
| Split busy states (per-platform) | Not started | Required for v1.0 |
| Collapsible panels | Not started | Required for v1.0 |
| Docker (Dockerfile + Compose) | In progress (#36) | Required for v1.0 |
| README | Complete | — |
| DEPLOYMENT.md | Not started | Required for v1.0 |
| CONFIGURATION.md | Not started | Required for v1.0 |
| USER_GUIDE.md | Not started | Required for v1.0 |
| TROUBLESHOOTING.md | Not started | Required for v1.0 |
| LICENSE file | Not started | Required for v1.0 |
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

- OpenAI provider works
- OpenAI-compatible local endpoint works
- Provider selection configurable via environment variables only
- No provider configuration required inside container

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

- Brand voice presets implemented
- Custom voice profiles implemented
- Template presets available
- Custom templates savable
- Markdown export works
- JSON export works
- Copy-all functionality works
- Overwrite confirmation prevents accidental loss

---

## UX Quality

- Busy states split correctly
- Panels are collapsible
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

## Licensing

- AGPLv3 license included in root of repository
- License clearly referenced in README
- Copyright attributed to David Grilli
- No external code included that conflicts with AGPL
- No external contributors accepted without explicit copyright agreement
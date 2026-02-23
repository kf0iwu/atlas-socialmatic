# Atlas-Socialmatic Roadmap

Atlas-Socialmatic exists to reduce the friction of creating necessary
social media and blog content for practical professionals, small
businesses, creators, and builders who would rather focus on their
actual craft.

The roadmap below defines version boundaries clearly to prevent scope
creep and preserve product clarity.

---

# v1.0 — Stable Self-Hosted Content Engine

## Focus

- Practical
- Efficient
- Minimal friction
- Cost-aware
- Self-hosted
- Docker-first
- Clearly documented

v1.0 represents a polished, stable, self-hosted release that delivers
high-quality multi-platform content generation with optional intelligence
features and clean deployment.

---

## Included in v1.0

### Core Generation

- Multi-platform post generation
- Platform-aware formatting
- Regenerate per platform
- Topic suggestion engine
- Character counter per platform (current / limit / remaining)

### Intelligence

- LinkedIn hook generation
- Independent hook regeneration
- Hashtag strategy packs (Broad / Niche / Long-tail)
- Independent hashtag regeneration
- Volume tiers (Small / Medium / Large)

### Persistence

- SQLite integration
- Draft auto-save (single state per draft)
- Draft editing
- Draft deletion
- Simple chronological history view
- Persistent default settings:
  - Default platforms
  - Default tone
  - Default audience
  - Default length tier

### Workflow Enhancements

- Brand voice presets
- Custom voice profiles
- Template presets
- Custom template saving
- Export to Markdown
- Export to JSON
- Copy-all functionality

### UX Quality

- Split busy states (hooksBusy / hashtagsBusy)
- Collapsible UI panels
- Generate missing platforms only
- Overwrite confirmation for full regeneration
- Toast notifications for system feedback
- Friendly error handling:
  - Invalid API key
  - Rate limits
  - Network failure
  - Timeout handling

### Architecture

- Centralized prompt-building modules
  - No prompt logic duplicated across endpoints
  - Consistent injection of tone, audience, template, and voice
- Basic provider abstraction:
  - OpenAI support
  - OpenAI-compatible local endpoint support
- Provider configured via environment variables only (no UI switching in v1)

### Deployment

- Production-ready Dockerfile
- Docker Compose configuration
- All configuration via environment variables
- No required file editing inside container
- `.env.example` provided
- Documentation tested on:
  - Docker on Unraid
  - Docker on Ubuntu/Debian

---

## Explicitly Excluded from v1.0

- Social account linking (OAuth)
- Automatic post scheduling
- Auto-posting to platforms
- Multi-user authentication
- SaaS billing logic
- Engagement analytics ingestion
- Thread mode for X
- Blog outline/section expansion mode
- Search/filtering of draft history
- Versioned draft snapshots
- CSV export
- WordPress or platform-specific API integrations

v1.0 is strictly a polished, self-hosted content engine.

---

# v2.0 — Workflow Acceleration

## Focus

Enhance planning, flexibility, and intelligence while maintaining
self-hosted compatibility.

## Candidate Scope (Subject to v1 Feedback)

- Calendar-based content planner (no auto-posting)
- Series mode (multi-post thematic progression)
- Thread mode for X
- Blog outline mode with selective section expansion
- Provider abstraction expansion (additional providers)
- Public domain image integration
- Optional AI image generation (self-hosted friendly)
- Knowledge context mode (user-defined persistent context)
- Engagement heuristic scoring
- Draft history versioning
- History search/filtering

v2.0 expands capability without introducing SaaS or billing logic.

---

# v3.0 — Hosted Service Layer (Optional)

## Focus

Offer a low-cost hosted convenience option in addition to
self-hosted deployment.

## Candidate Scope

- User authentication
- Usage caps
- Managed API key option
- Optional BYO API key (hosted mode)
- Billing integration
- Hosted infrastructure

Self-hosted version remains available.

The goal of v3.0 is convenience, not feature gating.
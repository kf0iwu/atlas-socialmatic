# Atlas-Socialmatic

**Self-hosted AI content generator for social media posts and blog drafts.**

Atlas-Socialmatic helps practical professionals, small businesses, and builders produce platform-optimized content without friction. Bring your own OpenAI (or compatible) API key — no SaaS, no subscriptions, no lock-in.

---

## Features

- **Multi-platform generation** — LinkedIn, X, Bluesky, and blog posts in a single request
- **Platform-aware formatting** — content shaped for each platform's conventions and character limits
- **Per-platform regeneration** — regenerate one platform without touching others
- **LinkedIn intelligence** — generate engagement hooks and hashtag strategy packs (Broad / Niche / Long-tail) via structured AI outputs
- **Independent intel regeneration** — regenerate hooks or hashtag packs separately
- **Topic suggestion engine** — LLM-powered topic brainstorming from a keyword or brief
- **Draft persistence** — SQLite-backed draft history with auto-save, editing, and deletion
- **Persistent settings** — default platforms, tone, audience, and length tier saved across sessions
- **Light / Dark theme** — manual toggle with OS preference detection and localStorage persistence
- **BYO API key** — uses your own OpenAI or OpenAI-compatible endpoint, configured via environment variables
- **Self-hosted first** — Docker-ready, no external services required beyond your API provider

---

## Screenshots

> Screenshots will be added before the v0.9.0-alpha tag.

| Light Mode | Dark Mode |
|---|---|
| `docs/screenshots/light-mode.png` | `docs/screenshots/dark-mode.png` |

---

## Quick Start (Local Dev)

**Requirements:** Node.js 20+, npm

```bash
git clone https://github.com/kf0iwu/atlas-socialmatic.git
cd atlas-socialmatic

cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database is auto-created at `data/atlas.db` on first run.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes | — | API key for your OpenAI or compatible provider |
| `OPENAI_MODEL` | No | `gpt-4.1-mini` | Model to use for all generation endpoints |
| `OPENAI_BASE_URL` | No | `https://api.openai.com/v1` | Base URL for any OpenAI-compatible endpoint (no trailing slash) |

To use a local model (e.g. Ollama, LM Studio), set `OPENAI_BASE_URL` to your local endpoint and `OPENAI_MODEL` to the model name your server exposes.

---

## Docker

**Requirements:** Docker and Docker Compose V2 (`docker compose` command)

```bash
# 1. Copy the example env file and fill in your API key
cp .env.example .env
# Edit .env — set OPENAI_API_KEY at minimum

# 2. Build and start
docker compose up -d

# 3. Open the app
open http://localhost:3000
```

The SQLite database is stored at `./data/atlas.db` on the host, mounted into the container at `/app/data`. Data persists across container restarts and image rebuilds.

**Common commands:**

```bash
docker compose down           # Stop the container
docker compose up -d --build  # Rebuild and restart after a code change
docker compose logs -f        # Tail logs
```

**Port:** defaults to `3000`. To change it, update the `ports` mapping in `docker-compose.yml`.

All three env vars from `.env.example` are supported — see [Environment Variables](#environment-variables) above.

Tested on: Docker on Unraid, Docker on Ubuntu/Debian.

---

## Architecture

### Directory Structure

```
atlas-socialmatic/
├── app/
│   ├── page.tsx              # Entire frontend SPA (~1050 lines)
│   ├── globals.css           # Tailwind v4 base styles + dark mode
│   └── api/
│       ├── generate/         # Multi-platform post generation
│       ├── intel/            # Hooks + hashtag intelligence
│       ├── suggest-topics/   # LLM topic suggestions
│       ├── drafts/           # Draft list + create (GET/POST)
│       ├── drafts/[id]/      # Draft CRUD + optimistic locking (GET/PUT/DELETE)
│       └── health/db/        # DB connectivity check
├── lib/
│   └── db.ts                 # SQLite singleton + schema
├── data/
│   └── atlas.db              # Auto-created SQLite database (gitignored)
└── _docs/                    # Design decisions, sprints, roadmap
```

### Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS v4 |
| Database | SQLite via `better-sqlite3` |
| AI | OpenAI API (or OpenAI-compatible endpoint) |

### Key Design Decisions

- **Single-file frontend** — all UI state and handlers live in `app/page.tsx`
- **BYO API key** — no API keys stored in the database; configured via environment only
- **JSON columns** — `outputs`, `hooks`, `hashtag_packs` stored as JSON blobs; missing key = not yet generated
- **Drafts snapshot inputs** — topic/audience/tone/platforms saved at generation time to prevent history drift
- **Optimistic locking** — `PUT /api/drafts/[id]` requires `if_match_updated_at` in the request body; returns 409 on mismatch
- **SQLite WAL mode** — enabled for concurrent read safety
- **No external state library** — React hooks only (`useState`, `useEffect`, `useMemo`)

See [_docs/DECISIONS.md](_docs/DECISIONS.md) for the full decision log.

---

## Development

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No automated test suite exists yet (deferred to v2+).

---

## Roadmap

### v0.9.0-alpha (current)

- [x] Multi-platform post generation
- [x] LinkedIn intelligence (hooks + hashtag packs)
- [x] Topic suggestion engine
- [x] Draft persistence (SQLite)
- [x] Draft history, editing, deletion
- [x] Persistent default settings
- [x] Per-platform regeneration
- [x] Character counter per platform
- [x] Light / Dark theme toggle
- [x] Rate limiting (per-IP time-window across all LLM endpoints)
- [x] Docker support
- [ ] Screenshots (Issue #38)

**Known limitations in v0.9.0-alpha:**
- No brand voice / template presets
- No export (Markdown / JSON)
- No bulk history deletion UI
- No per-platform busy state (single shared busy flag)

### v1.0 — Stable Self-Hosted Content Engine

Planned additions: brand voice presets, template presets, export to Markdown/JSON, improved error handling, split busy states, collapsible panels, Docker-first deployment.

### v2.0 — Workflow Acceleration

Content planner, thread mode for X, blog outline mode, draft history versioning, history search/filtering, additional AI provider support.

See [_docs/ROADMAP.md](_docs/ROADMAP.md) for full scope details.

---

## Contributing

Atlas-Socialmatic is open-source under AGPLv3. Sole authorship is maintained for the v1.x lifecycle. External pull requests are not accepted in v1 without an explicit copyright agreement.

Feedback and bug reports are welcome via [GitHub Issues](https://github.com/kf0iwu/atlas-socialmatic/issues).

---

## Support Atlas

If Atlas-Socialmatic saves you time, consider supporting the project:

- [GitHub Sponsors](https://github.com/sponsors/kf0iwu)
- [Ko-fi](https://ko-fi.com/kf0iwu)

---

## License

[AGPLv3](LICENSE) — free to use, modify, and self-host. If you deploy a modified version as a network service, you must make the source available.

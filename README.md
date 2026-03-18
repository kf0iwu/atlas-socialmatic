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
# Edit .env.local and set LLM_API_KEY

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database is auto-created at `data/atlas.db` on first run.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `LLM_API_KEY` | Yes | — | API key for your LLM provider |
| `LLM_BASE_URL` | No | `https://api.openai.com/v1` | Base URL for any `/v1/chat/completions`-compatible endpoint (no trailing slash) |
| `LLM_MODEL` | No | `gpt-4.1-mini` | Model identifier passed to the provider |

> **Backward compatibility:** `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL` are still accepted as fallbacks — existing `.env.local` files keep working without changes.

---

## Provider Support

Atlas-Socialmatic calls the standard `/v1/chat/completions` endpoint, so any provider that implements that interface works without modification.

| Provider | `LLM_BASE_URL` | Example `LLM_MODEL` |
|---|---|---|
| **OpenAI** (default) | `https://api.openai.com/v1` | `gpt-4.1-mini` |
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-2.0-flash` |
| **Anthropic** (via proxy) | Your proxy's `/v1` endpoint | `claude-opus-4-6` |
| **Ollama** (local) | `http://localhost:11434/v1` | your model name (e.g. `llama3`) |
| **LM Studio** (local) | `http://localhost:1234/v1` | your loaded model name |

**Note on Anthropic:** Anthropic's native API does not expose `/v1/chat/completions`. Route requests through a compatible proxy (e.g. [LiteLLM](https://github.com/BerriAI/litellm)) and point `LLM_BASE_URL` at it.

The provider can also be configured from the sidebar UI — open the **Provider** panel, pick a preset, and save. Env vars always take precedence over saved settings.

### Troubleshooting

**`LLM_BASE_URL` formatting:**
- Include the full path to the API root, including the required version segment. Do not include a trailing slash.
- Correct: `http://localhost:11434/v1`
- Incorrect: `http://localhost:11434/` or `http://localhost:11434`

**Local models inside Docker:**
- `localhost` inside the container refers to the container itself, not your host machine. Use the host's LAN IP or — on Docker Desktop (Mac/Windows) — `host.docker.internal`.
- Example: `LLM_BASE_URL=http://host.docker.internal:11434/v1`

**Model name mismatch:**
- Providers require exact model names. For Ollama, run `ollama list` to see available names and set `LLM_MODEL` to match exactly.

**Rate limiting:**

Atlas-Socialmatic includes a built-in per-IP rate limiter (10 requests/minute, max 3 concurrent) applied to all LLM endpoints. A few things to be aware of:

- **In-memory only** — rate limit state is not persisted. It resets on every container restart, process crash, or `docker compose down && up`. The limiter is a courtesy throttle, not a hard security boundary.
- **Direct access without a reverse proxy** — when the app is accessed directly on port 3000 without a reverse proxy, the `x-forwarded-for` and `x-real-ip` headers are absent. In that case all users share a single rate limit bucket. For a strictly single-user self-hosted instance this is not a problem. For shared household or team use, put a reverse proxy (nginx, Caddy) in front and ensure it passes `X-Forwarded-For`.
- **Per-user enforcement at scale** — this is a known v1 limitation. Persistent, per-user rate limiting is planned for v2.0.

---

## Docker

**Requirements:** Docker and Docker Compose V2 (`docker compose` command)

```bash
# 1. Copy the example env file and fill in your API key
cp .env.example .env
# Edit .env — set LLM_API_KEY at minimum

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

See [Environment Variables](#environment-variables) and [Provider Support](#provider-support) above for the full variable reference.

Tested on: Docker on Unraid, Docker on Ubuntu/Debian.

### Unraid

**Prerequisites:** Unraid with Docker enabled. Open the web terminal via **Tools → Terminal** in the Unraid UI, or SSH into your server.

**1. Create an appdata folder and get the project files:**

```bash
mkdir -p /mnt/user/appdata/atlas-socialmatic
cd /mnt/user/appdata/atlas-socialmatic
git clone https://github.com/kf0iwu/atlas-socialmatic.git .
```

> `git` is not installed on Unraid by default. Install it via the **NerdTools** plugin (Community Applications → search "NerdTools" → enable git). Alternatively, download the project as a ZIP from GitHub and extract it into this folder using the Unraid file manager.

**2. Create your environment file:**

```bash
cp .env.example .env
```

Open `.env` in the Unraid file manager or with `vi .env` in the terminal. Set `LLM_API_KEY` to your API key. Save and close.

**3. Build and start:**

```bash
docker compose up -d
```

The first build takes a few minutes while Docker compiles the app. Once complete, the container starts automatically and will restart on server reboot.

**4. Open the app:**

Go to `http://YOUR-UNRAID-IP:3000` in a browser. Your Unraid server IP is shown in the top-left corner of the Unraid dashboard.

**Data persistence:**
Your drafts database is stored at `/mnt/user/appdata/atlas-socialmatic/data/atlas.db`. If you use the CA Backup/Restore or Appdata Backup plugin, this path is included automatically.

**To update to a newer version:**

```bash
cd /mnt/user/appdata/atlas-socialmatic
git pull
docker compose up -d --build
```

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
| AI | Any `/v1/chat/completions`-compatible provider (OpenAI, Gemini, Ollama, LM Studio, and others) |

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

**Known limitations in v0.9.0-alpha:**
- No brand voice / template presets
- No export (Markdown / JSON)
- No bulk history deletion UI
- No per-platform busy state (single shared busy flag)

### v1.0 — Stable Self-Hosted Content Engine

Planned additions: brand voice presets, template presets, export to Markdown/JSON, improved error handling, split busy states, collapsible panels.

### v2.0 — Workflow Acceleration

Content planner, thread mode for X, blog outline mode, draft history versioning, history search/filtering.

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

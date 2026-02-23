# v1.0 Acceptance Criteria

v1.0 is complete when all of the following conditions are met.

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
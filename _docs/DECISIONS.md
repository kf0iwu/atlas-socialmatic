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
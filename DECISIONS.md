# DECISIONS -- Atlas-Socialmatic

## Confirmed Decisions

-   Tool remains domain-agnostic
-   Open-source-first mindset
-   BYO API key model
-   Self-hosted compatibility prioritized
-   Separate endpoints for:
    -   Content generation
    -   Intelligence features

## Sprint 3 Decisions Made

-   Minimum 5 LinkedIn hooks
-   Hooks regenerable independently
-   Hashtag packs grouped by:
    -   Broad
    -   Niche
    -   Long-tail
-   Hashtag volume uses tiers (Small / Medium / Large)
-   Avoid fixed hashtag counts
-   Intelligence features optional (credit efficiency)

## Deferred / Tabled

-   Split intelBusy state → next sprint
-   X thread mode → later
-   Rewrite-variant feature → later
-   Brand voice system → later sprint

## Decisions Pending (Future)

-   Persistence model:
    -   localStorage vs SQLite vs external DB
-   Plugin/template system design
-   Authentication / multi-user support
-   Analytics / engagement scoring
-   Scheduling capability
-   Model/provider abstraction layer
-   Licensing choice (MIT vs Apache vs GPL)

## Guiding Constraints

-   Avoid unnecessary API calls
-   Keep UI uncluttered
-   Maintain extensibility

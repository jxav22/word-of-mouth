# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:54 NZDT · UI branch `feat/ui` (rebased onto main post-#4)

## Implemented
- Next.js 15 + SQLite + Tailwind vertical slice on `main` (QA, ingestion, intelligence merged)
- **UI (feat/ui):**
  - Full-bleed harbor-signal hero; create below fold
  - Demo/Live `ModeBadge` across journeys
  - Search slug links + `/search?q=`
  - Sources: ingestion scheduler/manager + polished table/mobile cards
  - Feed detail shows exclude-keywords from intelligence parse
  - Self-hosted Fraunces/Sora via `@fontsource` + `AppChrome`

## Partial
- Live ingest depends on upstream availability
- Feedback refine still light (intelligence threshold nudge)
- Compose needs Docker host

## Unimplemented / deferred
- Reddit adapter reserved
- Auth / multi-user
- Embedding rank

## Roadmap
1. Merge PR #3 (`feat/ui`) into main
2. Deploy

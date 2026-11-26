# STATUS — Word of Mouth

Updated: Fri 27 Nov 2026 ~04:40 NZDT

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle / better-sqlite3)
- NL parse → keywords/topics → RSS + HN discovery
- Ingest pipeline with SSRF guards, HTML sanitise, prompt fencing
- Rank + near-duplicate dedupe + extractive / optional AI summarise
- Persistent SQLite; demo seed ×4 (employment, tech, industry, Auckland/NZ)
- APIs: health, feeds, refresh, feedback, share, search, sources, public share
- UI: hero create, feed list/detail, item detail, search, sources, share page
- In-process refresh scheduler
- Dockerfile + docker-compose
- Vitest unit + integration; Playwright smoke scaffold

## Verified
- `npm test` → 8/8 pass
- `npm run build` → success
- `npm run seed` → 4 demo feeds
- `npm start` → `/api/health` ok, HTML home serves

## Partial
- Live RSS/HN quality depends on upstream; failures recorded per source
- Feedback only adjusts relevance threshold lightly
- E2E Playwright not yet executed green (needs browser install)
- `origin/main` owned by core worker — foundation merges via snapshot / PR branch

## Unimplemented
- Reddit adapter body
- Multi-user auth
- Embedding ranker / Redis queue

## Defects
- None blocking local run as of this STATUS

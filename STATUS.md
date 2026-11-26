# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:41 NZDT

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- Domain model + schema (feeds, sources, articles, feed_items)
- NL parse → keywords/topics/source discovery (`src/lib/feeds/parse.ts`)
- Ingest adapters: RSS + HN Algolia (`src/lib/sources/*`)
- Rank, dedupe/cluster, extractive + optional AI summarise
- SSRF protection, HTML sanitise, prompt fencing
- API: health, feeds CRUD-ish, refresh, feedback, share, search, sources, public `/api/s/:token`
- UI: home create+browse, feed detail, item detail, search, sources diagnostics, share page
- Demo seed: 4 labelled feeds
- In-process scheduler
- Dockerfile + docker-compose
- Vitest unit (rank/dedupe/ssrf) + integration (create feed) + Playwright smoke scaffold

## Partial
- Live ingest quality depends on upstream RSS availability; some sources may error gracefully
- Feedback only lightly adjusts relevance threshold (not full re-rank model)
- E2E not yet proven green (Playwright browsers may need install)
- Optional AI summarise only when env keys present

## Unimplemented / deferred
- Reddit public adapter (kind reserved)
- Redis/job queue (in-process cron only)
- Auth / multi-user accounts
- Embedding-based ranking

## Defects
- Search result links use feed id (works) not slug (cosmetic)

## Verification (this VM)
- `npm test` → 8/8 pass
- `npm run build` → success
- Push to `main` confirmed (`538b480`+ follow-ups)

## Roadmap
1. Prove Playwright e2e smoke + Docker compose up
2. Harden source adapters + richer feedback refine
3. Deploy (Vercel or compose)

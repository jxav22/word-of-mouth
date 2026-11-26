# STATUS — Word of Mouth

<<<<<<< HEAD
Updated: 2026-11-27 ~04:52 NZDT (main: QA + ingestion; intelligence merging)

## Implemented
- Next.js 15 + TS + Tailwind + SQLite/Drizzle
- NL parse with exclude keywords; ingest registry (rss/hn/reddit/api/demo)
- SSRF hardened; diagnostics; source APIs; node-cron scheduler
- Rank + feedback prefs; dedupe/cluster; summarise + attribution
- Demo feeds; CI; `@fontsource` fonts

## Partial
- Live upstream quality / Reddit egress
- Optional AI keys; search links by id; Docker unverified

## Unimplemented
- Redis/auth/embeddings/distributed scheduler

## Verification
- Ingestion merge: 24/24 + build green
- Intelligence: resolving; feedback-share test under fix
=======
Updated: 2026-11-27 ~04:48 NZDT · UI branch `feat/ui`

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- Domain model + schema (feeds, sources, articles, feed_items)
- NL parse → keywords/topics/source discovery (`src/lib/feeds/parse.ts`)
- Ingest adapters: RSS + HN Algolia (`src/lib/sources/*`)
- Rank, dedupe/cluster, extractive + optional AI summarise
- SSRF protection, HTML sanitise, prompt fencing
- API: health, feeds CRUD-ish, refresh, feedback, share, search, sources, public `/api/s/:token`
- **UI (feat/ui polish):**
  - Full-bleed dark hero with Word of Mouth brand-level mark + signal-field visual
  - Progressive disclosure create flow (examples, optional title)
  - Dense browse lists; Demo/Live `ModeBadge` on feeds, items, sources, share
  - Search with slug-resolved item links; mobile sources stack + desktop table
  - Feedback actions with threshold nudge copy; share + refresh controls
  - Self-hosted Fraunces/Sora via `@fontsource` (no Google font fetch at build)
- Demo seed: 4 labelled feeds
- In-process scheduler
- Dockerfile + docker-compose + CI workflow
- Vitest + Playwright scaffold

## Partial
- Live ingest quality depends on upstream RSS availability; some sources may error gracefully
- Feedback only lightly adjusts relevance threshold (not full re-rank model)
- E2E proven on `feat/qa`; compose still needs a Docker host
- Optional AI summarise only when env keys present

## Unimplemented / deferred
- Reddit public adapter (kind reserved)
- Redis/job queue (in-process cron only)
- Auth / multi-user accounts
- Embedding-based ranking

## Defects
- CI historically failed on `next/font/google` null loader — fixed via `@fontsource` (QA + UI)

## Roadmap
1. Merge `feat/qa` then `feat/ui` into main
2. Prove e2e smoke + Docker compose where Docker exists
3. Harden source adapters + richer feedback refine
4. Deploy (Vercel or compose)
>>>>>>> 65c0fc5 (docs: update HANDOFF and STATUS for feat/ui polish)

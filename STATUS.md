# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:46 NZDT (ingestion)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- Domain model + schema (feeds, sources, articles, feed_items)
- NL parse → keywords/topics/source discovery (`src/lib/feeds/parse.ts`)
- **Ingest adapter registry** (`src/lib/sources/registry.ts`): rss, hn, reddit, json-api, demo
- Real fetch + normalise (`src/lib/ingest/normalize.ts`, adapters via `safeFetch`)
- Strengthened SSRF: multi-hop redirect revalidation, streaming size cap, IPv6/mapped, decimal-host, metadata/suffix blocks
- Rank, dedupe/cluster, extractive + optional AI summarise
- HTML sanitise, prompt fencing
- API: health, feeds CRUD-ish, refresh, feedback, share, search, sources, public `/api/s/:token`
- **Source management API**: `GET/POST /api/sources`, `GET/PATCH/DELETE /api/sources/:id`, `POST /api/sources/:id/refresh`
- **Ingest diagnostics**: `GET/POST /api/ingest/status`, run history, scheduler status on `/api/health` + `/api/sources`
- UI: home create+browse, feed detail, item detail, search, **sources diagnostics + add/refresh/enable/delete + scheduler controls**, share page
- Demo seed: 4 labelled feeds
- **Due-feed scheduler** via node-cron (respects `refreshIntervalMin`, lock, warm-up tick, failure counters)
- Source diagnostics columns: fetchCount, consecutiveFailures, lastSuccessAt, lastDurationMs, lastItemCount, adapterId, enabled
- Dockerfile + docker-compose
- Vitest: rank/dedupe/ssrf/normalize/registry/scheduler + integration create-feed + Playwright smoke scaffold

## Partial
- Live ingest quality depends on upstream RSS/Reddit availability; errors recorded per-source
- Reddit public endpoints may 403/404 from some cloud egress IPs (rate-limit); adapter tries RSS then JSON and records failure cleanly. HN + Dev.to API + major RSS verified live from this environment.
- Feedback only lightly adjusts relevance threshold (not full re-rank model)
- E2E not yet proven green in this environment (Playwright browsers may need install)
- Redis/job queue still deferred (in-process cron is reliable for single-node)

## Unimplemented / deferred
- Auth / multi-user accounts
- Embedding-based ranking
- Multi-instance distributed scheduler

## Defects
- Search result links use feed id (works) not slug (cosmetic)

## Roadmap
1. Prove `npm run build`, seed, `npm test`, e2e smoke on CI
2. Deploy (Vercel or compose)
3. Richer feedback refine (intelligence track)

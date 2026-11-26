# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:50 NZDT (main integrating specialists)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle / better-sqlite3)
- Domain model + schema (feeds, sources, articles, feed_items)
- NL parse → keywords/topics/source discovery (`src/lib/feeds/parse.ts`)
- **Ingest adapter registry** (`src/lib/sources/registry.ts`): rss, hn, reddit, json-api, demo
- Real fetch + normalise (`src/lib/ingest/normalize.ts`, adapters via `safeFetch`)
- Strengthened SSRF: multi-hop redirect revalidation, streaming size cap, IPv6/mapped, decimal-host, metadata/suffix blocks
- Rank, dedupe/cluster, extractive + optional AI summarise
- HTML sanitise, prompt fencing
- API: health, feeds CRUD-ish, refresh, feedback, share, search, sources, public `/api/s/:token`
- **Source management API**: `GET/POST /api/sources`, `GET/PATCH/DELETE /api/sources/:id`, `POST /api/sources/:id/refresh`
- **Ingest diagnostics**: `GET/POST /api/ingest/status`, scheduler status on `/api/health` + `/api/sources`
- UI: home create+browse, feed detail, item detail, search, sources diagnostics + add/refresh/enable/delete + scheduler controls, share page
- Demo seed: 4 labelled feeds (boot + `npm run seed`)
- **Due-feed scheduler** via node-cron (respects `refreshIntervalMin`, lock, warm-up tick)
- Source diagnostics columns: fetchCount, consecutiveFailures, lastSuccessAt, lastDurationMs, lastItemCount, adapterId, enabled
- Dockerfile + docker-compose + `.dockerignore` + standalone `scripts/start.sh`
- GitHub Actions CI: `npm ci` → `npm test` → `npm run build` → Playwright chromium e2e
- Vitest unit + integration; Playwright e2e smoke
- Self-hosted fonts via `@fontsource` (CI-safe)

## Partial
- Live ingest quality depends on upstream RSS/Reddit/HN; errors recorded per-source
- Reddit public endpoints may 403/404 from some cloud egress IPs; adapter tries RSS then JSON
- Feedback only lightly adjusts relevance threshold (intelligence PR may deepen)
- Optional AI summarise only when env keys present
- Search result links use feed **id** not slug — cosmetic
- Docker Compose unverified on sprint VMs (no Docker)

## Unimplemented / deferred
- Redis / job queue (in-process cron only)
- Auth / multi-user accounts
- Embedding-based ranking
- Multi-instance distributed scheduler

## Defects
- CI Google-font loader failure — **fixed** with `@fontsource` (merged via PR #1)
- Cosmetic: search links prefer id over slug

## Verification
| Check | Result |
| --- | --- |
| `npm test` | **16/16** (pre-ingestion merge; re-verify after) |
| `npm run build` | **green** after fontsource |
| `npm run test:e2e` | **4/4** |
| Live `POST /api/feeds` | up to **80 ingested / 0 errors** |
| PR #1 CI | **green** → merged |
| `docker compose` | **not run** — Docker absent |

## Roadmap
1. Land ingestion → intelligence → UI PRs on main
2. Prove CI stays green after each merge
3. Docker compose smoke on a host with Docker
4. Deploy (Vercel or compose)

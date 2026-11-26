# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:48 NZDT (QA `feat/qa`)  
Verified against `main` HEAD synced at `748aafb` + font CI fix.

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle / better-sqlite3)
- Domain model + schema (feeds, sources, articles, feed_items)
- NL parse → keywords/topics/source discovery (`src/lib/feeds/parse.ts`)
- Ingest adapters: RSS + HN Algolia (`src/lib/sources/*`)
- Rank, dedupe/cluster, extractive + optional AI summarise
- SSRF protection, HTML sanitise, prompt fencing
- API: health, feeds CRUD-ish, refresh, feedback, share, search, sources, public `/api/s/:token`
- UI: home create+browse, feed detail, item detail, search, sources diagnostics, share page
- Demo seed: 4 labelled feeds (boot + `npm run seed`)
- In-process scheduler (`WOM_DISABLE_SCHEDULER=1` for tests)
- Dockerfile + docker-compose + `.dockerignore` + standalone `scripts/start.sh`
- GitHub Actions CI: `npm ci` → `npm test` → `npm run build` → Playwright chromium e2e
- Vitest unit + integration; Playwright e2e smoke

## Partial
- Live ingest quality depends on upstream RSS / HN availability; failures surface as source `error` / warnings
- Feedback only lightly adjusts relevance threshold (not a full re-rank model)
- Optional AI summarise only when `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` present
- Search result links use feed **id** (works via `getFeedByIdOrSlug`) not slug — cosmetic
- Demo HN sources start `pending` until first refresh

## Unimplemented / deferred
- Reddit public adapter (`kind` reserved)
- Redis / job queue (in-process cron only)
- Auth / multi-user accounts
- Embedding-based ranking

## Defects
- CI build (Actions run 45852186443): `next/font/google` threw in `layout.tsx` — **fixed** by bundling `@fontsource/fraunces` + `@fontsource/sora`
- Docker Compose **not runnable here** — no `docker` / socket on the QA agent image (files present; unverified)
- Cosmetic: search links prefer id over slug

## Verification (QA VM, NZDT 04:41–04:45 Fri 27 Nov 2026)
| Check | Result |
| --- | --- |
| `npm install` | OK |
| `npm test` (vitest) | **16/16 pass** |
| `npm run build` | **green** locally after `@fontsource` fix; CI first run failed on Google fonts |
| `npm run seed` | **4 demo feeds** |
| `scripts/start.sh` / `npm start` | **Ready**; `/` 200; `/api/health` ok |
| Live `POST /api/feeds` (`ingest:true`) | **ingested 44 / ranked 44 / errors []** |
| Feedback + share APIs | **ok** |
| `npx playwright install chromium` + `npm run test:e2e` | **4/4 pass** |
| `docker compose up --build` | **not run** — Docker absent on VM |

## Roadmap (prioritised)
1. Prove Docker Compose on a machine with Docker; fix image issues if any
2. Confirm CI e2e stays green on GitHub Actions after `feat/qa` merges
3. Richer feedback refine (re-score items, not only threshold nudge)
4. Harden flaky RSS hosts; clearer source error UX
5. Deploy (Vercel or compose) once compose smoke is green

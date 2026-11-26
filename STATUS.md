# STATUS — Word of Mouth

Updated: 2026-11-27 ~05:00 NZDT (PR #5 landing)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- NL parse → keywords/topics/excludes → source discovery
- Ingest adapters: rss, hn, reddit, json-api, demo + normalise + diagnostics
- SSRF hardened; node-cron scheduler; source management APIs
- Rank + feedback refine; hard dedupe + soft clusters; summarise + attribution
- UI: harbor-signal design, AppChrome, create/browse/search/share/sources
- Demo seed (4 feeds); CI; `@fontsource` Fraunces/Sora

## Partial
- Live upstream quality varies; Reddit may 403 from some egress
- Optional AI summarise needs env keys
- Docker Compose unverified on sprint VMs
- Some sources error gracefully during ingest while others succeed

## Unimplemented / deferred
- Redis / distributed scheduler
- Auth / multi-user accounts
- Embedding-based ranking

## Defects
- Do not reintroduce `next/font/google`
- Post-merge e2e selector drift after UI polish — **fixed** (PR #5 + main `#query`/`#create` selectors)
- Unused eslint-disable warnings at build (non-blocking)

## Verification
| Check | Result |
| --- | --- |
| `npm test` | **51/51** |
| `npm run build` | **green** |
| `npm run test:e2e` | **4/4** |
| Live ingest (QA) | **38/38** ranked |
| PR #5 CI @ `29e6ace` | **green** |
| Docker compose | not run |

## Roadmap
1. Docker compose smoke on a Docker host
2. Clearer per-source warnings on create/refresh (`feat/polish-gaps`)
3. Harden Reddit/HN adapters against 403/HTML
4. Optional deploy

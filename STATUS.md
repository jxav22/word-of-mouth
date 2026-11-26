# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:57 NZDT (QA post-merge re-verify on `5837845`)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- NL parse (keywords/topics/excludes) → source discovery
- Ingest adapters: rss, hn, reddit, json-api, demo + normalise + diagnostics
- SSRF hardened; node-cron scheduler; source management APIs
- Rank + feedback refine; hard dedupe + soft clusters; summarise + attribution
- UI: harbor-signal design, AppChrome shell, create/browse/search/share/sources
- Demo seed (4 labelled feeds); CI (vitest + build + Playwright); `@fontsource` fonts

## Partial
- Live upstream quality varies; Reddit may 403 from some cloud egress
- Optional AI summarise needs env keys
- Search links use feed id not slug (cosmetic)
- Docker Compose unverified on sprint VMs
- Some sources error gracefully during ingest while others succeed

## Unimplemented / deferred
- Redis / distributed scheduler
- Auth / multi-user accounts
- Embedding-based ranking

## Defects
- Google `next/font` CI failure — fixed with `@fontsource` (do not reintroduce)
- Post-merge e2e selectors drifted after UI polish — **fixed** (Sources heading + create-form labels)
- Unused eslint-disable directives warn at build (non-blocking)

## Verification (post-merge, this VM)
| Check | Result |
| --- | --- |
| `npm test` | **51/51** |
| `npm run build` | **green** |
| `npm run test:e2e` | **4/4** (after selector fix) |
| Live create+ingest | **38/38** ranked; non-fatal HN RSS / Reddit warnings |
| Pages `/` `/feeds` `/sources` `/search` | **200** |
| Docker compose | not run — no Docker on VMs |

## Roadmap
1. Docker compose smoke on a host with Docker
2. Clean unused eslint-disable warnings
3. Harden Reddit/HN RSS adapters against 403/HTML responses
4. Optional deploy (Vercel or compose)

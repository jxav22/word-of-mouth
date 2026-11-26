# STATUS — Word of Mouth

Updated: 2026-11-27 ~05:02 NZDT (PR #6 feedSlug landing; UI warnings still on feat/polish-gaps)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- NL parse → keywords/topics/excludes → source discovery
- Ingest adapters: rss, hn, reddit, json-api, demo + normalise + diagnostics
- SSRF hardened; node-cron scheduler; source management APIs
- Rank + feedback refine; hard dedupe + soft clusters; summarise + attribution
- UI: harbor-signal design, AppChrome, create/browse/search/share/sources
- Search results stamp `feedSlug` for stable slug links (API + tests)
- Demo seed (4 feeds); CI; `@fontsource` Fraunces/Sora

## Partial
- Live upstream quality varies; Reddit may 403 from some egress
- Optional AI summarise needs env keys
- Docker Compose unverified on sprint VMs
- Create/refresh per-source warning UX — UI still landing on `feat/polish-gaps`

## Unimplemented / deferred
- Redis / distributed scheduler
- Auth / multi-user accounts
- Embedding-based ranking

## Defects
- Do not reintroduce `next/font/google`
- Unused eslint-disable warnings at build (non-blocking)

## Verification
| Check | Result |
| --- | --- |
| Pre-merge main | vitest **51/51**, build green, e2e **4/4** |
| PR #5 CI | green → merged |
| Docker compose | not run |

## Roadmap
1. Land remaining UI source-warning UX from `feat/polish-gaps`
2. Docker compose smoke on a Docker host
3. Harden Reddit/HN adapters
4. Optional deploy

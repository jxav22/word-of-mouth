# STATUS — Word of Mouth

Updated: 2026-11-27 ~05:03 NZDT (main has feedSlug; SourceWarningsBanner on feat/polish-gaps)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- NL parse → keywords/topics/excludes → source discovery
- Ingest adapters: rss, hn, reddit, json-api, demo + normalise + diagnostics
- SSRF hardened; node-cron scheduler; source management APIs
- Rank + feedback refine; hard dedupe + soft clusters; summarise + attribution
- UI: harbor-signal design, AppChrome, create/browse/search/share/sources
- Search results stamp `feedSlug` for stable slug links (API + tests) — on `main`
- Demo seed (4 feeds); CI; `@fontsource` Fraunces/Sora

## Partial
- Live ingest quality depends on upstreams; Reddit may 403 from some egress IPs
- Optional AI summarise only with `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
- Create/feed/sources `SourceWarningsBanner` for non-fatal ingest failures (`feat/polish-gaps` — this PR)
- Docker Compose files present but **not run** on sprint agent VMs (no Docker)

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
| feedSlug (PR #6 half) | on `main`; vitest **55/55** |
| Docker compose | not run |

## Roadmap
1. Land SourceWarningsBanner UX from `feat/polish-gaps`
2. Docker compose smoke on a Docker host
3. Harden Reddit/HN adapters
4. Optional deploy

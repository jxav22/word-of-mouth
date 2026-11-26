# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:53 NZDT (final integration)

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

## Unimplemented / deferred
- Redis / distributed scheduler
- Auth / multi-user accounts
- Embedding-based ranking

## Defects
- Google `next/font` CI failure — fixed with `@fontsource` (do not reintroduce)

## Verification
| Check | Result |
| --- | --- |
| After intelligence merge | vitest **51/51**, build green |
| PR #1 CI | green → merged |
| Docker compose | not run — no Docker on VMs |

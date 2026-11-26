# STATUS — Word of Mouth

Updated: 2026-11-27 ~05:07 NZDT (final verification on `main`)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- NL parse → discover → ingest → rank/dedupe/cluster → summarise
- Adapters: rss, hn, reddit, json-api, demo; SSRF; scheduler; source APIs
- Search `feedSlug` on API results + stable slug links (**on main**)
- **SourceWarningsBanner** on create + feed detail + sources (**on main**)
- Harbor-signal UI / AppChrome / `@fontsource`; demo feeds; CI

## Partial
- Live upstream flaky (Reddit 403, some RSS/HN warnings) — banner surfaces them
- Optional AI keys only
- Docker Compose unverified on sprint VMs

## Unimplemented / deferred
- Redis / auth / embeddings / distributed scheduler

## Defects
- Never reintroduce `next/font/google`
- Build may emit unused eslint-disable warnings (non-blocking)
- Mis-routed HN RSS URLs can return JSON-parse errors (adapter mismatch)

## Verification (final, ~05:07 NZDT)
| Check | Result |
| --- | --- |
| `WOM_DISABLE_SCHEDULER=1 npm test` | **55/55** |
| `npm run build` | green (unused eslint-disable warnings only) |
| `WOM_DISABLE_SCHEDULER=1 npm run test:e2e` | **4/4** |
| Live smoke (`PORT=3001`, fresh `WOM_DATA_DIR`) | health ok; search returns `feedSlug`; create ranked **38** with expected Reddit/HN source errors; banner + sources diagnostics visible |
| Docker | not run |
| PR #6 | **closed** (obsolete — product work already on `main`) |

## Roadmap
1. Docker compose on a Docker host
2. Deploy
3. Optional: harden HN RSS adapter selection

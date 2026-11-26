# STATUS — Word of Mouth

Updated: 2026-11-27 ~05:03 NZDT (feedSlug + source-warning UX on main)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- NL parse → discover → ingest → rank/dedupe/cluster → summarise
- Adapters: rss, hn, reddit, json-api, demo; SSRF; scheduler; source APIs
- Search `feedSlug` on API results + stable slug links
- **SourceWarningsBanner** on create + feed detail + sources (clearer upstream/Reddit failures)
- Harbor-signal UI / AppChrome / `@fontsource`; demo feeds; CI

## Partial
- Live upstream flaky (Reddit 403, some RSS/HN warnings)
- Optional AI keys only
- Docker Compose unverified on sprint VMs

## Unimplemented / deferred
- Redis / auth / embeddings / distributed scheduler

## Defects
- Never reintroduce `next/font/google`
- Build may emit unused eslint-disable warnings (non-blocking)

## Verification
| Check | Result |
| --- | --- |
| `npm test` after feedSlug | **55/55** |
| e2e / build (prior) | **4/4** / green |
| Docker | not run |

## Roadmap
1. Final verification ~05:32 NZDT
2. Docker compose on a Docker host
3. Deploy

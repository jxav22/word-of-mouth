# STATUS — Word of Mouth

Updated: 2026-11-27 ~05:11 NZDT (post-verify polish on `main`)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- NL parse → discover → ingest → rank/dedupe/cluster → summarise
- Adapters: rss, hn, reddit, json-api, demo; SSRF; scheduler; source APIs
- Search `feedSlug` on API results + stable slug links
- SourceWarningsBanner on create + feed detail + sources
- Compact HN Algolia queries (`hnSearchTerms`) + soft-floor ranking when nothing clears threshold
- HN Algolia vs `news.ycombinator.com/rss` adapter separation
- Harbor-signal UI / AppChrome / `@fontsource`; demo feeds; CI
- Share via `GET /api/feeds/:id/share` + `/s/:token`

## Partial
- Live upstream flaky (Reddit 403 common) — banner surfaces them
- Optional AI keys only
- Docker Compose unverified on sprint VMs

## Unimplemented / deferred
- Redis / auth / embeddings / distributed scheduler

## Defects / invariants
- Never reintroduce `next/font/google`

## Verification
| Check | Result |
| --- | --- |
| `npm test` | **58/58** |
| `npm run build` | green |
| e2e | **4/4** |
| Live create Rust feed | ranked **36** |
| PR #6 | closed (obsolete) |
| PR #7 | merged (docs) |
| Docker | not run |

## Roadmap
1. Docker compose on a Docker host
2. Deploy

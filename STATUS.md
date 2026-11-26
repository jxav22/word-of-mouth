# STATUS — Word of Mouth

Updated: 2026-11-27 ~05:30 NZDT · freeze tip `66407a7`

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- NL parse → discover → ingest → rank/dedupe/cluster → summarise
- Adapters: rss, hn, reddit, json-api, demo; SSRF; scheduler; source APIs
- Search `feedSlug` + SourceWarningsBanner (Reddit dual-fail classifier)
- Compact HN queries + soft-floor ranking + soft-floor/pending/empty UX
- HN Algolia vs news.ycombinator.com/rss adapter split
- Reddit `/r/{sub}.rss` + accept HTTP 404 when body is Atom/RSS
- Harbor-signal UI / AppChrome / `@fontsource`; demo feeds; CI; share
- Docker HEALTHCHECK on `/api/health` (unverified here)

## Partial
- Reddit 403/429 common — banner surfaces them
- Optional AI keys only
- Docker Compose unverified on sprint VMs

## Unimplemented / deferred
- Redis / auth / embeddings / distributed scheduler

## Defects / invariants
- Never reintroduce `next/font/google`

## Verification (freeze)
| Check | Result |
| --- | --- |
| `npm test` | **68/68** |
| e2e | **4/4** |
| build | green |
| PR #6 | closed |
| PR #7 / #8 | merged |
| Docker | not run |

## Roadmap
1. Docker compose on a Docker host
2. Deploy

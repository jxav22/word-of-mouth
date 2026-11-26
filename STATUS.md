# STATUS — Word of Mouth

Updated: 2026-11-27 ~05:15 NZDT (PR #8 merged; Reddit RSS 404-body handling)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- NL parse → discover → ingest → rank/dedupe/cluster → summarise
- Adapters: rss, hn, reddit, json-api, demo; SSRF; scheduler; source APIs
- Search `feedSlug` on API results + stable slug links
- SourceWarningsBanner + shared `source-warnings` classifier (Reddit dual-fail → reddit)
- Compact HN Algolia queries (`hnSearchTerms`) + soft-floor ranking
- HN Algolia vs `news.ycombinator.com/rss` adapter separation
- Reddit RSS prefers `/r/{sub}.rss` and accepts HTTP 404 when body is Atom/RSS
- Harbor-signal UI / AppChrome / `@fontsource`; demo feeds; CI
- Share via `GET /api/feeds/:id/share` + `/s/:token`

## Partial
- Live Reddit often 403/429 — banner surfaces them
- Optional AI keys only
- Docker Compose unverified on sprint VMs

## Unimplemented / deferred
- Redis / auth / embeddings / distributed scheduler

## Defects / invariants
- Never reintroduce `next/font/google`

## Verification
| Check | Result |
| --- | --- |
| `npm test` | **68/68** |
| `npm run build` | green |
| e2e | **4/4** |
| PR #6 | closed |
| PR #7 | merged |
| PR #8 | merged |
| Docker | not run |

## Roadmap
1. Docker compose on a Docker host
2. Deploy

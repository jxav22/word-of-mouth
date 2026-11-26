# STATUS — Word of Mouth

Updated: 2026-11-27 ~05:16 NZDT

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- NL parse → discover → ingest → rank/dedupe/cluster → summarise
- Adapters: rss, hn, reddit, json-api, demo; SSRF; scheduler; source APIs
- Search `feedSlug` + SourceWarningsBanner (Reddit dual-fail classifier)
- Compact HN queries + soft-floor ranking + soft-floor UX notes
- HN Algolia vs news.ycombinator.com/rss adapter split
- Reddit `/r/{sub}.rss` + accept HTTP 404 when body is Atom/RSS
- Harbor-signal UI / AppChrome / `@fontsource`; demo feeds; CI; share links

## Partial
- Reddit often 403/429 — banner surfaces them
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
| build / e2e | green / **4/4** |
| PR #6–#8 | #6 closed; #7+#8 merged |
| Docker | not run |

## Roadmap
1. Docker compose on a Docker host
2. Deploy

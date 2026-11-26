# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:55 NZDT (`feat/intelligence` rebased onto post-ingestion main)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- Domain model + schema (feeds, sources, articles, feed_items)
  - Ingestion diagnostics columns on sources
  - Intelligence: `exclude_keywords`, `summary_attribution`
- **Intelligence — NL parse** (`src/lib/feeds/parse.ts`): intent, phrases/quotes, short-token keep, exclusions, adaptive threshold, `configQuality`, source discovery (incl. reddit/dev.to from ingestion)
- **Intelligence — rank** (`src/lib/rank/*`): lexical + TF-IDF blend, synonym expand, MMR, freshness, prefs, cluster diversity
- **Intelligence — cluster** (`src/lib/cluster/dedupe.ts`): URL canonicalize, hard dedupe, story clustering
- **Intelligence — summarise**: OpenAI/Anthropic optional + extractive fallback with attribution
- **Intelligence — feedback refine** (`src/lib/feeds/refine.ts`): learn keywords/excludes, adjust threshold, re-rank
- Ingest adapters via registry (RSS, HN, Reddit, API/demo) + diagnostics/scheduler (ingestion `#2`)
- SSRF protection, HTML sanitise, prompt fencing
- API: health, feeds, `POST /api/feeds/parse`, refresh, feedback (refine diff), share, search, sources, public `/api/s/:token`
- UI: create/browse, feed/item detail (attribution + cluster), search, sources, share
- Demo seed, CI, Dockerfile + docker-compose
- Vitest coverage for parse/rank/tfidf/dedupe/cluster/summarise/refine/feedback

## Partial
- Live ingest quality depends on upstream availability
- Semantic rank is TF-IDF cosine (no embedding model yet)
- Feedback refine is heuristic term learning
- Create UI not yet wired to `/api/feeds/parse` quality hints (API ready)
- E2E / Docker compose may need local Playwright browsers / Docker socket

## Unimplemented / deferred
- Redis/job queue (in-process cron only)
- Auth / multi-user accounts
- True embedding-based ranking

## Defects
- Search result links use feed id (works) not slug (cosmetic)

## Roadmap
1. Land intelligence PR `#4` on main
2. Wire create form to parse preview quality hints
3. Optional embedding rank behind env flag
4. Deploy (Vercel or compose)

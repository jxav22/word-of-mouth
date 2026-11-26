# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:52 NZDT (intelligence branch atop main `748aafb`)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle/better-sqlite3)
- Domain model + schema (feeds, sources, articles, feed_items) + `exclude_keywords`, `summary_attribution`
- **Intelligence — NL parse** (`src/lib/feeds/parse.ts`): intent, phrases/quotes, short-token keep (`ai`/`nz`), exclusions (`not X` / `-term`), adaptive relevance threshold, `configQuality`, source discovery
- **Intelligence — rank** (`src/lib/rank/*`): conventional lexical + TF-IDF cosine “semantic” blend, freshness, exclude/boost/bury prefs, cluster diversity on browse
- **Intelligence — cluster** (`src/lib/cluster/dedupe.ts`): URL canonicalize, hard dedupe, story clustering (shared `clusterId`), representative picker helper
- **Intelligence — summarise** (`src/lib/summarise`): OpenAI/Anthropic optional + extractive fallback with attribution string
- **Intelligence — feedback refine** (`src/lib/feeds/refine.ts`): learn keywords/excludes, adjust threshold, re-rank linked items
- Ingest adapters: RSS + HN Algolia (`src/lib/sources/*`)
- SSRF protection, HTML sanitise, prompt fencing
- API: health, feeds CRUD-ish, `POST /api/feeds/parse` dry-run, refresh, feedback (returns refine diff), share, search, sources, public `/api/s/:token`
- UI: home create+browse, feed detail, item detail (attribution + cluster), search, sources diagnostics, share page
- Demo seed: 4 labelled feeds
- In-process scheduler + CI workflow on main
- Dockerfile + docker-compose
- Vitest unit/integration covering parse/rank/tfidf/dedupe/cluster/summarise/refine/feedback

## Partial
- Live ingest quality depends on upstream RSS availability; some sources may error gracefully
- Semantic rank is TF-IDF cosine (no embedding model / vector DB yet)
- Feedback refine is heuristic term learning (not a trained model)
- Optional AI summarise only when env keys present
- Create UI does not yet call `/api/feeds/parse` for live quality hints (API ready)
- E2E / Docker compose may need local Playwright browsers / Docker socket

## Unimplemented / deferred
- Reddit public adapter (kind reserved)
- Redis/job queue (in-process cron only)
- Auth / multi-user accounts
- True embedding-based ranking (OpenAI/local embeddings)

## Defects
- Search result links use feed id (works) not slug (cosmetic)

## Verification
- Core `main`: prior smoke green (test/build/live ingest)
- Intelligence `feat/intelligence`: `npm test` expanded parse/rank/cluster/summarise/feedback suite; `npm run build` after rebase

## Roadmap
1. Wire create form to parse preview quality hints
2. Prove e2e smoke + optional embedding rank behind env flag
3. Harden source adapters
4. Deploy (Vercel or compose)

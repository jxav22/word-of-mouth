# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Working tree:** `/agent/repos/word-of-mouth`  
**main:** ingestion merged (`#2`); intelligence PR `#4` rebasing  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:55 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
Specialists on feature branches → PR into `main`. Do not force-push `main`.

| Stream | Agent | Branch |
| --- | --- | --- |
| Main / integrate | [Word of Mouth core](bc-36b64192-691a-5946-9a6e-059fadb961e2) | `main` |
| Ingestion | merged via `#2` | `feat/ingestion` |
| Intelligence | [Feed intelligence](bc-499283ce-d144-51c7-87d7-a1acd1e2f4ef) | `feat/intelligence` → PR `#4` |
| Frontend | [Feed interface](bc-bed2b221-68b3-52cd-ab30-633f105cb012) | `feat/ui` |
| QA | [Product verification](bc-a5f5c6ca-3571-53ee-8b1f-51794227a980) | `feat/qa` |

## Intelligence (this branch)
Deepened without rewriting adapters/UI; rebased onto post-ingestion `main`.

| Module | Path | What landed |
| --- | --- | --- |
| NL parse | `src/lib/feeds/parse.ts` | intent, excludes, short-token keep, adaptive threshold, `configQuality` (+ reddit/dev.to discovery from ingestion) |
| Parse preview | `POST /api/feeds/parse` | dry-run config + quality hint |
| Rank | `src/lib/rank/*` | lexical + TF-IDF blend, synonym expand, MMR, prefs, diversity |
| Cluster | `src/lib/cluster/dedupe.ts` | canonicalize URL, hard dedupe, story clusters |
| Summarise | `src/lib/summarise/index.ts` | AI + extractive + attribution |
| Feedback | `src/lib/feeds/refine.ts` + `setFeedback` | keywords/excludes/threshold + re-rank |
| Schema | `exclude_keywords`, `summary_attribution` | additive SQLite migrations (alongside ingestion source diagnostics) |

## How to run
```bash
npm install
npm run dev
WOM_DISABLE_SCHEDULER=1 npm test
npm run build && npm start
npm run seed
docker compose up --build
```

## Test evidence (intelligence)
`npm test` — parse / rank / tfidf / dedupe / summarise / refine / feedback (+ main/ingestion coverage).

## Key paths
- `src/lib/feeds/` — parse, refine, service
- `src/lib/rank/` — conventional + TF-IDF + expand/MMR
- `src/lib/cluster/` — dedupe + story clusters
- `src/lib/summarise/` — AI + extractive
- `src/lib/ingest/` — pipeline (ingestion adapters + intelligence rank/cluster)
- `STATUS.md` — honesty board

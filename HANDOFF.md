# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Working tree:** `/agent/repos/word-of-mouth`  
**main base:** `748aafb`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; intelligence note ~04:52 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
Specialists on feature branches → PR into `main`. Do not force-push `main`.

| Branch / agent | Role |
| --- | --- |
| `main` / [core](bc-36b64192-691a-5946-9a6e-059fadb961e2) | Integration owner |
| `feat/ingestion` | Ingest / SSRF / adapters |
| `feat/intelligence` / [bc-499283ce…](bc-499283ce-d144-51c7-87d7-a1acd1e2f4ef) | NL→config, rank, cluster, summarise, feedback |
| `feat/ui` | UI polish |
| `feat/qa` | Tests / STATUS honesty |

## Intelligence (this branch)
Deepened without rewriting adapters/UI:

| Module | Path | What landed |
| --- | --- | --- |
| NL parse | `src/lib/feeds/parse.ts` | intent, excludes, short-token keep, adaptive threshold, `configQuality` |
| Parse preview | `POST /api/feeds/parse` | dry-run config + quality hint |
| Rank | `src/lib/rank/index.ts` + `tfidf.ts` | lexical + TF-IDF blend, prefs, diversity |
| Cluster | `src/lib/cluster/dedupe.ts` | canonicalize URL, hard dedupe, story clusters |
| Summarise | `src/lib/summarise/index.ts` | AI + extractive + attribution |
| Feedback | `src/lib/feeds/refine.ts` + `setFeedback` | keywords/excludes/threshold + re-rank |
| Schema | `exclude_keywords`, `summary_attribution` | additive SQLite migrations |

## How to run
```bash
npm install
npm test
npm run build && npm start
npm run seed
docker compose up --build
```

## Test evidence (intelligence)
`npm test` — parse / rank / tfidf / dedupe / summarise / refine / feedback integration (+ main’s short-keyword cases).

## Key paths
- `src/lib/feeds/` — parse, refine, service
- `src/lib/rank/` — conventional + TF-IDF
- `src/lib/cluster/` — dedupe + story clusters
- `src/lib/summarise/` — AI + extractive
- `STATUS.md` — honesty board

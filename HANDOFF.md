# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**main HEAD:** final integration (~04:56 NZDT Fri 27 Nov 2026)  
**Hard stop:** ~05:37 NZDT

## Status
All specialist PRs integrated on `main` (#1 QA, #2 ingestion, #4 intelligence, #3 UI). App is cloneable and runnable without credentials.

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev                 # http://localhost:3000 — 4 demo feeds seed on boot
# production:
npm run build && npm start
# tests:
WOM_DISABLE_SCHEDULER=1 npm test
npx playwright install chromium && npm run build && WOM_DISABLE_SCHEDULER=1 npm run test:e2e
# docker (needs Docker host):
docker compose up --build
```

## Test evidence (final integration VM)
| Command / check | Result |
| --- | --- |
| `WOM_DISABLE_SCHEDULER=1 npm test` | **51/51** pass |
| `npm run build` | **green** (Next 15.5.12 standalone) |
| `GET /api/health` | ok; adapters demo/hn/reddit/rss/json-api |
| Pages `/` `/feeds` `/sources` `/search` | **200** |
| `POST /api/feeds` live | ingested with ranked items; source warnings possible (HN/Reddit) |
| Browse feed detail | **200**, items returned |
| `GET /api/search?q=auckland` | **15** hits |
| Share `/api/feeds/:id/share` + `/s/:token` | **200** |
| Feedback `POST .../feedback` | ok + refine keywords |
| Layout guard | `@fontsource` + `AppChrome` (no `next/font/google`) |
| `docker compose` | **not verified** — no Docker on sprint VMs |
| Playwright e2e | **4/4** pass (selectors updated for AppChrome hero) |

## Implemented
NL create → RSS/HN/Reddit/API discover → ingest/normalise → rank/dedupe/cluster → summarise → demo feeds → share/search/feedback → source diagnostics → SSRF → scheduler → harbor-signal UI → CI

## Partial / gaps
- Live upstream flaky (Reddit 403, some RSS/HN parse warnings) — recorded per-source
- Optional AI keys only
- Search links by feed id (cosmetic)
- Docker compose unverified on agent images
- Redis/auth/embeddings deferred

## Owner
[Word of Mouth core](bc-36b64192-691a-5946-9a6e-059fadb961e2)

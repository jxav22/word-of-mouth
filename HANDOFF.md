# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**main HEAD:** `765497d`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~05:01 NZDT  
**Hard stop:** ~05:37 NZDT · final verification ~05:32 NZDT

## Status
Specialist PRs **#1–#5** are on `main`. Product is cloneable and runnable without credentials.

| PR | Role | State |
| --- | --- | --- |
| #1 QA | tests/e2e/CI/fonts | **MERGED** |
| #2 ingestion | adapters/SSRF/scheduler | **MERGED** |
| #4 intelligence | rank/cluster/summarise/feedback | **MERGED** |
| #3 UI | harbor-signal / AppChrome | **MERGED** |
| #5 QA post-merge | e2e selectors + evidence | **MERGED** |

**In flight (do not duplicate on main):** QA+UI on `feat/polish-gaps` — search slug links + clearer per-source create/refresh warnings. Core will merge their PR when CI-green.

Layout rule: keep `@fontsource` + `AppChrome`; **never** reintroduce `next/font/google`.

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev                 # http://localhost:3000 — 4 demo feeds seed on boot
npm run build && npm start
WOM_DISABLE_SCHEDULER=1 npm test
npx playwright install chromium && npm run build && WOM_DISABLE_SCHEDULER=1 npm run test:e2e
# docker compose up --build  # unverified on sprint VMs
```

## Test evidence
| Check | Result |
| --- | --- |
| `npm test` | **51/51** |
| `npm run build` | **green** |
| `npm run test:e2e` | **4/4** |
| Live pages | **200** |
| Live ingest | QA **38/38**; core up to **80** ranked |
| Search `auckland` | **15** hits (slug links already in UI when feeds hydrate) |
| Docker compose | **not verified** |

## Gaps
- Docker compose unverified on agent VMs
- Optional AI keys only; Reddit may 403 from some egress
- Per-source warning UX polish → `feat/polish-gaps` (pending PR)
- Redis / auth / embeddings deferred

## Owner
[Word of Mouth core](bc-36b64192-691a-5946-9a6e-059fadb961e2) owns `main` integration.  
Polish: QA [bc-a5f5c6ca…](bc-a5f5c6ca-3571-53ee-8b1f-51794227a980) + UI [bc-bed2b221…](bc-bed2b221-68b3-52cd-ab30-633f105cb012) on `feat/polish-gaps`.

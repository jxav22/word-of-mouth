# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Working tree:** `/workspace` (owns `main`)
**main HEAD:** `6b40bf1` — foundation leftovers cherry-picked  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:42 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
`main` green and receiving Foundation leftovers (short NL keywords, parse tests, `.dockerignore`). Specialists on feature branches — no open PRs yet; will merge when opened if checks pass.

| Branch / agent | Role |
| --- | --- |
| `main` / [core](bc-36b64192-691a-5946-9a6e-059fadb961e2) | Integration owner |
| `feat/ingestion` / [bc-c331753b…](bc-c331753b-744c-5f9d-b860-7e6d38cf516e) | Ingest / SSRF / adapters |
| `feat/intelligence` / [bc-499283ce…](bc-499283ce-d144-51c7-87d7-a1acd1e2f4ef) | Rank / cluster / summarise / NL |
| `feat/ui` / [bc-bed2b221…](bc-bed2b221-68b3-52cd-ab30-633f105cb012) | UI polish |
| `feat/qa` / [bc-a5f5c6ca…](bc-a5f5c6ca-3571-53ee-8b1f-51794227a980) | Tests / STATUS honesty |
| `foundation/improvements` @ `ef047ac` | Stopped — leftovers cherry-picked onto main |

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev          # http://localhost:3000 — demo feeds seed on boot
npm run build && npm start
docker compose up --build
```

## Test evidence
| Source | Check | Result |
| --- | --- | --- |
| Core (`main`) | `npm test` | **10/10** |
| Core (`main`) | `npm run build` | **green** (Next 15.5.12 standalone) |
| Foundation (their tree) | vitest | **10/10** |
| Foundation | `next build` | OK |
| Foundation | seed | **4 demo feeds** |
| Foundation | live `POST /api/feeds` | ingested **46** items, **0 errors** |
| Playwright e2e | | config present; browsers may need install |
| Docker compose | | Dockerfile + `.dockerignore` present; compose not verified on this VM yet |

## Gaps
- Reddit adapter reserved
- Feedback lightly adjusts threshold
- E2E / Docker compose not yet proven here
- Optional AI only with env keys

## Snapshot
`/cursor/stores/bc-5ef5d8bf-cd17-4012-9c97-2592fe303a01/internal/word-of-mouth-snapshot.tgz` (Foundation-refreshed)

# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**main HEAD:** `db651db`  
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; final verify ~05:07 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
Product work from PRs **#1–#6** is on `main` (feedSlug API + SourceWarningsBanner UX).  
PR **#6** is **closed** (obsolete — halves landed on `main` separately).  
Layout: `@fontsource` + `AppChrome` only — do not reintroduce `next/font/google`.

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev
npm run build && npm start
WOM_DISABLE_SCHEDULER=1 npm test
npx playwright install chromium && npm run build && WOM_DISABLE_SCHEDULER=1 npm run test:e2e
```

## Test evidence (final verify ~05:07 NZDT)
| Check | Result |
| --- | --- |
| `npm test` | **55/55** |
| `npm run build` | green |
| e2e | **4/4** |
| Live ingest | create → ranked **38**; Reddit 403 + HN RSS JSON-parse warnings expected |
| Live search | `feedSlug` present on all `/api/search` hits |
| Live UX | SourceWarningsBanner after create; `/sources` shows error summary |
| Docker | not verified |

## Gaps
- Docker compose unverified
- Optional AI; Reddit egress 403s; occasional HN RSS adapter mismatch

# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~05:02 NZDT  
**Hard stop:** ~05:37 NZDT · final verification ~05:32 NZDT

## Status
| PR | State |
| --- | --- |
| #1–#5 | **MERGED** |
| [#6](https://github.com/jxav22/word-of-mouth/pull/6) `feat/polish-gaps` | **MERGED** feedSlug (`a703c2b`); UI warnings may still land |

Layout: keep `@fontsource` + `AppChrome`; never `next/font/google`.

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

## Test evidence
| Check | Result |
| --- | --- |
| `npm test` (with #6) | **55/55** |
| Prior e2e / build | **4/4** / green |
| Live ingest | QA 38/38; core up to 80 |
| Docker | not verified |

## Remaining
- UI create/refresh per-source warning presentation (same `feat/polish-gaps` branch)
- Docker compose smoke; Reddit/HN harden; deploy

## Owner
Core [bc-36b64192…](bc-36b64192-691a-5946-9a6e-059fadb961e2) · polish QA+UI on `feat/polish-gaps`

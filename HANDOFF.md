# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**main HEAD:** `f8b94c1`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~05:02 NZDT  
**Hard stop:** ~05:37 NZDT · final verification ~05:32 NZDT

## Status
| PR | State |
| --- | --- |
| #1–#5 | **MERGED** |
| [#6](https://github.com/jxav22/word-of-mouth/pull/6) | **Landed on main** (`a703c2b`) — feedSlug API + tests (**55/55**). PR may still show open until GitHub closes; UI source-warning UX can still push to `feat/polish-gaps`. |

Layout: `@fontsource` + `AppChrome` only — never `next/font/google`.

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
| `npm test` | **55/55** (incl. search-slug) |
| build / e2e (prior) | green / **4/4** |
| Live ingest | QA 38/38; core up to 80 |
| Docker | not verified |

## Remaining before hard stop
- UI create/refresh per-source warnings (same branch / follow-up)
- Final verification ~05:32

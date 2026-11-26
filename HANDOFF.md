# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**main HEAD:** `3e1153c`  
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; final verify ~05:07 NZDT  
**Hard stop:** ~05:37 NZDT · this note ~05:15 NZDT

## Status
Product on `main`. PRs **#1–#5** merged; **#6** closed (obsolete); **#7** docs; **#8** Reddit warning classification.  
Post-verify polish: compact HN queries, soft-floor ranking, HN RSS adapter split, Reddit RSS 404-with-Atom handling (in flight / next push).  
Layout: `@fontsource` + `AppChrome` only — never `next/font/google`.

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev
# production:
npm run build && npm start
# tests:
WOM_DISABLE_SCHEDULER=1 npm test
npx playwright install chromium && npm run build && WOM_DISABLE_SCHEDULER=1 npm run test:e2e
```

## Test evidence
| Check | Result |
| --- | --- |
| `npm test` | **68/68** (after #8; local after Reddit path fix) |
| `npm run build` | green |
| e2e | **4/4** |
| Live create (Rust) | ranked **36**; Reddit may 403/429 (banner) |
| Live search / share | `feedSlug` + `/s/:token` **200** |
| Docker | not verified |

## Gaps
- Docker compose unverified on sprint VMs
- Optional AI keys only
- Reddit egress flaky (403/429); demos remain credential-free

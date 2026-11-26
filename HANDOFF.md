# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
 **main HEAD:** `a78192c`  
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; final verify ~05:07 NZDT  
**Hard stop:** ~05:37 NZDT · this note ~05:11 NZDT

## Status
Product on `main`. PRs **#1–#5** merged; **#6** closed (obsolete); **#7** merged (docs).  
Post-verify polish: compact HN Algolia queries, soft-floor ranking, HN RSS adapter fix, eslint cleanup.  
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
| `npm test` (post-polish) | **58/58** |
| `npm run build` | green (no eslint warnings) |
| e2e | **4/4** |
| Live create (Rust feed) | ranked **36**; HN 30 hits; DEV·rust 20; Reddit 403 expected |
| Live search | `feedSlug` on hits |
| Live share | `GET /api/feeds/:id/share` + `/s/:token` **200** |
| Docker | not verified |

## Gaps
- Docker compose unverified on sprint VMs
- Optional AI keys only
- Reddit often 403 (banner surfaces); demos remain credential-free

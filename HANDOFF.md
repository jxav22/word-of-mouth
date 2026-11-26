# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**main HEAD:** `3098bee`  
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; final verify ~05:07 NZDT  
**Hard stop:** ~05:37 NZDT · this note ~05:17 NZDT

## Status
Product on `main`. PRs **#1–#5** merged; **#6** closed; **#7** docs; **#8** Reddit warning classification.  
Post-verify: HN query compact + soft-floor rank + HN RSS split + Reddit 404-Atom + soft-floor UX notes.  
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
| `npm test` | **68/68** |
| `npm run build` | green |
| e2e | **4/4** |
| Live create (Rust) | ranked **36** |
| Docker | not verified |

## Gaps
- Docker compose unverified
- Optional AI; Reddit 403/429 flaky — demos credential-free

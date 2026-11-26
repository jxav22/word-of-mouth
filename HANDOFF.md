# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**main HEAD:** `ee888ea`
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~05:03 NZDT  
**Hard stop:** ~05:37 NZDT · final verification ~05:32 NZDT
## Status
PRs **#1–#6** product work is on `main` (feedSlug + SourceWarningsBanner). Layout: `@fontsource` + `AppChrome` only.
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
| `npm test` | **55/55** (re-verify after warning UX) |
| e2e / build | **4/4** / green (prior) |
| Live ingest | up to 80 ranked; QA 38/38 |
| Docker | not verified |
## Gaps
- Docker compose unverified
- Optional AI; Reddit egress 403s

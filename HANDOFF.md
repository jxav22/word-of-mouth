# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**main HEAD:** `c3fccbf` (`c3fccbfd260f231ba6a232b0a1f3f1516bf92ae5`) — after pull, confirm with `git rev-parse --short HEAD`  
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**Sprint:** ~04:27–05:37 NZDT Fri 27 Nov 2026  
**Freeze:** ~05:31 NZDT (hard stop ~05:37 NZDT)

## Status
Runnable product on `main`. PRs **#1–#5** merged; **#6** closed (obsolete); **#7** docs; **#8** Reddit warning classification.  
Last feature commit before docs freeze train: `66407a7` (Docker HEALTHCHECK).  
Also on main: compact HN queries, soft-floor ranking + UX, HN RSS/Algolia split, Reddit 404-with-Atom, SourceWarningsBanner.  
Layout: `@fontsource` + `AppChrome` only — **never** `next/font/google`.

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev
npm run build && npm start
WOM_DISABLE_SCHEDULER=1 npm test
npx playwright install chromium && npm run build && WOM_DISABLE_SCHEDULER=1 npm run test:e2e
docker compose up --build   # unverified on sprint VMs
```

## Final evidence (~05:31 NZDT)
| Check | Result |
| --- | --- |
| `WOM_DISABLE_SCHEDULER=1 npm test` | **68/68** (20 files) |
| `npm run test:e2e` | **4/4** |
| `npm run build` | green (session) |
| Layout guard | no `next/font/google` |
| Live smoke (session) | health ok; create ranked **36–38**; search `feedSlug`; share **/s/:token** 200 |
| Docker | **not verified** |

## Gaps
- Docker Compose/HEALTHCHECK not executed on agent VMs
- Optional AI keys; extractive summaries without
- Reddit often 403/429 — banner surfaces; demos credential-free

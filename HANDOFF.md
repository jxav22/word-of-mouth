# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Clone:** `git clone https://github.com/jxav22/word-of-mouth.git`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~05:00 NZDT  
**main HEAD:** `674d779`
**Hard stop:** ~05:37 NZDT

## Status
| PR | Branch | State |
| --- | --- | --- |
| [#1](https://github.com/jxav22/word-of-mouth/pull/1) | `feat/qa` | **MERGED** |
| [#2](https://github.com/jxav22/word-of-mouth/pull/2) | `feat/ingestion` | **MERGED** |
| [#4](https://github.com/jxav22/word-of-mouth/pull/4) | `feat/intelligence` | **MERGED** |
| [#3](https://github.com/jxav22/word-of-mouth/pull/3) | `feat/ui` | **MERGED** |
| [#5](https://github.com/jxav22/word-of-mouth/pull/5) | `cursor/qa-postmerge-verify-a980` | **MERGED** onto main (`674d779`) |

Product is cloneable and runnable without credentials. Layout keeps `@fontsource` + `AppChrome` (no `next/font/google`).

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
| `npm run test:e2e` | **4/4** (AppChrome-aware selectors) |
| Live pages `/` `/feeds` `/sources` `/search` | **200** |
| Live create+ingest (QA) | **38/38** ranked; non-fatal HN/Reddit warnings |
| Live create+ingest (core) | up to **80** ranked; search `auckland` → 15; share 200 |
| PR #5 CI | **green** |
| Docker compose | **not verified** |

## Gaps
- Docker compose not verified on agent VMs
- Optional AI keys only; Reddit may 403 from some egress
- Live ingest may report non-fatal source errors while still ranking
- Search already links by slug when feeds loaded; polish continues on `feat/polish-gaps`

## Owner
[Word of Mouth core](bc-36b64192-691a-5946-9a6e-059fadb961e2) · QA [Product verification](bc-a5f5c6ca-3571-53ee-8b1f-51794227a980)

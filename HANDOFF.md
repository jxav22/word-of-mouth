# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**main HEAD verified:** `5837845` (all specialist PRs merged)  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; QA re-verify ~04:57 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
| PR | Branch | State |
| --- | --- | --- |
| [#1](https://github.com/jxav22/word-of-mouth/pull/1) | `feat/qa` | **MERGED** |
| [#2](https://github.com/jxav22/word-of-mouth/pull/2) | `feat/ingestion` | **MERGED** |
| [#4](https://github.com/jxav22/word-of-mouth/pull/4) | `feat/intelligence` | **MERGED** |
| [#3](https://github.com/jxav22/word-of-mouth/pull/3) | `feat/ui` | **MERGED** |

Post-merge QA re-verify on `5837845` (this note): vitest / build / e2e / live smoke **green** after fixing e2e selectors for UI rename.

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev          # http://localhost:3000 — demo feeds seed on boot
WOM_DISABLE_SCHEDULER=1 npm test
npm run build && npm start
npx playwright install chromium && npm run test:e2e
# docker compose up --build  # unverified on sprint VMs (no Docker)
```

## Product slice on main
- NL feed create → discover (RSS/HN/Reddit/API) → ingest/normalise → rank/dedupe/cluster → summarise
- Demo mode (4 feeds) · share/search/feedback · source diagnostics · SSRF · scheduler
- Distinctive harbor-signal UI via `AppChrome` · self-hosted Fraunces/Sora (`@fontsource`)

## Post-merge verification (QA VM, ~04:54–04:57 NZDT)
| Check | Result |
| --- | --- |
| `npm test` | **51/51** |
| `npm run build` | **green** (eslint unused-directive warnings only) |
| `npm run test:e2e` | **4/4** after selector fix (see below) |
| Live `GET /api/health` | ok; 4+ feeds; adapters listed |
| Live pages `/` `/feeds` `/sources` `/search` | **200** |
| Live `POST /api/feeds` ingest | **38 ingested / 38 ranked**; upstream warnings: HN RSS JSON parse, Reddit 403/404 |
| Docker compose | **not verified** — no Docker on VM |

## Regressions found / fixed
- E2E expected heading `Source diagnostics` → UI now `Sources` — **fixed in follow-up PR**
- E2E `getByLabel('What should we listen for?')` broken: copy is now an `h2`; field label is `Natural language query`; custom title is behind `+ Add a custom title` — **fixed in follow-up PR**

## Gaps
- Docker compose not verified on agent VMs
- Optional AI keys only; Reddit may 403 from some egress
- Live ingest may report non-fatal source errors while still ranking items
- Build emits unused `eslint-disable` warnings (`search/page.tsx`, `diagnostics.ts`, `scheduler.ts`) — non-blocking

## Owner
[Word of Mouth core](bc-36b64192-691a-5946-9a6e-059fadb961e2) · QA re-verify [Product verification](bc-a5f5c6ca-3571-53ee-8b1f-51794227a980)

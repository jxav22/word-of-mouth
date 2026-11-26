# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**main:** final integration (all specialist PRs landing)  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:53 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
| PR | Branch | State |
| --- | --- | --- |
| [#1](https://github.com/jxav22/word-of-mouth/pull/1) | `feat/qa` | **MERGED** |
| [#2](https://github.com/jxav22/word-of-mouth/pull/2) | `feat/ingestion` | **MERGED** onto main |
| [#4](https://github.com/jxav22/word-of-mouth/pull/4) | `feat/intelligence` | **MERGED** onto main |
| [#3](https://github.com/jxav22/word-of-mouth/pull/3) | `feat/ui` | merging — **fontsource + AppChrome** kept in `layout.tsx` |

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

## Gaps
- Docker compose not verified on agent VMs
- Optional AI keys only; Reddit may 403 from some egress
- Search links by feed id (cosmetic)

## Owner
[Word of Mouth core](bc-36b64192-691a-5946-9a6e-059fadb961e2)

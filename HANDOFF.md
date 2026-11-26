# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Branch (ingestion):** `feat/ingestion` → PR into `main`  
**Sprint clock:** hard stop ~05:37 NZDT Fri 27 Nov 2026

## Ingestion ownership (`feat/ingestion`)
- Extensible adapters: `src/lib/sources/{registry,types,rss,hn,reddit,json-api,demo}.ts`
- Normalise: `src/lib/ingest/normalize.ts`
- Pipeline + per-source refresh: `src/lib/ingest/pipeline.ts`
- Diagnostics ring buffer: `src/lib/ingest/diagnostics.ts`
- SSRF: `src/lib/security/ssrf.ts`
- Scheduler: `src/workers/scheduler.ts` (node-cron, due-feed selection)
- APIs: `/api/sources`, `/api/sources/:id`, `/api/sources/:id/refresh`, `/api/ingest/status`
- UI: `/sources` management + diagnostics

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev          # http://localhost:3000 — demo feeds seed on boot
WOM_DISABLE_SCHEDULER=1 npm test
# or
npm run build && npm start
docker compose up --build
```

## Env knobs (ingestion)
- `WOM_DISABLE_SCHEDULER=1` — skip in-process cron
- `WOM_REFRESH_MINUTES` — cron cadence (default 30, min 5)
- `WOM_REFRESH_DEMO=1` — include demo feeds in scheduled refresh

## Test evidence
- `WOM_DISABLE_SCHEDULER=1 npm test` — 16/16 passing (unit + integration)

## Other tracks
- Intelligence / frontend / QA should merge against `main` after this PR or stack carefully; avoid rewriting ingest adapters.
- See STATUS.md for implemented vs partial.

## Key paths
- `src/lib/sources/` — adapters
- `src/lib/ingest/` — pipeline, normalise, diagnostics
- `src/lib/security/ssrf.ts`
- `src/workers/scheduler.ts`
- `src/app/sources/` + `src/app/api/sources/` + `src/app/api/ingest/`

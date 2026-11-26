# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**main:** merging specialist PRs (PR #1 merged; #2 ingestion in progress)  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:50 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
| PR | Branch | State |
| --- | --- | --- |
| [#1](https://github.com/jxav22/word-of-mouth/pull/1) | `feat/qa` | **MERGED** (fontsource + tests/e2e/CI) |
| [#2](https://github.com/jxav22/word-of-mouth/pull/2) | `feat/ingestion` | merging into main (conflicts only in docs) |
| [#4](https://github.com/jxav22/word-of-mouth/pull/4) | `feat/intelligence` | next |
| [#3](https://github.com/jxav22/word-of-mouth/pull/3) | `feat/ui` | after #4 |

| Stream | Agent | Branch |
| --- | --- | --- |
| Main / integrate | [Word of Mouth core](bc-36b64192-691a-5946-9a6e-059fadb961e2) | `main` |
| Ingestion | [Ingestion pipeline](bc-c331753b-744c-5f9d-b860-7e6d38cf516e) | `feat/ingestion` |
| Intelligence | [Feed intelligence](bc-499283ce-d144-51c7-87d7-a1acd1e2f4ef) | `feat/intelligence` |
| Frontend | [Feed interface](bc-bed2b221-68b3-52cd-ab30-633f105cb012) | `feat/ui` |
| QA | [Product verification](bc-a5f5c6ca-3571-53ee-8b1f-51794227a980) | `feat/qa` |

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev          # http://localhost:3000 — demo feeds seed on boot
WOM_DISABLE_SCHEDULER=1 npm test
npm run build && npm start
# docker compose up --build   # needs Docker; unverified on sprint VMs
npx playwright install chromium && npm run test:e2e
```

## Env knobs
- `WOM_DISABLE_SCHEDULER=1` — skip in-process cron
- `WOM_REFRESH_MINUTES` — cron cadence (default 30, min 5)
- `WOM_REFRESH_DEMO=1` — include demo feeds in scheduled refresh
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — optional AI summaries

## Ingestion (from #2)
- Adapters: `src/lib/sources/{registry,rss,hn,reddit,json-api,demo}.ts`
- Normalise + pipeline + diagnostics: `src/lib/ingest/`
- SSRF: `src/lib/security/ssrf.ts`
- Scheduler: `src/workers/scheduler.ts`
- APIs: `/api/sources`, `/api/sources/:id`, `/api/sources/:id/refresh`, `/api/ingest/status`

## Test evidence
| Source | Check | Result |
| --- | --- | --- |
| QA / Core | `npm test` | **16/16** |
| After fontsource | `npm run build` / e2e | **green** / **4/4** |
| PR #1 Actions | CI | **green** then merged |
| Live ingest (prior) | POST /api/feeds | up to **80 / 0 errors** |
| Docker compose | | **not verified** — no Docker on VMs |

## Gaps
- Intelligence feedback refine / richer NL (PR #4)
- UI polish (PR #3)
- Compose smoke needs a Docker host
- Optional AI keys only

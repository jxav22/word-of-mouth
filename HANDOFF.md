# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**main (origin):** `748aafb` (awaiting PR #1 merge)  
**PR #1:** https://github.com/jxav22/word-of-mouth/pull/1 (`feat/qa`)  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:47 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
- PR #1 CI **failed** on `next/font` Google loader (`Cannot read properties of null`) during `npm run build` (tests had passed).
- Core fix in flight on `feat/qa`: switch to bundled `@fontsource/fraunces` + `@fontsource/sora` (no Google fetch at build). Local: **build green**, vitest **16/16**.
- Will merge PR #1 into `main` when CI is green. Docker compose still **unverified** (no Docker on agent VMs).

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
npm run dev
npm run build && npm start
# docker compose up --build   # needs Docker; unverified on sprint VMs
npx playwright install chromium && npm run test:e2e
```

## Test evidence
| Source | Check | Result |
| --- | --- | --- |
| Core / QA local | `npm test` | **16/16** |
| Core local (font fix) | `npm run build` | **green** (bundled fonts) |
| Core local (font fix) | `npm run test:e2e` | **4/4** |
| QA prior | e2e / live ingest | **4/4**, **44 ingested / 0 errors** |
| Core prior | live ingest | up to **80 / 0 errors** |
| GitHub Actions PR #1 | build | **failed** (google font loader) → fix pushed |
| Docker compose | | **not verified** — no `docker` on VMs |

## Gaps
- Reddit adapter reserved (ingestion)
- Light feedback refine (intelligence)
- Compose smoke needs a Docker host
- Optional AI keys only

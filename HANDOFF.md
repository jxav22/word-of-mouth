# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Working tree:** `/workspace`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:41 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
Vertical slice on `main` (push confirmed). Build green. Vitest 8/8 green. Core continuing polish (UI, e2e, STATUS honesty).

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev          # http://localhost:3000 — demo feeds seed on boot
npm run build && npm start
docker compose up --build
```

## Test evidence
| Check | Result |
| --- | --- |
| `npm test` (vitest unit+integration) | **8/8 pass** |
| `npm run build` | **green** (Next.js 15.5.12 standalone) |
| Playwright e2e | browsers may need `npx playwright install`; config present |
| Docker compose | Dockerfile present; not verified in this VM yet |

## Implemented
NL create → RSS/HN discover → ingest → rank/dedupe/summarise → 4 demo feeds → share/search/feedback → source diagnostics → SSRF → scheduler → Docker files → tests.

## Gaps / partial
- Reddit adapter reserved, not implemented
- Live RSS quality depends on upstreams
- Feedback lightly adjusts threshold only
- E2E not yet proven in CI/this VM
- Optional AI keys only; extractive fallback default

## Owner
[Word of Mouth core](bc-36b64192-691a-5946-9a6e-059fadb961e2) — remote + polish  
Snapshot from [Foundation scaffold](bc-bcf367bd-4a98-5c7b-8b12-ca5af68df940)

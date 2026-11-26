# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**QA branch:** `feat/qa` → PR into `main`  
**Synced main base:** `748aafb`  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; QA evidence ~04:45 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
Vertical slice is on `main` and cloneable. QA expanded unit/integration/e2e coverage, wired Playwright into CI, and re-verified the run path on a clean agent VM. **Docker Compose was not run** — this VM has no Docker binary/socket; files exist but are unverified.

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
# or
npm run build && npm start   # scripts/start.sh (standalone-aware)
# or (needs Docker)
docker compose up --build
```

Playwright (first time on a machine):
```bash
npx playwright install chromium
npm run build && npm run test:e2e
```

## Test evidence
| Source | Check | Result |
| --- | --- | --- |
| Core `main` (prior) | `npm test` / build / live ingest | **10/10**, green, up to **80 ingested / 0 errors** |
| QA `feat/qa` | `npm test` | **16/16 pass** (added sanitize, summarise, feedback/share) |
| QA | `npm run build` | **green** (Next 15.5.12 standalone) |
| QA | `npm run seed` | **4 demo feeds** |
| QA | `npm start` + curl | health ok; `/` 200 |
| QA | live `POST /api/feeds` | **ingested 44 / ranked 44 / errors []** |
| QA | feedback + share APIs | **ok** |
| QA | `npm run test:e2e` | **4/4 pass** (home, health, sources/search, create→detail) |
| QA | CI workflow | test + build + Playwright chromium e2e |
| Docker compose | | **not verified** — no `docker` on QA VM |

## Implemented / partial / unimplemented
See [STATUS.md](./STATUS.md).

- **Implemented:** NL create → RSS/HN discover → ingest → rank/dedupe/summarise → demo feeds → share/search/feedback → SSRF → scheduler → Docker files → CI (test/build/e2e)
- **Partial:** live RSS quality, light feedback refine, optional AI keys, search links by feed id
- **Unimplemented:** Reddit adapter, Redis queue, auth, embeddings, proven compose smoke

## Defects
- No blocking product defects found in QA pass
- Compose unverified in this environment

## Snapshot
`/cursor/stores/bc-5ef5d8bf-cd17-4012-9c97-2592fe303a01/internal/word-of-mouth-snapshot.tgz`

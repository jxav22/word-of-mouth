# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Working tree:** `/workspace` (owns `main`)  
**main HEAD:** `052d356` — CI + standalone start + foundation leftovers  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:44 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
`main` green. Foundation leftovers cherry-picked (`ef047ac` → short NL keywords, parse tests, `.dockerignore`). Specialists on feature branches — **no open PRs / remote feat/* branches yet**; will merge when opened if CI/tests pass. Core stays on highest-impact main-only fixes (no feat/* collision).

| Branch / agent | Role |
| --- | --- |
| `main` / [core](bc-36b64192-691a-5946-9a6e-059fadb961e2) | Integration owner |
| `feat/ingestion` / [bc-c331753b…](bc-c331753b-744c-5f9d-b860-7e6d38cf516e) | Ingest / SSRF / adapters |
| `feat/intelligence` / [bc-499283ce…](bc-499283ce-d144-51c7-87d7-a1acd1e2f4ef) | Rank / cluster / summarise / NL |
| `feat/ui` / [bc-bed2b221…](bc-bed2b221-68b3-52cd-ab30-633f105cb012) | UI polish |
| `feat/qa` / [bc-a5f5c6ca…](bc-a5f5c6ca-3571-53ee-8b1f-51794227a980) | Tests / STATUS honesty |
| `foundation/improvements` @ `ef047ac` | Stopped — leftovers on main |

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
| Source | Check | Result |
| --- | --- | --- |
| Core `main` | `npm test` | **10/10** |
| Core `main` | `npm run build` | **green** |
| Core smoke | `GET /api/health` | ok; 4 demo feeds seeded |
| Core smoke | `POST /api/feeds` “Latest AI systems and NZ developer tooling” | **ingested 80, ranked 83, errors []**; keywords `ai`,`nz` |
| Foundation tree | vitest / build / seed | **10/10**, OK, **4 demos** |
| Foundation | live `POST /api/feeds` | **46 ingested, 0 errors** |
| CI | `.github/workflows/ci.yml` | added (test + build on push/PR) |
| Playwright e2e | | config present; browsers may need install |
| Docker compose | | Dockerfile + `.dockerignore` present |

## Gaps
- Reddit adapter reserved (ingestion)
- Feedback lightly adjusts threshold (intelligence)
- E2E / Docker compose not fully proven here (QA)
- Optional AI only with env keys

## Snapshot
`/cursor/stores/bc-5ef5d8bf-cd17-4012-9c97-2592fe303a01/internal/word-of-mouth-snapshot.tgz`

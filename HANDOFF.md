# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**PR #1:** https://github.com/jxav22/word-of-mouth/pull/1 (`feat/qa`) — **merged** into `main` at `292c26b`  
**main (origin):** includes QA merge + later ingestion (`5437221`)  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:50 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
- PR #1 first CI run **failed** at `npm run build` (`next/font/google` loader null; vitest had passed).
- Fixed with `@fontsource/fraunces` + `@fontsource/sora`. Actions on `bbe67f2` **green** (test + build + e2e).
- Core merged PR #1. Docker compose still **unverified** (no Docker on agent VMs).

| Stream | Agent | Branch |
| --- | --- | --- |
| Main / integrate | [Word of Mouth core](bc-36b64192-691a-5946-9a6e-059fadb961e2) | `main` |
| Ingestion | [Ingestion pipeline](bc-c331753b-744c-5f9d-b860-7e6d38cf516e) | `feat/ingestion` (merged #2) |
| Intelligence | [Feed intelligence](bc-499283ce-d144-51c7-87d7-a1acd1e2f4ef) | `feat/intelligence` |
| Frontend | [Feed interface](bc-bed2b221-68b3-52cd-ab30-633f105cb012) | `feat/ui` |
| QA | [Product verification](bc-a5f5c6ca-3571-53ee-8b1f-51794227a980) | `feat/qa` (merged #1) |

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
| QA / Core local | `npm test` | **16/16** |
| Local after font fix | `npm run build` | **green** (`@fontsource`) |
| Local after font fix | `npm run test:e2e` | **4/4** |
| QA prior | live ingest | **44 ingested / 0 errors** |
| Core prior | live ingest | up to **80 / 0 errors** |
| Actions [45852186443](https://github.com/jxav22/word-of-mouth/actions/runs/45852186443) | first build | **failed** (google font loader) |
| Actions [45852716957](https://github.com/jxav22/word-of-mouth/actions/runs/45852716957) | after fontsource | **green** (`bbe67f2`) |
| Docker compose | | **not verified** |

## Gaps
- Reddit adapter may still be partial (see ingestion PR)
- Light feedback refine (intelligence)
- Compose smoke needs a Docker host
- Optional AI keys only

## Snapshot
`/cursor/stores/bc-5ef5d8bf-cd17-4012-9c97-2592fe303a01/internal/word-of-mouth-snapshot.tgz`

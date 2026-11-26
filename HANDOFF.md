# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Local path:** `/agent/repos/word-of-mouth`  
**Snapshot:** `/cursor/stores/bc-5ef5d8bf-cd17-4012-9c97-2592fe303a01/internal/word-of-mouth-snapshot.tgz`  
**Updated:** Fri 27 Nov 2026 ~04:41 NZDT

## Ownership
- `origin/main` owned by **Word of Mouth core** (`bc-36b64192-691a-5946-9a6e-059fadb961e2`) — do not force-push
- Foundation worker refreshes snapshot for core merge; may push `foundation/improvements` PR branch only

## How to run
```bash
cd /agent/repos/word-of-mouth
npm install
npm run build && npm start   # http://localhost:3000
npm run seed                 # optional explicit demo seed
docker compose up --build
```

## Verified (NZDT ~04:40)
| Check | Result |
| --- | --- |
| `npm test` | **8/8 pass** |
| `npm run build` | **SUCCESS** Next 15.5.12 |
| `npm run seed` | **4 demo feeds** |
| `npm start` + `/api/health` | ok, 4 feeds / 11+ articles |
| `POST /api/feeds` live | **ingested 46, ranked 46, errors []** (AI tooling pulse) |
| Search `Auckland` | 4 hits |
| Sources summary | ok:7 error:0 pending:4 |

## Snapshot for core
```bash
tar -xzf /cursor/stores/bc-5ef5d8bf-cd17-4012-9c97-2592fe303a01/internal/word-of-mouth-snapshot.tgz -C /tmp/wom-snap
```

## Optional PR branch
```bash
git checkout -b foundation/improvements
git push -u origin foundation/improvements
gh pr create --base main --head foundation/improvements --title "Foundation vertical slice"
```

## Gaps
- Playwright e2e not run; Reddit adapter unimplemented; feedback refine is light
- Main push deferred to core

## Key paths
`/agent/repos/word-of-mouth/src/lib/`, `src/app/`, `Dockerfile`, `tests/`, `STATUS.md`

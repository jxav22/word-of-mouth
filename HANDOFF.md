# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Working tree:** `/workspace` (repo-backed cloud agent with push credentials)  
**Snapshot source:** `/cursor/stores/bc-5ef5d8bf-cd17-4012-9c97-2592fe303a01/internal/word-of-mouth-snapshot.tgz`  
**Sprint clock:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:40 NZDT

## Status
Vertical slice unpacked from Foundation snapshot onto `main`. Push in progress / landing now. Parallel specialists may start from `main` after push confirmed.

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev          # http://localhost:3000 — demo feeds seed on boot
# or
npm run build && npm start
# or
docker compose up --build
```

## Implemented / partial / unimplemented
See STATUS.md. Vertical slice in-tree: APIs, UI, demo seed, security, Docker, tests scaffolded.

## Test evidence
Build/test verification continuing after push; update this section when green.

## Owner
[Word of Mouth core](bc-36b64192-691a-5946-9a6e-059fadb961e2) owns remote push and continuous polish.
Foundation snapshot authored by [Foundation scaffold](bc-bcf367bd-4a98-5c7b-8b12-ca5af68df940).

## Key paths
- `src/lib/` — core
- `src/app/` — UI + API
- `Dockerfile` / `docker-compose.yml`
- `tests/`

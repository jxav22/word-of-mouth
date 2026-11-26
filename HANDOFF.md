# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
**Local path:** `/agent/repos/word-of-mouth`  
**Snapshot:** `/cursor/stores/bc-5ef5d8bf-cd17-4012-9c97-2592fe303a01/internal/word-of-mouth-snapshot.tgz`  
**Sprint clock:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:37 NZDT

## How to run
```bash
cd /agent/repos/word-of-mouth
npm install
npm run dev          # http://localhost:3000 — demo feeds seed on boot
# or
npm run build && npm start
# or
docker compose up --build
```

## Push commands (when credentials have write)
```bash
cd /agent/repos/word-of-mouth
git init   # if needed
git remote add origin https://github.com/jxav22/word-of-mouth.git || git remote set-url origin https://github.com/jxav22/word-of-mouth.git
git add -A
git commit -m "feat: Word of Mouth vertical slice"
git branch -M main
git push -u origin main
# empty remote only if needed:
# git push --force-with-lease origin main
```

**Current blocker:** `gh` logged in as Cursor integration; `permissions.push=false` on the repo. Repo-backed worker with push creds should unpack the snapshot and push.

## Unpack snapshot
```bash
mkdir -p /agent/repos/word-of-mouth
tar -xzf /cursor/stores/bc-5ef5d8bf-cd17-4012-9c97-2592fe303a01/internal/word-of-mouth-snapshot.tgz -C /agent/repos/word-of-mouth
cd /agent/repos/word-of-mouth && npm install && npm run build
```

## Implemented / partial / unimplemented
See STATUS.md. Vertical slice is in-tree: APIs, UI, demo seed, security, Docker, tests scaffolded. Build/test verification in progress.

## Test evidence
Pending first green `npm run build` + `npm test` in this turn — update after.

## Key paths
- `/agent/repos/word-of-mouth/src/lib/` — core
- `/agent/repos/word-of-mouth/src/app/` — UI + API
- `/agent/repos/word-of-mouth/Dockerfile`
- `/agent/repos/word-of-mouth/tests/`

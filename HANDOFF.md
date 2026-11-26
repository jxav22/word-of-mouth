# HANDOFF — Word of Mouth (foundation wrap)

**Repo:** https://github.com/jxav22/word-of-mouth  
**Updated:** Fri 27 Nov 2026 ~04:42 NZDT

## Ownership
- `main` owned by **core** (snapshot landed as `538b480`)
- Specialists own `feat/*` PRs
- Foundation leftover fixes on branch **`foundation/improvements`** (non-main)

## How to run
```bash
cd /agent/repos/word-of-mouth   # or clone
npm install && npm run build && npm start
```

## Verified by foundation
- vitest **10/10** (after parse tests)
- `npm run build` OK
- demo seed ×4; live `POST /api/feeds` ingested 46 with 0 errors

## Leftover delta on `foundation/improvements` (if not yet in main)
- Keep short keywords (`ai`, `ml`, `nz`, …) in NL parse
- `tests/unit/parse.test.ts`
- `.dockerignore`

Core/specialists: cherry-pick or ignore if already superseded by `538b480`.
Snapshot refresh skipped unless unique unpushed value remains after this push.

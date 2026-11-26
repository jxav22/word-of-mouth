# HANDOFF — Word of Mouth (UI)

**Repo:** https://github.com/jxav22/word-of-mouth  
**Branch:** `feat/ui` → PR into `main`  
**Working tree:** `/agent/repos/word-of-mouth`  
**Updated:** Fri 27 Nov 2026 ~04:50 NZDT  
**PR:** https://github.com/jxav22/word-of-mouth/pull/3  
**Hard stop:** ~05:37 NZDT

## Ownership
- UI polish owned by frontend worker on `feat/ui`
- Do **not** force-push `main`
- Core ingest/rank libraries left intact except presentation wiring
- Fonts: align with QA (`@fontsource/fraunces` + `@fontsource/sora`) — **no `next/font/google`** (CI fails offline)

## How to run
```bash
cd /agent/repos/word-of-mouth
git checkout feat/ui
npm install
npm run build && npm start   # http://localhost:3000
npm run seed                 # optional explicit demo seed
```

## UI shipped on this branch
| Surface | Notes |
| --- | --- |
| Home hero | Full-bleed dark harbor-signal; brand hero-level; CTA → `#create` |
| Create feed | Below fold; examples; optional title disclosure; live-ingest badge |
| Feeds browse | Dense list + Demo/Live badges |
| Feed detail | Mode badge, progressive keywords, sources aside, filter + score bars |
| Item detail | Summary rail, why-ranked disclosure, feedback + share |
| Search | Cross-feed; Demo/Live; links via feed slug |
| Sources | Mobile cards + desktop table; feed mode badges |
| Share `/s/:token` | Read-only shared feed with mode label |

## Coordination
| Stream | Branch |
| --- | --- |
| QA font fix + tests | `feat/qa` (PR #1) — same `@fontsource` approach |
| Frontend polish | `feat/ui` (this branch) — AppChrome + harbor hero; adopts QA fonts |

## Gaps / handoff
- Visual browser walkthrough in progress
- QA owns Playwright e2e green
- Intelligence owns feedback refine depth

## Key paths
`src/app/`, `src/components/`, `src/app/globals.css`, `STATUS.md`

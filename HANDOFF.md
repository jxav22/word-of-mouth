# HANDOFF — Word of Mouth (UI)

**Repo:** https://github.com/jxav22/word-of-mouth  
<<<<<<< HEAD
**main:** integrating specialists  
**Sprint:** started ~04:27 NZDT Fri 27 Nov 2026; this note ~04:52 NZDT  
**Hard stop:** ~05:37 NZDT

## Status
| PR | Branch | State |
| --- | --- | --- |
| [#1](https://github.com/jxav22/word-of-mouth/pull/1) | `feat/qa` | **MERGED** |
| [#2](https://github.com/jxav22/word-of-mouth/pull/2) | `feat/ingestion` | **MERGED** onto main |
| [#4](https://github.com/jxav22/word-of-mouth/pull/4) | `feat/intelligence` | merging now |
| [#3](https://github.com/jxav22/word-of-mouth/pull/3) | `feat/ui` | next — keep **fontsource** + **AppChrome** in layout |
=======
**Branch:** `feat/ui` → PR into `main`  
**Working tree:** `/agent/repos/word-of-mouth`  
**Updated:** Fri 27 Nov 2026 ~04:48 NZDT  
**Hard stop:** ~05:37 NZDT

## Ownership
- UI polish owned by frontend worker on `feat/ui`
- Do **not** force-push `main`
- Core ingest/rank libraries left intact except presentation wiring
- Fonts: align with QA (`@fontsource/fraunces` + `@fontsource/sora`) — **no `next/font/google`** (CI fails offline)
>>>>>>> 65c0fc5 (docs: update HANDOFF and STATUS for feat/ui polish)

## How to run
```bash
cd /agent/repos/word-of-mouth
git checkout feat/ui
npm install
<<<<<<< HEAD
npm run dev
WOM_DISABLE_SCHEDULER=1 npm test
npm run build && npm start
npx playwright install chromium && npm run test:e2e
```

## Layout merge rule (PR #3)
Keep `@fontsource` imports (no `next/font/google`) **and** UI `AppChrome` shell in `layout.tsx`.

## Test evidence
| Check | Result |
| --- | --- |
| After ingestion | vitest **24/24**, build green |
| PR #1 / #4 CI | green |
| Docker compose | not verified |
=======
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
>>>>>>> 65c0fc5 (docs: update HANDOFF and STATUS for feat/ui polish)

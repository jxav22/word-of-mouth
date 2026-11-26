# HANDOFF — Word of Mouth (UI)

**Repo:** https://github.com/jxav22/word-of-mouth  
**Branch:** `feat/ui` → PR https://github.com/jxav22/word-of-mouth/pull/3  
**Working tree:** `/agent/repos/word-of-mouth`  
**Updated:** Fri 27 Nov 2026 ~04:54 NZDT  
**Hard stop:** ~05:37 NZDT

## Ownership
- UI polish on `feat/ui`
- Do **not** force-push `main`
- Fonts: `@fontsource/fraunces` + `@fontsource/sora` + **AppChrome** (no `next/font/google`)
- Rebased onto `main` after intelligence #4 merge (`21a561b`)

## How to run
```bash
cd /agent/repos/word-of-mouth
git checkout feat/ui
npm install
npm run build && npm start   # http://localhost:3000
npm run seed
```

## UI shipped
| Surface | Notes |
| --- | --- |
| Home hero | Full-bleed harbor-signal; brand hero-level; CTA → `#create` |
| Create | Below fold; examples; optional title disclosure |
| Feeds / detail / item | Dense lists; ModeBadge; exclude-keywords disclosure |
| Search | Slug links; `/search?q=` bookmarks |
| Sources | Ingestion diagnostics + ModeBadge + mobile cards |
| Share `/s/:token` | Read-only shared feed |

## Merge tip (`layout.tsx`)
Keep **fontsource imports + `AppChrome`**. Do not reintroduce Google loader or classic SiteHeader+main shell.

## Key paths
`src/app/`, `src/components/`, `src/app/globals.css`, `STATUS.md`

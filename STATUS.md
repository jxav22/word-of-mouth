# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:56 NZDT (final integration)

## Implemented
- Next.js 15 App Router + TypeScript + Tailwind + SQLite (Drizzle / better-sqlite3)
- NL parse → keywords / topics / excludeKeywords / source discovery
- Ingest adapter registry: rss, hn, reddit, json-api, demo + normalise + diagnostics
- Strengthened SSRF; node-cron due-feed scheduler; source management APIs
- Rank + feedback refine; hard dedupe + soft clusters; summarise + attribution
- UI: harbor-signal design, `AppChrome`, create/browse/search/share/sources
- Demo seed (4 labelled feeds); GitHub Actions CI; `@fontsource` Fraunces/Sora

## Partial
- Live ingest quality depends on upstreams; Reddit may 403 from some egress IPs
- Optional AI summarise only with `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
- Search result links use feed **id** not slug (works; cosmetic)
- Docker Compose files present but **not run** on sprint agent VMs (no Docker)

## Unimplemented / deferred
- Redis / distributed job queue
- Auth / multi-user accounts
- Embedding-based ranking

## Defects
- None blocking clone → `npm install` → `npm run dev`
- Do **not** reintroduce `next/font/google` (CI failure); keep `@fontsource` + `AppChrome`

## Verification (commands)
```bash
WOM_DISABLE_SCHEDULER=1 npm test          # 51/51
npm run build                             # green
npm start                                 # then curl /api/health, POST /api/feeds, search, share
```

Live smoke (NZDT ~04:55–04:57): health ok; pages 200; create feed ranked items; search `auckland` → 15; share 200; feedback refine ok; Playwright **4/4**

## Roadmap
1. Prove `docker compose up --build` on a Docker host
2. Harden Reddit/HN failure UX; clearer per-source warnings in create flow
3. Deploy (Vercel or compose)
4. Richer embedding rank if time/budget

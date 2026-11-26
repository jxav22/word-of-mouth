# STATUS — Word of Mouth

Updated: 2026-11-27 ~04:52 NZDT (main: QA + ingestion; intelligence merging)

## Implemented
- Next.js 15 + TS + Tailwind + SQLite/Drizzle
- NL parse with exclude keywords; ingest registry (rss/hn/reddit/api/demo)
- SSRF hardened; diagnostics; source APIs; node-cron scheduler
- Rank + feedback prefs; dedupe/cluster; summarise + attribution
- Demo feeds; CI; `@fontsource` fonts

## Partial
- Live upstream quality / Reddit egress
- Optional AI keys; search links by id; Docker unverified

## Unimplemented
- Redis/auth/embeddings/distributed scheduler

## Verification
- Ingestion merge: 24/24 + build green
- Intelligence: resolving; feedback-share test under fix

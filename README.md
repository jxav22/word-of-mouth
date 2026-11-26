# Word of Mouth

Natural-language feed creation → discover/ingest sources → rank/dedupe/summarise → browseable personalised feeds.

**Demo mode needs zero credentials.** Optional `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` upgrade summaries; without them, extractive summaries still work.

## Quick start

```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Four demo feeds seed automatically on first boot.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build + serve |
| `npm test` | Unit + integration (vitest) |
| `npm run test:e2e` | Playwright smoke (needs build/start) |
| `npm run seed` | Seed demo feeds into SQLite |
| `docker compose up --build` | Containerised app on `:3000` |

### Docker

```bash
docker compose up --build
```

SQLite persists in the `wom-data` volume.

### Optional AI

```bash
export OPENAI_API_KEY=...        # or ANTHROPIC_API_KEY
npm run dev
```

## What works

- `POST /api/feeds` NL parse → keywords/topics → RSS/HN discovery → ingest → rank/dedupe → extractive (or AI) summary
- Persistent SQLite (`data/word-of-mouth.db`)
- Demo feeds: employment, tech, industry intel, Auckland/NZ events (clearly labelled)
- Browse feed, item detail, search, share link, source diagnostics, up/down feedback
- SSRF guards on fetches, HTML sanitisation, prompt fencing
- In-process refresh scheduler

See [STATUS.md](./STATUS.md) and [HANDOFF.md](./HANDOFF.md) for honesty on partials and gaps.

## Push / recreate (maintainers)

```bash
cd /agent/repos/word-of-mouth   # or your clone
git remote add origin https://github.com/jxav22/word-of-mouth.git  # or set-url
git branch -M main
git push -u origin main
# If creating fresh:
# gh repo create jxav22/word-of-mouth --public --source=. --remote=origin --push
```

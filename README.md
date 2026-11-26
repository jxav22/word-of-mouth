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

### Production

```bash
npm run build
npm start
```

### Tests

```bash
WOM_DISABLE_SCHEDULER=1 npm test
npx playwright install chromium   # first time
npm run build && WOM_DISABLE_SCHEDULER=1 npm run test:e2e
```

### Docker

```bash
docker compose up --build
```

SQLite persists in the `wom-data` volume. **Note:** compose was not verified on the sprint agent VMs (no Docker binary).

### Optional AI

```bash
export OPENAI_API_KEY=...        # or ANTHROPIC_API_KEY
npm run dev
```

### Useful env

| Variable | Purpose |
| --- | --- |
| `WOM_DISABLE_SCHEDULER=1` | Skip in-process cron (tests) |
| `WOM_REFRESH_MINUTES` | Scheduler cadence (default 30) |
| `WOM_REFRESH_DEMO=1` | Include demo feeds in scheduled refresh |
| `WOM_DATA_DIR` / `WOM_DB_PATH` | SQLite location |

## What works

- `POST /api/feeds` NL parse → keywords/topics → RSS / HN / Reddit / public API discovery → ingest → rank/dedupe/cluster → extractive (or AI) summary
- Persistent SQLite (`data/word-of-mouth.db`)
- Demo feeds: employment, tech, industry intel, Auckland/NZ events (clearly labelled)
- Browse feed, item detail, search, share link, source diagnostics, up/down feedback refine
- SSRF guards, HTML sanitisation, prompt fencing
- In-process refresh scheduler + source management APIs
- Distinctive harbor-signal UI (`AppChrome`) with self-hosted Fraunces/Sora fonts

See [STATUS.md](./STATUS.md) and [HANDOFF.md](./HANDOFF.md) for honesty on partials and gaps.

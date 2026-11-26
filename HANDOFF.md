# HANDOFF — Word of Mouth

**Repo:** https://github.com/jxav22/word-of-mouth  
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

## How to run
```bash
git clone https://github.com/jxav22/word-of-mouth.git
cd word-of-mouth
npm install
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

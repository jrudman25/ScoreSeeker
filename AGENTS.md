# AGENTS.md

Guidance for coding agents working on ScoreSeeker. `README.md` is public-facing; `TODO.md` holds the active task and findings list (local-only, see note below).

## Stack

- Next.js 16 (App Router, Turbopack), React 19, plain JavaScript (no TypeScript)
- MUI 7 + Emotion for UI; `next-themes` for light/dark persistence
- Tone.js 15 for audio; `date-fns-tz` 3 for time zone formatting
- Jest 30 + Testing Library (jsdom), ESLint 9 flat config (`eslint-config-next/core-web-vitals` + custom rules)
- Node 24 (matches CI). Deployed on Netlify (configured in the Netlify UI; there is no `netlify.toml` in the repo)
- Data: TheSportsDB API v2 (`https://www.thesportsdb.com/api/v2/json`), authenticated with the `X-API-KEY` header

## Layout

```
src/app/page.js              Single client page; composes hooks + components, settings menu (theme, time zone)
src/app/layout.js            Root layout and metadata
src/app/providers.js         next-themes provider (storageKey "scoreseeker_theme")
src/app/api/team/route.js    GET ?t=<query> search (v2, falls back to local index) | GET ?id=<idTeam> lookup
src/app/api/matches/route.js GET ?id=<idTeam> full schedule; falls back to previous+next when empty (isFallback)
src/hooks/                   useTeamSearch (search + lookup), useMatchData (fetch, categorize, paginate)
src/components/              TeamSearch, TeamDetails, MatchList, ErrorBoundary
src/utils/helpers.js         Time formatting, match status (isLive/isFinished), score normalization
src/utils/musicGenerator.js  Deterministic Tone.js theme per match (seeded by idEvent)
src/data/teams.json          Generated local team index (~18.7k teams, ~3.5 MB), imported server-side only
scripts/build_team_list_v2.js Regenerates teams.json from the v2 API (needs SPORTS_DB_API_KEY in .env)
```

Tests are co-located as `*.test.js`. API route tests use `@jest-environment node` and mock `global.fetch` and `teams.json`.

## Architecture notes

- All TheSportsDB calls go through the two API routes so the key never reaches the browser. Never call TheSportsDB from client code or expose the key via `NEXT_PUBLIC_*`.
- The v2 search endpoint misses many partial names (e.g. "Knicks"), so `/api/team` falls back to substring/short-name matching over `src/data/teams.json`.
- TheSportsDB returns `null` instead of `0` for zero scores; `normalizeScore` coerces this for finished/live matches.
- Match categorization (past / live / upcoming) happens client-side in `useMatchData` against the selected time zone. Pagination is 10 per page.
- User settings persist in `localStorage` (`scoreseeker_theme`, `scoreseeker_timeZone`). The page renders `null` until `next-themes` resolves to avoid a theme flash.
- Audio uses module-level Tone.js singletons; starting a new theme tears down the previous one.

## Commands

| Command | Purpose |
|---|---|
| `npm ci` | Install exact locked dependencies |
| `npm run dev` | Dev server at http://localhost:3000 |
| `npm run lint` | ESLint (CI fails on errors; warnings allowed) |
| `npm test` / `npx jest --ci` | Unit tests (CI uses `--ci`) |
| `npx jest path/to/file.test.js` | Run one test file (prefer this while iterating; the full suite is slow on Windows) |
| `npm run test:coverage` | Tests with coverage report in `coverage/` |
| `npm run build` | Production build |
| `node scripts/build_team_list_v2.js` | Regenerate `src/data/teams.json` (many API calls; requires `.env`) |

Before finishing a change, run lint, the relevant tests, and `npm run build`. CI (`.github/workflows/ci.yml`) runs lint, `npx jest --ci`, and build on pushes to `main` and on PRs.

## Environment

- `SPORTS_DB_API_KEY` (required, server-only) in `.env` locally and in Netlify environment settings. `.env` is gitignored; never commit or log it.

## Conventions

- JavaScript only, 4-space indent in `src/`. Hooks are named exports; components are default exports.
- ESLint enforces `curly: all`, `prefer-const`, and `no-console` (only `console.warn`/`console.error` allowed). Prefix intentionally unused vars/args/caught errors with `_`.
- Mock only external I/O in tests (`fetch`, Tone.js), not owned modules.
- `AGENTS.md` and `README.md` are tracked; `TODO.md` is intentionally local-only (excluded via `.git/info/exclude`).
- Team IDs passed to API routes must pass `isValidTeamId` (numeric only) before being used in upstream URLs. API routes return 400 for invalid input, 500 for a missing key, and 502 for non-OK upstream responses.
- Parse match times with `parseMatchDate` (TheSportsDB times are UTC without a `Z`).
- `scripts/build_team_list_v2.js` refuses to overwrite `teams.json` if any league fetch fails; pass `--allow-partial` to override.

## Known gaps

See `TODO.md` for details:
- No caching or rate limiting on the API routes (MED-2)
- Home page is fully client-rendered and empty on the server (MED-4)

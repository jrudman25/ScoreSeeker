# AGENTS.md

Guidance for coding agents working on ScoreSeeker. `README.md` is public-facing; `TODO.md` holds the active task and findings list (local-only, see note below).

## Stack

- Next.js 16 (App Router, Turbopack), React 19, plain JavaScript (no TypeScript)
- MUI 7 + Emotion for UI, with MUI CSS-variable color schemes for light/dark and `@mui/material-nextjs` (`v16-appRouter`) for Emotion SSR
- Tone.js 15 for audio; `date-fns-tz` 3 for time zone formatting
- Jest 30 + Testing Library (jsdom), ESLint 9 flat config (`eslint-config-next/core-web-vitals` + custom rules)
- Node 24 (matches CI). Deployed on Netlify (configured in the Netlify UI; there is no `netlify.toml` in the repo)
- Data: TheSportsDB API v2 (`https://www.thesportsdb.com/api/v2/json`), authenticated with the `X-API-KEY` header

## Layout

```
src/app/layout.js            Root layout (server): metadata, InitColorSchemeScript, AppHeader, TeamSearch, children, Footer
src/app/providers.js         Client providers: AppRouterCacheProvider, MUI ThemeProvider, CssBaseline, TimeZoneProvider
src/app/page.js              Home (static): HomeHero
src/app/team/[id]/           Team page (server, on-demand ISR, revalidate 60) + loading, error, not-found
src/app/api/team/route.js    GET ?t=<query> autocomplete search (CDN-cached on success)
src/app/opengraph-image.js   Static OG image (next/og)
src/app/sitemap.js           Static /sitemap.xml: home + major-league team pages
src/lib/sportsDb.js          Server-only TheSportsDB client: searchTeams, getTeam, getSchedule, UpstreamError, ConfigError
src/lib/siteUrl.js           SITE_URL (production origin) for metadataBase and the sitemap
src/lib/sitemapTeams.js      SITEMAP_LEAGUES and getSitemapTeamIds() (filters teams.json)
src/theme.js                 MUI theme (colorSchemeSelector 'data-theme', light + dark schemes)
src/hooks/                   useTeamSearch (autocomplete with stale-response guard), useMatchCategories (sort, categorize, paginate)
src/components/              AppHeader, TeamSearch, HomeHero, TeamDetails, TeamSchedule, MatchList, TimeZoneProvider, Footer, ErrorBoundary
src/utils/helpers.js         Time formatting, match status (isLive/isFinished), score normalization
src/utils/musicGenerator.js  Deterministic Tone.js theme per match (seeded by idEvent)
src/data/teams.json          Generated local team index (~18.7k teams, ~3.5 MB), imported server-side only
scripts/build_team_list_v2.js Regenerates teams.json from the v2 API (needs SPORTS_DB_API_KEY in .env)
```

Tests are co-located as `*.test.js`. Server tests (route, `sportsDb`, team page) use `@jest-environment node` and mock `global.fetch`, `teams.json`, and `next/navigation`. `jest.config.js` maps `server-only` to Next's empty stub.

## Architecture notes

- All TheSportsDB calls go through `src/lib/sportsDb.js` (marked `server-only`), used by the team page and `/api/team`. Never call TheSportsDB from client code or expose the key via `NEXT_PUBLIC_*`.
- Selecting a search result navigates to `/team/<idTeam>`. The team page fetches the team and schedule on the server, so it has real HTML and per-team metadata (title, canonical, description with league and next match from `findNextMatch`, badge as OG/Twitter image).
- SEO: canonicals are set per page (`page.js` for `/`, `generateMetadata` for teams), never in the root layout, because layout metadata is inherited by 404s. The sitemap lists only teams in `SITEMAP_LEAGUES` (~500) to limit crawler-driven API calls; widen it deliberately. `robots.txt` (in `public/`) carries the `Sitemap:` line, so do not add `app/robots.js`. The root layout's `verification.google` keeps Search Console verified; do not remove it.
- The footer credits TheSportsDB (required by its terms for paid API use). Keep that credit on every page.
- The v2 search endpoint misses many partial names (e.g. "Knicks"), so `searchTeams` falls back to substring/short-name matching over `src/data/teams.json`.
- Caching (`cacheComponents` is off; this uses the fetch/ISR model):
  - Upstream fetch revalidate: search 3600 s, team lookup 86400 s, schedule 60 s. Next only stores 200 responses, so errors are not cached.
  - `/team/[id]`: `generateStaticParams` returns `[]` and `revalidate = 60`, so pages render on first visit and then revalidate. `expireTime: 600` in `next.config.mjs` caps stale-while-revalidate (`s-maxage=60, stale-while-revalidate=540`).
  - `/api/team` sets `Netlify-CDN-Cache-Control: public, durable, s-maxage=3600, stale-while-revalidate=86400` on success only. Netlify keys function caches by query string by default.
  - There is no rate limiting. Caching is the only protection for the API quota.
- TheSportsDB returns `null` instead of `0` for zero scores; `normalizeScore` coerces this for finished/live matches.
- Match categorization (past / live / upcoming) happens client-side in `useMatchCategories` (inside `TeamSchedule`). Pagination is 10 per page.
- Theme: `InitColorSchemeScript` sets `data-theme` before paint from `localStorage.scoreseeker_theme` (same key and raw value format the old next-themes setup used). Style dark mode with `sx={(theme) => ({ ...light, ...theme.applyStyles('dark', {...}) })}`. Do not branch on a `darkMode` boolean.
- Time zone: `TimeZoneProvider` exposes `useTimeZone()`. `timeZone` is `null` during SSR and the first client render, then resolves from `localStorage.scoreseeker_timeZone` or the browser zone. Match times render only once it is non-null, to avoid hydration mismatches.
- Server/client boundary: function props (including function-valued `sx` and `component={Link}`) cannot be passed from server components. Put that styling in a client component.
- `Footer` is a server component and the only place that imports `package.json` (for `version`). Never import `package.json` into a client module.
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
- Mock only external I/O in tests (`fetch`, Tone.js, `next/navigation`), not owned modules.
- `AGENTS.md` and `README.md` are tracked; `TODO.md` is intentionally local-only (excluded via `.git/info/exclude`).
- Team IDs must pass `isValidTeamId` (numeric only) before use; invalid IDs on `/team/[id]` call `notFound()`. `sportsDb` throws `ConfigError` (missing key) and `UpstreamError` (non-OK). `/api/team` maps these to 500 and 502.
- Parse match times with `parseMatchDate` (TheSportsDB times are UTC without a `Z`).
- `scripts/build_team_list_v2.js` refuses to overwrite `teams.json` if any league fetch fails; pass `--allow-partial` to override.

## Next.js version note

`node_modules/next/AGENTS.md`: this Next 16 differs from older training data. Check `node_modules/next/dist/docs/` before using unfamiliar APIs. For example, `params` is a Promise, and `error.js` receives `retry` (not `reset`).

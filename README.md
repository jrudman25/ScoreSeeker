# ScoreSeeker - Sports data with dynamic audio snippets

ScoreSeeker allows users to search for sports teams, view their upcoming and past match schedules, and play dynamic musical Tone.js snippets based on match scores.

<img width="700" alt="ScoreSeeker snippet" src="https://github.com/user-attachments/assets/b10cbc98-9772-45a7-85d9-0cfacce149d3" />

---

### Features
- **Team Search** - Search teams worldwide by name, nickname, or abbreviation
- **Match Schedules** - View upcoming and past matches with live scores and other match info
- **Off-Season Fallback** - Automatically shows the most recent or next season when a team is between seasons
- **Dynamic Audio** - Generates unique Tone.js musical snippets based on match scores
- **Team Pages** - Shareable `/team/<id>` pages with per-team titles, link previews, and a sitemap of major-league teams
- **Dark Mode** - Flash-free theme persistence using MUI color schemes

### Tech Stack
- **Framework:** Next.js
- **UI:** React, MUI, Emotion
- **Audio Synthesis:** Tone.js
- **Data Source:** TheSportsDB API (v2)
- **Theme:** MUI color schemes (CSS variables)
- **Testing:** Jest
- **CI:** GitHub Actions (lint, test, build on pushes to `main` and pull requests)
- **Deployment:** Netlify

### Architecture
All TheSportsDB requests run on the server, so the API key never reaches the browser. Each team has its own page (`/team/<id>`), rendered on the server and regenerated at most once a minute (incremental static regeneration). Search results and team profiles are cached for longer, which keeps upstream API usage low. Match times are shown in the visitor's chosen time zone in the browser.

**Search Fallback** — The v2 search API has limited partial-name matching (e.g., "Knicks" and "Lakers" return no results). To solve this, a local team index (`src/data/teams.json`) is bundled as a fallback. When the v2 API returns no matches, the route searches this index using substring and short-name matching, ensuring common nicknames always resolve.

### Getting Started
Requires Node.js 24 (the version used in CI) and a [TheSportsDB](https://www.thesportsdb.com/) API key with v2 access.

```bash
npm ci
echo "SPORTS_DB_API_KEY=your_key_here" > .env
npm run dev
```

Then open http://localhost:3000.

### Scripts
| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run lint` | Run ESLint |
| `npm test` | Run all unit tests |
| `npm run test:coverage` | Run tests with a coverage report |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `node scripts/build_team_list_v2.js` | Regenerate `src/data/teams.json` from the TheSportsDB API (reads the key from `.env`) |

### Environment Variables
| Variable | Description |
|---|---|
| `SPORTS_DB_API_KEY` | TheSportsDB API key (required, server-side only) |

### License
See [LICENSE](LICENSE).

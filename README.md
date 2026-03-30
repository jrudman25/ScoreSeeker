# ScoreSeeker
## A sports data app with dynamic audio snippets
#### Created by Jordan Rudman

ScoreSeeker allows users to search for sports teams, view their upcoming and past match schedules, and play dynamic musical Tone.js snippets based on match scores.

---

### Features
- **Team Search** — Search any team by name, nickname, or abbreviation across 18,000+ teams worldwide
- **Match Schedules** — View upcoming and past matches with live scores and other match info
- **Off-Season Fallback** — Automatically shows the most recent or next season when a team is between seasons
- **Dynamic Audio** — Generates unique Tone.js musical snippets based on match scores
- **Dark Mode** — Flash-free theme persistence powered by `next-themes`

### Tech Stack
- **Framework:** Next.js
- **UI:** React, MUI, Emotion
- **Audio Synthesis:** Tone.js
- **Data Source:** TheSportsDB API (v2)
- **Theme:** next-themes
- **Testing:** Jest
- **Deployment:** Netlify

### Architecture
The application features secure server-side Next.js API routing to proxy requests to TheSportsDB, keeping API keys hidden from the frontend client. The UI components leverage custom React hooks for efficient, memoized data fetching and localized timezone formatting without unnecessary network requests.

**Search Fallback** — The v2 search API has limited partial-name matching (e.g., "Knicks" and "Lakers" return no results). To solve this, a local team index (`src/data/teams.json`) is bundled as a fallback. When the v2 API returns no matches, the route searches this index using substring and short-name matching, ensuring common nicknames always resolve.

### Scripts
| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm test` | Run all unit tests |
| `npm run build` | Create a production build |
| `node scripts/build_team_list_v2.js` | Regenerate `src/data/teams.json` from the TheSportsDB API |

### Environment Variables
| Variable | Description |
|---|---|
| `SPORTS_DB_API_KEY` | TheSportsDB API key (required) |

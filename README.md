# ScoreSeeker
## A sports data app with dynamic audio snippets
#### Created by Jordan Rudman

ScoreSeeker allows users to search for sports teams, view their upcoming and past match schedules, and play dynamic musical Tone.js snippets based on match scores.

### Tech Stack
- **Framework:** Next.js (App Router)
- **UI:** React, MUI
- **Audio Synthesis:** Tone.js
- **Data Source:** TheSportsDB API
- **Deployment:** Netlify

### Architecture
The application features secure server-side Next.js API routing to proxy requests to TheSportsDB, keeping API keys hidden from the frontend client. The UI components leverage custom React hooks for efficient, memoized data fetching and localized timezone formatting without unnecessary network requests.


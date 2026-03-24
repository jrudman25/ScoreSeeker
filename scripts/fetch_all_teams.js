/**
 * Script to fetch every single team across every single league
 * from TheSportsDB and compile them into a static JSON file.
 * This runs at build time or manually to guarantee perfect fuzzy autocomplete.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// For paid tier, use .env or hardcode if testing
const API_KEY = process.env.REACT_APP_SPORTS_DB_API_KEY || '871003';
const DATA_DIR = path.join(__dirname, '../src/data');
const OUT_FILE = path.join(DATA_DIR, 'teams.json');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
}

// Optional delay to prevent rate limits (even on paid tier, good practice)
const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
    console.log("Fetching list of all leagues...");
    const leaguesData = await fetchJson(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/all_leagues.php`);
    if (!leaguesData || !leaguesData.leagues) {
        console.error("Failed to fetch leagues.");
        return;
    }

    const leagues = leaguesData.leagues;
    console.log(`Found ${leagues.length} leagues. Fetching teams for each... this may take a minute.`);

    let allTeams = [];
    
    // Create data dir if missing
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Process in small batches so we don't overwhelm the API
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < leagues.length; i += BATCH_SIZE) {
        const batch = leagues.slice(i, i + BATCH_SIZE);
        const promises = batch.map(async (league) => {
            const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/search_all_teams.php?l=${encodeURIComponent(league.strLeague)}`;
            const response = await fetchJson(url);
            if (response && response.teams) {
                return response.teams;
            }
            return [];
        });

        const results = await Promise.all(promises);
        const flatTeams = results.flat();
        if (flatTeams.length > 0) {
            allTeams = allTeams.concat(flatTeams);
        }
        
        process.stdout.write(`\rProgress: ${Math.min(i + BATCH_SIZE, leagues.length)} / ${leagues.length} leagues processed... (${allTeams.length} teams found so far)`);
        await delay(50); // Small pause
    }

    // Deduplicate just in case
    const uniqueTeams = [];
    const ids = new Set();
    for (const t of allTeams) {
        if (!ids.has(t.idTeam)) {
            ids.add(t.idTeam);
            
            // Keep only essential properties to save file size
            uniqueTeams.push({
                idTeam: t.idTeam,
                strTeam: t.strTeam,
                strSport: t.strSport,
                strLeague: t.strLeague,
                strTeamAlternate: t.strTeamAlternate,
                strBadge: t.strBadge
            });
        }
    }

    console.log(`\n\nSuccess! Downloaded ${uniqueTeams.length} unique teams.`);
    fs.writeFileSync(OUT_FILE, JSON.stringify(uniqueTeams), 'utf-8');
    console.log(`Saved to ${OUT_FILE}`);
}

main().catch(console.error);

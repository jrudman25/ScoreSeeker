/**
 * Script to fetch every single team across every single league
 * from TheSportsDB and compile them into a static JSON file.
 * This runs at build time or manually to guarantee perfect fuzzy autocomplete.
 */
/* eslint-disable no-console */
const { loadEnvFile } = require('node:process');
loadEnvFile('./.env');
const fs = require('fs');
const path = require('path');
const https = require('https');

// For paid tier, use .env or hardcode if testing
const apiKey = process.env.SPORTS_DB_API_KEY;
const headers = { 'X-API-KEY': apiKey };
const DATA_DIR = path.join(__dirname, '../src/data');
const OUT_FILE = path.join(DATA_DIR, 'teams.json');

function fetchJson(url, options) {
    return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (_e) {
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
    const leaguesData = await fetchJson(`https://www.thesportsdb.com/api/v2/json/all/leagues`, { headers });
    if (!leaguesData || !leaguesData.all) {
        console.error("Failed to fetch leagues.");
        return;
    }

    const leagues = leaguesData.all;
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
            const url = `https://www.thesportsdb.com/api/v2/json/list/teams/${encodeURIComponent(league.idLeague)}`;
            const response = await fetchJson(url, { headers });
            if (response && response.list) {
                return response.list.map(team => ({
                    ...team,
                    strSport: league.strSport,
                    strLeague: league.strLeague,
                }));
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
                strTeamShort: t.strTeamShort,
                strSport: t.strSport,
                strLeague: t.strLeague,
            });
        }
    }

    console.log(`\n\nSuccess! Downloaded ${uniqueTeams.length} unique teams.`);
    fs.writeFileSync(OUT_FILE, JSON.stringify(uniqueTeams), 'utf-8');
    console.log(`Saved to ${OUT_FILE}`);
}

main().catch(console.error);

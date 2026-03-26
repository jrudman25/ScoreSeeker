import { NextResponse } from 'next/server';
import teamsData from '../../../data/teams.json';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('t')?.toLowerCase().trim() || '';
    const id = searchParams.get('id');

    // If selecting a specific team, fetch the rich profile from TheSportsDB
    if (id) {
        const apiKey = process.env.SPORTS_DB_API_KEY || '123';
        try {
            const res = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/lookupteam.php?id=${id}`);
            const data = await res.json();
            return NextResponse.json(data);
        } catch (_e) {
            return NextResponse.json({ error: 'Failed to lookup team details' }, { status: 500 });
        }
    }

    if (!query || query.length < 2) {
        return NextResponse.json({ teams: [] });
    }

    try {
        // Perform an instant substring (fuzzy) search against the entire cached global db
        const matchedTeams = teamsData.filter(team => {
            const name = (team.strTeam || '').toLowerCase();
            const alt = (team.strTeamAlternate || '').toLowerCase();
            return name.includes(query) || alt.includes(query);
        });

        // Limit results to 50 to keep the Autocomplete speedy and network payload tiny
        return NextResponse.json({ teams: matchedTeams.slice(0, 50) });
    } catch (error) {
        console.error("Local search error:", error);
        return NextResponse.json({ error: 'Failed to search local team registry' }, { status: 500 });
    }
}

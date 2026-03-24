import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const teamName = searchParams.get('t');
    
    if (!teamName) {
        return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const apiKey = process.env.REACT_APP_SPORTS_DB_API_KEY;

    try {
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${teamName}`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
    }
}

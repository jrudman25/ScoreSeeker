import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');

    if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const apiKey = process.env.SPORTS_DB_API_KEY;

    try {
        const [pastRes, upcomingRes] = await Promise.all([
            fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventslast.php?id=${teamId}`),
            fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnext.php?id=${teamId}`)
        ]);

        const pastData = await pastRes.json();
        const upcomingData = await upcomingRes.json();

        return NextResponse.json({ pastData, upcomingData });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }
}

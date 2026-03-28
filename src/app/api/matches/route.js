import { NextResponse } from 'next/server';

const API_BASE = 'https://www.thesportsdb.com/api/v2/json';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');

    if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const apiKey = process.env.SPORTS_DB_API_KEY;
    const headers = { 'X-API-KEY': apiKey };

    try {
        // Try full season schedule first
        const fullRes = await fetch(`${API_BASE}/schedule/full/team/${teamId}`, { headers });
        const fullData = await fullRes.json();
        const schedule = fullData.schedule || [];

        if (schedule.length > 0) {
            return NextResponse.json({ schedule, isFallback: false });
        }

        // Full schedule empty (off-season) — fall back to previous + next endpoints
        const [prevRes, nextRes] = await Promise.all([
            fetch(`${API_BASE}/schedule/previous/team/${teamId}`, { headers }),
            fetch(`${API_BASE}/schedule/next/team/${teamId}`, { headers }),
        ]);

        const prevData = await prevRes.json();
        const nextData = await nextRes.json();

        const fallbackSchedule = [
            ...(prevData.schedule || []),
            ...(nextData.schedule || []),
        ];

        return NextResponse.json({ schedule: fallbackSchedule, isFallback: true });
    } catch (_e) {
        return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
    }
}

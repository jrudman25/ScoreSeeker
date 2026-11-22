import { NextResponse } from 'next/server';
import { isValidTeamId } from '../../../utils/isValidTeamId';

const API_BASE = 'https://www.thesportsdb.com/api/v2/json';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');

    if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    if (!isValidTeamId(teamId)) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    const apiKey = process.env.SPORTS_DB_API_KEY;
    if (!apiKey) {
        console.error('SPORTS_DB_API_KEY is not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const headers = { 'X-API-KEY': apiKey };
    const encodedId = encodeURIComponent(teamId);

    try {
        // Try full season schedule first
        const fullRes = await fetch(`${API_BASE}/schedule/full/team/${encodedId}`, { headers });
        if (!fullRes.ok) {
            console.error(`Upstream /schedule/full/team/${encodedId} returned status ${fullRes.status}`);
            return NextResponse.json({ error: 'Upstream service error' }, { status: 502 });
        }
        const fullData = await fullRes.json();
        const schedule = fullData.schedule || [];

        if (schedule.length > 0) {
            return NextResponse.json({ schedule, isFallback: false });
        }

        // Full schedule empty (off-season) — fall back to previous + next endpoints
        const [prevRes, nextRes] = await Promise.all([
            fetch(`${API_BASE}/schedule/previous/team/${encodedId}`, { headers }),
            fetch(`${API_BASE}/schedule/next/team/${encodedId}`, { headers }),
        ]);

        if (!prevRes.ok) {
            console.error(`Upstream /schedule/previous/team/${encodedId} returned status ${prevRes.status}`);
            return NextResponse.json({ error: 'Upstream service error' }, { status: 502 });
        }
        if (!nextRes.ok) {
            console.error(`Upstream /schedule/next/team/${encodedId} returned status ${nextRes.status}`);
            return NextResponse.json({ error: 'Upstream service error' }, { status: 502 });
        }

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

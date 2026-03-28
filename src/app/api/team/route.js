import { NextResponse } from 'next/server';

const API_BASE = 'https://www.thesportsdb.com/api/v2/json';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('t')?.trim() || '';
    const id = searchParams.get('id');
    const apiKey = process.env.SPORTS_DB_API_KEY;
    const headers = { 'X-API-KEY': apiKey };

    // Lookup mode: fetch full team profile by ID
    if (id) {
        try {
            const res = await fetch(`${API_BASE}/lookup/team/${id}`, { headers });
            const data = await res.json();

            if (data.lookup && data.lookup.length > 0) {
                return NextResponse.json({ lookup: data.lookup });
            }
            return NextResponse.json({ lookup: [] });
        } catch (_e) {
            return NextResponse.json({ error: 'Failed to lookup team details' }, { status: 500 });
        }
    }

    // Search mode: query the v2 search endpoint directly
    if (!query || query.length < 2) {
        return NextResponse.json({ search: [] });
    }

    try {
        const res = await fetch(`${API_BASE}/search/team/${encodeURIComponent(query)}`, { headers });
        const data = await res.json();

        if (data.search && data.search.length > 0) {
            return NextResponse.json({ search: data.search });
        }
        return NextResponse.json({ search: [] });
    } catch (_e) {
        return NextResponse.json({ error: 'Failed to search teams' }, { status: 500 });
    }
}

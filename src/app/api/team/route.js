import { NextResponse } from 'next/server';
import { searchTeams, UpstreamError, ConfigError } from '../../../lib/sportsDb';

const CDN_CACHE_HEADER = 'public, durable, s-maxage=3600, stale-while-revalidate=86400';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('t')?.trim() || '';

    if (!query || query.length < 2) {
        return NextResponse.json({ search: [] });
    }

    try {
        const search = await searchTeams(query);
        return NextResponse.json(
            { search },
            { headers: { 'Netlify-CDN-Cache-Control': CDN_CACHE_HEADER } }
        );
    } catch (err) {
        if (err instanceof ConfigError) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }
        if (err instanceof UpstreamError) {
            return NextResponse.json({ error: 'Upstream service error' }, { status: 502 });
        }
        return NextResponse.json({ error: 'Failed to search teams' }, { status: 500 });
    }
}

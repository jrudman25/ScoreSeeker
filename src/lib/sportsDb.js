import 'server-only';

import teamIndex from '../data/teams.json';

const API_BASE = 'https://www.thesportsdb.com/api/v2/json';

export class UpstreamError extends Error {
    constructor(status, endpoint) {
        super(`Upstream request to ${endpoint} failed with status ${status}`);
        this.name = 'UpstreamError';
        this.status = status;
        this.endpoint = endpoint;
    }
}

export class ConfigError extends Error {
    constructor() {
        super('SPORTS_DB_API_KEY is not configured');
        this.name = 'ConfigError';
    }
}

const getHeaders = () => {
    const apiKey = process.env.SPORTS_DB_API_KEY;
    if (!apiKey) {
        console.error('SPORTS_DB_API_KEY is not configured');
        throw new ConfigError();
    }
    return { 'X-API-KEY': apiKey };
};

// Log the status and endpoint path only; the API key must never be logged
const assertOk = (res, endpoint) => {
    if (!res.ok) {
        console.error(`Upstream ${endpoint} returned status ${res.status}`);
        throw new UpstreamError(res.status, endpoint);
    }
};

/**
 * Search the local team index as a fallback when the v2 API returns no results.
 * Matches against full team name (substring) and team short name (exact, case-insensitive).
 */
function searchLocalIndex(query) {
    const q = query.toLowerCase();
    return teamIndex.filter(team => {
        const name = (team.strTeam || '').toLowerCase();
        const short = (team.strTeamShort || '').toLowerCase();
        return name.includes(q) || short === q;
    });
}

export async function searchTeams(query) {
    const headers = getHeaders();
    const endpoint = `/search/team/${encodeURIComponent(query)}`;
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers,
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        console.error(`Upstream ${endpoint} returned status ${res.status}`);
        // v2 unavailable — fall back to the local index before failing
        const localResults = searchLocalIndex(query);
        if (localResults.length > 0) {
            return localResults;
        }
        throw new UpstreamError(res.status, endpoint);
    }

    const data = await res.json();
    if (data.search && data.search.length > 0) {
        return data.search;
    }

    // v2 returned no results — fall back to local team index
    return searchLocalIndex(query);
}

export async function getTeam(id) {
    const headers = getHeaders();
    const endpoint = `/lookup/team/${encodeURIComponent(id)}`;
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers,
        next: { revalidate: 86400 },
    });
    assertOk(res, endpoint);

    const data = await res.json();
    if (data.lookup && data.lookup.length > 0) {
        return data.lookup[0];
    }
    return null;
}

export async function getSchedule(id) {
    const headers = getHeaders();
    const encodedId = encodeURIComponent(id);
    const revalidate = { next: { revalidate: 60 } };

    // Try full season schedule first
    const fullEndpoint = `/schedule/full/team/${encodedId}`;
    const fullRes = await fetch(`${API_BASE}${fullEndpoint}`, { headers, ...revalidate });
    assertOk(fullRes, fullEndpoint);
    const fullData = await fullRes.json();
    const schedule = fullData.schedule || [];

    if (schedule.length > 0) {
        return { schedule, isFallback: false };
    }

    // Full schedule empty (off-season) — fall back to previous + next endpoints
    const prevEndpoint = `/schedule/previous/team/${encodedId}`;
    const nextEndpoint = `/schedule/next/team/${encodedId}`;
    const [prevRes, nextRes] = await Promise.all([
        fetch(`${API_BASE}${prevEndpoint}`, { headers, ...revalidate }),
        fetch(`${API_BASE}${nextEndpoint}`, { headers, ...revalidate }),
    ]);
    assertOk(prevRes, prevEndpoint);
    assertOk(nextRes, nextEndpoint);

    const prevData = await prevRes.json();
    const nextData = await nextRes.json();

    return {
        schedule: [...(prevData.schedule || []), ...(nextData.schedule || [])],
        isFallback: true,
    };
}

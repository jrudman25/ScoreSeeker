/**
 * @jest-environment node
 */
import { GET } from './route';

// Mock global fetch
global.fetch = jest.fn();

const CDN_HEADER = 'Netlify-CDN-Cache-Control';

// Mock the local team index
jest.mock('../../../data/teams.json', () => [
    { idTeam: '134860', strTeam: 'New York Knicks', strTeamShort: 'NYK', strLeague: 'NBA', strSport: 'Basketball' },
    { idTeam: '134894', strTeam: 'Westchester Knicks', strTeamShort: null, strLeague: 'NBA G League', strSport: 'Basketball' },
    { idTeam: '134861', strTeam: 'Brooklyn Nets', strTeamShort: 'BKN', strLeague: 'NBA', strSport: 'Basketball' },
    { idTeam: '134862', strTeam: 'Boston Celtics', strTeamShort: 'BOS', strLeague: 'NBA', strSport: 'Basketball' },
    { idTeam: '134863', strTeam: 'Los Angeles Lakers', strTeamShort: 'LAL', strLeague: 'NBA', strSport: 'Basketball' },
]);

describe('/api/team Route (v2)', () => {
    beforeEach(() => {
        fetch.mockClear();
        process.env.SPORTS_DB_API_KEY = 'test_key';
    });

    function createRequest(params = '') {
        return { url: `http://localhost:3000/api/team${params}` };
    }

    it('returns empty array for queries shorter than 2 characters', async () => {
        const response = await GET(createRequest('?t=A'));
        const data = await response.json();
        expect(data.search).toEqual([]);
        expect(fetch).not.toHaveBeenCalled();
    });

    it('returns empty array when no query is provided', async () => {
        const response = await GET(createRequest());
        const data = await response.json();
        expect(data.search).toEqual([]);
    });

    it('ignores the id param now that lookup mode is gone', async () => {
        const response = await GET(createRequest('?id=1'));
        const data = await response.json();
        expect(data.search).toEqual([]);
        expect(fetch).not.toHaveBeenCalled();
    });

    it('returns matching teams and sets the CDN cache header on success', async () => {
        const mockSearch = {
            search: [
                { idTeam: '100', strTeam: 'St. Louis Cardinals', strSport: 'Baseball' },
                { idTeam: '101', strTeam: 'Arizona Cardinals', strSport: 'American Football' },
            ]
        };

        fetch.mockResolvedValueOnce({ ok: true, json: async () => mockSearch });

        const response = await GET(createRequest('?t=Cardinals'));
        const data = await response.json();

        expect(data.search).toHaveLength(2);
        expect(response.headers.get(CDN_HEADER)).toBe('public, durable, s-maxage=3600, stale-while-revalidate=86400');
    });

    it('falls back to local index when v2 search returns no results', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ search: null }) });

        const response = await GET(createRequest('?t=knicks'));
        const data = await response.json();
        expect(data.search).toHaveLength(2);
        expect(data.search[0].strTeam).toBe('New York Knicks');
        expect(response.headers.get(CDN_HEADER)).toBeTruthy();
    });

    it('matches local index by team short name', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ search: null }) });

        const response = await GET(createRequest('?t=NYK'));
        const data = await response.json();
        expect(data.search).toHaveLength(1);
        expect(data.search[0].strTeam).toBe('New York Knicks');
    });

    it('returns empty array when neither v2 nor local index match', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ search: null }) });

        const response = await GET(createRequest('?t=zzzzzzz'));
        const data = await response.json();
        expect(data.search).toEqual([]);
    });

    it('returns 500 when search API call fails', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        const response = await GET(createRequest('?t=Cardinals'));
        const data = await response.json();
        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to search teams');
        expect(response.headers.get(CDN_HEADER)).toBeNull();
    });

    it('returns 500 without a cache header when the API key is missing', async () => {
        delete process.env.SPORTS_DB_API_KEY;
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const response = await GET(createRequest('?t=Cardinals'));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Server configuration error');
        expect(response.headers.get(CDN_HEADER)).toBeNull();
        expect(fetch).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('falls back to the local index when search upstream responds non-ok', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        fetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });

        const response = await GET(createRequest('?t=knicks'));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.search).toHaveLength(2);
        expect(data.search[0].strTeam).toBe('New York Knicks');
        consoleSpy.mockRestore();
    });

    it('returns 502 without a cache header when upstream is non-ok and the local index misses', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        fetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });

        const response = await GET(createRequest('?t=zzzzzzz'));
        const data = await response.json();

        expect(response.status).toBe(502);
        expect(data.error).toBe('Upstream service error');
        expect(response.headers.get(CDN_HEADER)).toBeNull();
        consoleSpy.mockRestore();
    });
});

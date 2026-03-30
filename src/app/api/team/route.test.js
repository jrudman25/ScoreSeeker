/**
 * @jest-environment node
 */
import { GET } from './route';

// Mock global fetch
global.fetch = jest.fn();

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

    // --- Search mode tests ---

    it('returns empty array for queries shorter than 2 characters', async () => {
        const response = await GET(createRequest('?t=A'));
        const data = await response.json();
        expect(data.search).toEqual([]);
    });

    it('returns empty array when no query is provided', async () => {
        const response = await GET(createRequest());
        const data = await response.json();
        expect(data.search).toEqual([]);
    });

    it('returns matching teams for a valid search query', async () => {
        const mockSearch = {
            search: [
                { idTeam: '100', strTeam: 'St. Louis Cardinals', strSport: 'Baseball' },
                { idTeam: '101', strTeam: 'Arizona Cardinals', strSport: 'American Football' },
            ]
        };

        fetch.mockResolvedValueOnce({ json: async () => mockSearch });

        const response = await GET(createRequest('?t=Cardinals'));
        const data = await response.json();

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v2/json/search/team/Cardinals'),
            expect.objectContaining({ headers: { 'X-API-KEY': 'test_key' } })
        );
        expect(data.search).toHaveLength(2);
    });

    it('falls back to local index when v2 search returns no results', async () => {
        fetch.mockResolvedValueOnce({ json: async () => ({ search: null }) });

        const response = await GET(createRequest('?t=knicks'));
        const data = await response.json();
        expect(data.search).toHaveLength(2);
        expect(data.search[0].strTeam).toBe('New York Knicks');
    });

    it('matches local index by team short name', async () => {
        fetch.mockResolvedValueOnce({ json: async () => ({ search: null }) });

        const response = await GET(createRequest('?t=NYK'));
        const data = await response.json();
        expect(data.search).toHaveLength(1);
        expect(data.search[0].strTeam).toBe('New York Knicks');
    });

    it('returns empty array when neither v2 nor local index match', async () => {
        fetch.mockResolvedValueOnce({ json: async () => ({ search: null }) });

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
    });

    // --- Lookup mode tests ---

    it('fetches team profile when id param is provided', async () => {
        const mockLookup = {
            lookup: [{ idTeam: '100', strTeam: 'Cardinals', strDescriptionEN: 'Full details' }]
        };

        fetch.mockResolvedValueOnce({ json: async () => mockLookup });

        const response = await GET(createRequest('?id=100'));
        const data = await response.json();

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v2/json/lookup/team/100'),
            expect.objectContaining({ headers: { 'X-API-KEY': 'test_key' } })
        );
        expect(data.lookup[0].strDescriptionEN).toBe('Full details');
    });

    it('returns empty array when lookup finds no team', async () => {
        fetch.mockResolvedValueOnce({ json: async () => ({ lookup: null }) });

        const response = await GET(createRequest('?id=99999'));
        const data = await response.json();
        expect(data.lookup).toEqual([]);
    });

    it('returns 500 when lookup API call fails', async () => {
        fetch.mockRejectedValueOnce(new Error('API down'));

        const response = await GET(createRequest('?id=100'));
        const data = await response.json();
        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to lookup team details');
    });
});

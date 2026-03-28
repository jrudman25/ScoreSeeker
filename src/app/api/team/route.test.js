/**
 * @jest-environment node
 */
import { GET } from './route';

// Mock global fetch
global.fetch = jest.fn();

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
                { idTeam: '100', strTeam: 'Cardinals', strSport: 'Baseball' },
                { idTeam: '101', strTeam: 'Cardinals', strSport: 'American Football' },
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

    it('returns empty array when v2 search has no results', async () => {
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

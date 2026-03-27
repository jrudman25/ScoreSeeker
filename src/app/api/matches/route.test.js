/**
 * @jest-environment node
 */
import { GET } from './route';

// Mock global fetch
global.fetch = jest.fn();

describe('/api/matches Route', () => {
    beforeEach(() => {
        fetch.mockClear();
        process.env.SPORTS_DB_API_KEY = 'test_key';
    });

    function createRequest(params = '') {
        return { url: `http://localhost:3000/api/matches${params}` };
    }

    it('returns 400 if no team ID is provided', async () => {
        const response = await GET(createRequest());
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Team ID is required');
    });

    it('returns 400 for empty id param', async () => {
        const response = await GET(createRequest('?id='));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Team ID is required');
    });

    it('returns combined past and upcoming data on success', async () => {
        const mockPast = { results: [{ idEvent: '1' }] };
        const mockUpcoming = { events: [{ idEvent: '2' }] };

        fetch
            .mockResolvedValueOnce({ json: async () => mockPast })
            .mockResolvedValueOnce({ json: async () => mockUpcoming });

        const response = await GET(createRequest('?id=12345'));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.pastData).toEqual(mockPast);
        expect(data.upcomingData).toEqual(mockUpcoming);

        // Verify it called TheSportsDB with the correct API key and team ID
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('test_key/eventslast.php?id=12345')
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('test_key/eventsnext.php?id=12345')
        );
    });

    it('returns 500 on upstream API failure', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        const response = await GET(createRequest('?id=12345'));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch matches');
    });
});

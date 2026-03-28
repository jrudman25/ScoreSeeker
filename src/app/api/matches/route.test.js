/**
 * @jest-environment node
 */
import { GET } from './route';

// Mock global fetch
global.fetch = jest.fn();

describe('/api/matches Route (v2)', () => {
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

    it('returns full schedule with isFallback=false on success', async () => {
        const mockSchedule = {
            schedule: [
                { idEvent: '1', dateEvent: '2026-01-15', strStatus: 'Match Finished' },
                { idEvent: '2', dateEvent: '2026-06-01', strStatus: 'Not Started' },
            ]
        };

        fetch.mockResolvedValueOnce({ json: async () => mockSchedule });

        const response = await GET(createRequest('?id=12345'));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.schedule).toHaveLength(2);
        expect(data.isFallback).toBe(false);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/v2/json/schedule/full/team/12345'),
            expect.objectContaining({ headers: { 'X-API-KEY': 'test_key' } })
        );
    });

    it('falls back to previous + next endpoints when full schedule is empty', async () => {
        // Full schedule returns empty
        fetch.mockResolvedValueOnce({ json: async () => ({ schedule: [] }) });
        // Previous schedule returns data
        fetch.mockResolvedValueOnce({ json: async () => ({ schedule: [{ idEvent: 'p1', strStatus: 'FT' }] }) });
        // Next schedule returns empty
        fetch.mockResolvedValueOnce({ json: async () => ({ schedule: [] }) });

        const response = await GET(createRequest('?id=12345'));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.schedule).toHaveLength(1);
        expect(data.isFallback).toBe(true);
        expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('returns empty schedule with isFallback=true when all endpoints have no data', async () => {
        fetch.mockResolvedValueOnce({ json: async () => ({ Message: 'No data found' }) });
        fetch.mockResolvedValueOnce({ json: async () => ({ Message: 'No data found' }) });
        fetch.mockResolvedValueOnce({ json: async () => ({ Message: 'No data found' }) });

        const response = await GET(createRequest('?id=12345'));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.schedule).toEqual([]);
        expect(data.isFallback).toBe(true);
    });

    it('returns 500 on upstream API failure', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        const response = await GET(createRequest('?id=12345'));
        const data = await response.json();
        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch schedule');
    });
});

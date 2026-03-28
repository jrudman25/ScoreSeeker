import { renderHook, waitFor } from '@testing-library/react';
import { useMatchData } from './useMatchData';

// Mock global fetch
global.fetch = jest.fn();

describe('useMatchData Hook (v2)', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('initializes safely with empty states when no team ID is provided', () => {
        const { result } = renderHook(() => useMatchData(null, 'America/Los_Angeles'));

        expect(result.current.pastMatchInfo).toEqual([]);
        expect(result.current.currentMatchInfo).toEqual([]);
        expect(result.current.upcomingMatchInfo).toEqual([]);
        expect(result.current.isFetchingMatches).toBe(false);
        expect(result.current.isDataReady).toBe(false);
    });

    it('fetches schedule and categorizes matches correctly', async () => {
        const mockResponse = {
            schedule: [
                { idEvent: '1', dateEvent: '2020-01-01', strTime: '12:00:00', strStatus: 'Match Finished' },
                { idEvent: '2', dateEvent: '2030-01-01', strTime: '12:00:00', strStatus: 'Not Started' }
            ]
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const { result } = renderHook(() => useMatchData('team_123', 'America/New_York'));

        expect(result.current.isFetchingMatches).toBe(true);

        await waitFor(() => {
            expect(result.current.isFetchingMatches).toBe(false);
        });

        expect(fetch).toHaveBeenCalledWith('/api/matches?id=team_123');
        expect(result.current.isDataReady).toBe(true);
        expect(result.current.pastMatchInfo).toHaveLength(1);
        expect(result.current.upcomingMatchInfo).toHaveLength(1);
    });

    it('handles empty schedule (offseason team) gracefully', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ schedule: [] })
        });

        const { result } = renderHook(() => useMatchData('team_456', 'UTC'));

        await waitFor(() => {
            expect(result.current.isFetchingMatches).toBe(false);
        });

        expect(result.current.isDataReady).toBe(true);
        expect(result.current.pastMatchInfo).toEqual([]);
        expect(result.current.upcomingMatchInfo).toEqual([]);
    });

    it('handles network errors without locking the UI', async () => {
        fetch.mockRejectedValueOnce(new Error('Network disconnected'));

        const { result } = renderHook(() => useMatchData('broken_team', 'Europe/London'));

        await waitFor(() => {
            expect(result.current.isFetchingMatches).toBe(false);
        });

        expect(result.current.error).toContain('Error fetching schedule');
        expect(result.current.isDataReady).toBe(true);
    });

    it('exposes pagination state for past and upcoming matches', async () => {
        // Create 15 past matches to trigger pagination
        const pastMatches = Array.from({ length: 15 }, (_, i) => ({
            idEvent: String(i),
            dateEvent: '2020-01-01',
            strTime: '12:00:00',
            strStatus: 'Match Finished'
        }));

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ schedule: pastMatches })
        });

        const { result } = renderHook(() => useMatchData('team_789', 'America/Los_Angeles'));

        await waitFor(() => {
            expect(result.current.isDataReady).toBe(true);
        });

        // Should paginate: 10 on page 1, 5 on page 2
        expect(result.current.pastMatchInfo).toHaveLength(10);
        expect(result.current.pastPage).toBe(1);
        expect(result.current.pastPageCount).toBe(2);
    });
});

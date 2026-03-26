import { renderHook, waitFor } from '@testing-library/react';
import { useMatchData } from './useMatchData';

// Mock global fetch globally for this isolated test suite
global.fetch = jest.fn();

describe('useMatchData Hook Integration', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('initializes safely with empty states when no team ID is provided', () => {
        const { result } = renderHook(() => useMatchData(null, 'America/Los_Angeles'));

        expect(result.current.pastMatchInfo).toEqual([]);
        expect(result.current.currentMatchInfo).toEqual([]);
        expect(result.current.upcomingMatchInfo).toEqual([]);
        expect(result.current.isFetchingMatches).toBe(false);
        expect(result.current.isDataReady).toBe(false); // Should not be ready if no team loaded
    });

    it('fetches match info and strictly synchronizes the isDataReady state', async () => {
        const mockMatches = {
            pastData: {
                results: [
                    { idEvent: '1', dateEvent: '2020-01-01', strTime: '12:00:00', strStatus: 'Match Finished' }
                ]
            },
            upcomingData: {
                events: [
                    { idEvent: '2', dateEvent: '2030-01-01', strTime: '12:00:00', strStatus: 'Not Started' }
                ]
            }
        };

        // Supplying our mock data directly into the hook's native fetch API call
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockMatches
        });

        const { result } = renderHook(() => useMatchData('team_12345', 'America/New_York'));

        // 1. Initial State: The hook should instantly intercept the team ID and commence fetching
        expect(result.current.isFetchingMatches).toBe(true);
        expect(result.current.isDataReady).toBe(false);

        // 2. Await the asynchronous hook resolution natively via RTL
        await waitFor(() => {
            expect(result.current.isFetchingMatches).toBe(false);
        });

        // 3. Final State: Assert that all layout synchronization booleans are valid
        expect(fetch).toHaveBeenCalledWith('/api/matches?id=team_12345');
        expect(result.current.isDataReady).toBe(true);

        // 4. Validate the complex date parsing logic safely sorted them
        expect(result.current.pastMatchInfo).toHaveLength(1);
        expect(result.current.pastMatchInfo[0].idEvent).toBe('1');

        expect(result.current.upcomingMatchInfo).toHaveLength(1);
        expect(result.current.upcomingMatchInfo[0].idEvent).toBe('2');
    });

    it('handles network breakdown securely without locking up the UI router', async () => {
        // Force the API to structurally completely fail
        fetch.mockRejectedValueOnce(new Error('Network disconnected'));

        const { result } = renderHook(() => useMatchData('broken_team_555', 'Europe/London'));

        await waitFor(() => {
            expect(result.current.isFetchingMatches).toBe(false);
        });

        expect(result.current.error).toContain('Error fetching matches');
        // Crucially, even on total internal failure, the app MUST resolve isDataReady 
        // to `true` to force the UI spinner to dismount and surface the text error.
        expect(result.current.isDataReady).toBe(true);
    });
});

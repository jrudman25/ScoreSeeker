import { renderHook, act } from '@testing-library/react';
import { useTeamSearch } from './useTeamSearch';

// Mock global fetch
global.fetch = jest.fn();

describe('useTeamSearch Hook', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('initializes with empty states', () => {
        const { result } = renderHook(() => useTeamSearch());
        expect(result.current.teamSearchResult).toBeNull();
        expect(result.current.teamOptions).toEqual([]);
        expect(result.current.fetchingOptions).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    it('fetches teams successfully and populates options', async () => {
        const mockTeams = {
            teams: [
                { idTeam: '1', strTeam: 'New York Jets', strSport: 'American Football' },
                { idTeam: '2', strTeam: 'New York Giants', strSport: 'American Football' }
            ]
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockTeams
        });

        const { result } = renderHook(() => useTeamSearch());

        await act(async () => {
            await result.current.fetchTeams('New York');
        });

        expect(fetch).toHaveBeenCalledWith('/api/team?t=New%20York');
        expect(result.current.teamOptions).toHaveLength(2);
        expect(result.current.teamOptions[0].strTeam).toBe('New York Jets');
    });

    it('handles team selection correctly and triggers full profile fetch', async () => {
        const fullProfile = {
            teams: [
                { idTeam: '1', strTeam: 'New York Jets', strDescriptionEN: 'Full rich details' }
            ]
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => fullProfile
        });

        const { result } = renderHook(() => useTeamSearch());

        await act(async () => {
            // Simulate selecting a team from the dropdown
            await result.current.searchTeam({ idTeam: '1', strTeam: 'New York Jets' });
        });

        expect(fetch).toHaveBeenCalledWith('/api/team?id=1');
        expect(result.current.teamSearchResult.strDescriptionEN).toBe('Full rich details');
        expect(result.current.teamOptions).toEqual([]); // Options should immediately clear after selection
    });
});

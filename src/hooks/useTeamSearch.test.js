import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useTeamSearch } from './useTeamSearch';

// Mock global fetch
global.fetch = jest.fn();

describe('useTeamSearch Hook (v2)', () => {
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

    it('fetches teams via v2 search and populates options', async () => {
        const mockResponse = {
            search: [
                { idTeam: '1', strTeam: 'Cardinals', strSport: 'Baseball' },
                { idTeam: '2', strTeam: 'Cardinals', strSport: 'American Football' }
            ]
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const { result } = renderHook(() => useTeamSearch());

        await act(async () => {
            await result.current.fetchTeams('Cardinals');
        });

        expect(fetch).toHaveBeenCalledWith('/api/team?t=Cardinals');
        expect(result.current.teamOptions).toHaveLength(2);
        expect(result.current.teamOptions[0].strTeam).toBe('Cardinals');
    });

    it('handles team selection via v2 lookup', async () => {
        const fullProfile = {
            lookup: [
                { idTeam: '1', strTeam: 'Cardinals', strDescriptionEN: 'Full rich details' }
            ]
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => fullProfile
        });

        const { result } = renderHook(() => useTeamSearch());

        await act(async () => {
            await result.current.searchTeam({ idTeam: '1', strTeam: 'Cardinals' });
        });

        expect(fetch).toHaveBeenCalledWith('/api/team?id=1');
        expect(result.current.teamSearchResult.strDescriptionEN).toBe('Full rich details');
        expect(result.current.teamOptions).toEqual([]);
    });
});

import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useTeamSearch } from './useTeamSearch';

// Mock global fetch
global.fetch = jest.fn();

describe('useTeamSearch Hook (autocomplete)', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('initializes with empty states', () => {
        const { result } = renderHook(() => useTeamSearch());
        expect(result.current.teamOptions).toEqual([]);
        expect(result.current.error).toBeNull();
        expect(result.current.fetchingOptions).toBe(false);
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

    it('clears options for queries shorter than 2 characters', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ search: [{ idTeam: '1', strTeam: 'Cardinals' }] })
        });

        const { result } = renderHook(() => useTeamSearch());

        await act(async () => {
            await result.current.fetchTeams('Cardinals');
        });
        expect(result.current.teamOptions).toHaveLength(1);

        await act(async () => {
            await result.current.fetchTeams('C');
        });
        expect(result.current.teamOptions).toEqual([]);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('sets an error when the search request rejects', async () => {
        fetch.mockRejectedValueOnce(new Error('Network down'));

        const { result } = renderHook(() => useTeamSearch());

        await act(async () => {
            await result.current.fetchTeams('Cardinals');
        });

        expect(result.current.error).toContain('Error searching for teams');
        expect(result.current.fetchingOptions).toBe(false);
    });

    it('ignores stale autocomplete responses that resolve after a newer request', async () => {
        let resolveFirst;
        const firstResponse = new Promise(resolve => { resolveFirst = resolve; });

        fetch
            .mockImplementationOnce(() => firstResponse)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ search: [{ idTeam: '2', strTeam: 'Newest' }] })
            });

        const { result } = renderHook(() => useTeamSearch());

        let firstCall;
        act(() => {
            firstCall = result.current.fetchTeams('Old');
        });

        await act(async () => {
            await result.current.fetchTeams('New');
        });

        // The older request resolves last and must not overwrite the newer options
        await act(async () => {
            resolveFirst({
                ok: true,
                json: async () => ({ search: [{ idTeam: '1', strTeam: 'Stale' }] })
            });
            await firstCall;
        });

        expect(result.current.teamOptions).toEqual([{ idTeam: '2', strTeam: 'Newest' }]);
    });
});

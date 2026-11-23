/**
 * @jest-environment node
 */
import { searchTeams, getTeam, getSchedule, UpstreamError, ConfigError } from './sportsDb';

// Mock global fetch
global.fetch = jest.fn();

// Mock the local team index
jest.mock('../data/teams.json', () => [
    { idTeam: '134860', strTeam: 'New York Knicks', strTeamShort: 'NYK', strLeague: 'NBA', strSport: 'Basketball' },
    { idTeam: '134894', strTeam: 'Westchester Knicks', strTeamShort: null, strLeague: 'NBA G League', strSport: 'Basketball' },
    { idTeam: '134862', strTeam: 'Boston Celtics', strTeamShort: 'BOS', strLeague: 'NBA', strSport: 'Basketball' },
]);

describe('sportsDb data layer', () => {
    let consoleSpy;

    beforeEach(() => {
        fetch.mockClear();
        process.env.SPORTS_DB_API_KEY = 'test_key';
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('searchTeams', () => {
        it('returns upstream results and fetches with a 3600s revalidate', async () => {
            const mockSearch = { search: [{ idTeam: '100', strTeam: 'Cardinals' }] };
            fetch.mockResolvedValueOnce({ ok: true, json: async () => mockSearch });

            const results = await searchTeams('Cardinals');

            expect(results).toEqual(mockSearch.search);
            expect(fetch).toHaveBeenCalledWith(
                'https://www.thesportsdb.com/api/v2/json/search/team/Cardinals',
                expect.objectContaining({
                    headers: { 'X-API-KEY': 'test_key' },
                    next: { revalidate: 3600 },
                })
            );
        });

        it('encodes the query in the upstream URL', async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ search: [] }) });

            await searchTeams('LA Lakers & more');

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/search/team/LA%20Lakers%20%26%20more'),
                expect.anything()
            );
        });

        it('falls back to the local index when upstream returns no results', async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ search: null }) });

            const results = await searchTeams('knicks');

            expect(results).toHaveLength(2);
            expect(results[0].strTeam).toBe('New York Knicks');
        });

        it('falls back to the local index when upstream responds non-OK', async () => {
            fetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });

            const results = await searchTeams('knicks');

            expect(results).toHaveLength(2);
            expect(results[0].strTeam).toBe('New York Knicks');
        });

        it('throws UpstreamError when upstream is non-OK and the local index misses', async () => {
            fetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });

            await expect(searchTeams('zzzzzzz')).rejects.toThrow(UpstreamError);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('/search/team/zzzzzzz')
            );
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('503'));
            // The API key must never appear in logs
            expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('test_key'));
        });
    });

    describe('getTeam', () => {
        it('returns the first lookup entry and fetches with an 86400s revalidate', async () => {
            const team = { idTeam: '134860', strTeam: 'New York Knicks' };
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ lookup: [team] }) });

            const result = await getTeam('134860');

            expect(result).toEqual(team);
            expect(fetch).toHaveBeenCalledWith(
                'https://www.thesportsdb.com/api/v2/json/lookup/team/134860',
                expect.objectContaining({ next: { revalidate: 86400 } })
            );
        });

        it('returns null when the lookup finds no team', async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ lookup: null }) });

            expect(await getTeam('999999999')).toBeNull();
        });

        it('throws UpstreamError on non-OK responses', async () => {
            fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });

            await expect(getTeam('134860')).rejects.toThrow(UpstreamError);
        });
    });

    describe('getSchedule', () => {
        it('returns the full schedule with isFallback=false and a 60s revalidate', async () => {
            const mockSchedule = { schedule: [{ idEvent: '1' }] };
            fetch.mockResolvedValueOnce({ ok: true, json: async () => mockSchedule });

            const result = await getSchedule('134860');

            expect(result).toEqual({ schedule: mockSchedule.schedule, isFallback: false });
            expect(fetch).toHaveBeenCalledWith(
                'https://www.thesportsdb.com/api/v2/json/schedule/full/team/134860',
                expect.objectContaining({ next: { revalidate: 60 } })
            );
        });

        it('falls back to previous + next endpoints when the full schedule is empty', async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ schedule: [] }) });
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ schedule: [{ idEvent: 'p1' }] }) });
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ schedule: [{ idEvent: 'n1' }] }) });

            const result = await getSchedule('134860');

            expect(result.schedule).toEqual([{ idEvent: 'p1' }, { idEvent: 'n1' }]);
            expect(result.isFallback).toBe(true);
            expect(fetch).toHaveBeenCalledTimes(3);
            for (const call of fetch.mock.calls) {
                expect(call[1]).toEqual(expect.objectContaining({ next: { revalidate: 60 } }));
            }
        });

        it('throws UpstreamError when the full schedule responds non-OK', async () => {
            fetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });

            await expect(getSchedule('134860')).rejects.toThrow(UpstreamError);
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('throws UpstreamError when a fallback endpoint responds non-OK', async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ schedule: [] }) });
            fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ schedule: [] }) });

            await expect(getSchedule('134860')).rejects.toThrow(UpstreamError);
        });
    });

    describe('configuration', () => {
        it('throws ConfigError for every function when the API key is missing', async () => {
            delete process.env.SPORTS_DB_API_KEY;

            await expect(searchTeams('knicks')).rejects.toThrow(ConfigError);
            await expect(getTeam('134860')).rejects.toThrow(ConfigError);
            await expect(getSchedule('134860')).rejects.toThrow(ConfigError);
            expect(fetch).not.toHaveBeenCalled();
        });
    });
});

/**
 * @jest-environment node
 */
import { GET } from './route';

// Mock the teams.json static import
jest.mock('../../../data/teams.json', () => [
    { idTeam: '100', strTeam: 'Manchester United', strSport: 'Soccer', strLeague: 'EPL', strTeamAlternate: 'Man Utd', strBadge: '' },
    { idTeam: '101', strTeam: 'Manchester City', strSport: 'Soccer', strLeague: 'EPL', strTeamAlternate: 'Man City', strBadge: '' },
    { idTeam: '102', strTeam: 'LA Lakers', strSport: 'Basketball', strLeague: 'NBA', strTeamAlternate: 'Lakers', strBadge: '' },
    { idTeam: '103', strTeam: 'New York Yankees', strSport: 'Baseball', strLeague: 'MLB', strTeamAlternate: 'Yankees', strBadge: '' },
]);

// Mock global fetch for the remote API calls
global.fetch = jest.fn();

describe('/api/team Route', () => {
    beforeEach(() => {
        fetch.mockClear();
        process.env.SPORTS_DB_API_KEY = 'test_key';
    });

    function createRequest(params = '') {
        return { url: `http://localhost:3000/api/team${params}` };
    }

    // --- Search mode tests (using local JSON) ---

    it('returns empty array for queries shorter than 2 characters', async () => {
        const response = await GET(createRequest('?t=A'));
        const data = await response.json();

        expect(data.teams).toEqual([]);
    });

    it('returns empty array when no query is provided', async () => {
        const response = await GET(createRequest());
        const data = await response.json();

        expect(data.teams).toEqual([]);
    });

    it('returns matching teams for a valid search query', async () => {
        const response = await GET(createRequest('?t=manchester'));
        const data = await response.json();

        expect(data.teams).toHaveLength(2);
        expect(data.teams[0].strTeam).toBe('Manchester United');
        expect(data.teams[1].strTeam).toBe('Manchester City');
    });

    it('matches against alternate team names', async () => {
        const response = await GET(createRequest('?t=yankees'));
        const data = await response.json();

        expect(data.teams).toHaveLength(1);
        expect(data.teams[0].strTeam).toBe('New York Yankees');
    });

    it('performs case-insensitive search', async () => {
        const response = await GET(createRequest('?t=LAKERS'));
        const data = await response.json();

        expect(data.teams).toHaveLength(1);
        expect(data.teams[0].strTeam).toBe('LA Lakers');
    });

    // --- ID lookup mode tests (using remote API) ---

    it('fetches team profile from TheSportsDB when id param is provided', async () => {
        const mockProfile = { teams: [{ idTeam: '100', strTeam: 'Manchester United', strDescriptionEN: 'Full details' }] };

        fetch.mockResolvedValueOnce({
            json: async () => mockProfile,
        });

        const response = await GET(createRequest('?id=100'));
        const data = await response.json();

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('test_key/lookupteam.php?id=100')
        );
        expect(data.teams[0].strDescriptionEN).toBe('Full details');
    });

    it('returns 500 when remote API lookup fails', async () => {
        fetch.mockRejectedValueOnce(new Error('API down'));

        const response = await GET(createRequest('?id=100'));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to lookup team details');
    });
});

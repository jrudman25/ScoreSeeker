/**
 * @jest-environment node
 */
import TeamPage, { generateMetadata, generateStaticParams, revalidate } from './page';
import { notFound } from 'next/navigation';

// Mock global fetch
global.fetch = jest.fn();

jest.mock('next/navigation', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_NOT_FOUND');
    }),
}));

// Tone.js is ESM-only and crashes Jest; it is unused by the page itself
jest.mock('tone', () => ({}));

const mockTeam = {
    idTeam: '134860',
    strTeam: 'New York Knicks',
    strBadge: 'https://example.com/knicks.png',
};

const okJson = (body) => ({ ok: true, json: async () => body });

describe('/team/[id] page', () => {
    beforeEach(() => {
        fetch.mockClear();
        notFound.mockClear();
        process.env.SPORTS_DB_API_KEY = 'test_key';
    });

    const pageProps = (id) => ({ params: Promise.resolve({ id }) });

    it('enables ISR with a 60s revalidate and no prerendered params', async () => {
        expect(revalidate).toBe(60);
        await expect(generateStaticParams()).resolves.toEqual([]);
    });

    it('renders the team details and schedule for a valid id', async () => {
        fetch.mockImplementation((url) => {
            if (url.includes('/lookup/team/')) {
                return Promise.resolve(okJson({ lookup: [mockTeam] }));
            }
            return Promise.resolve(okJson({ schedule: [{ idEvent: '1' }] }));
        });

        const element = await TeamPage(pageProps('134860'));

        expect(element).toBeTruthy();
        expect(notFound).not.toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/lookup/team/134860'),
            expect.anything()
        );
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/schedule/full/team/134860'),
            expect.anything()
        );
    });

    it('calls notFound for an invalid id without fetching', async () => {
        await expect(TeamPage(pageProps('abc'))).rejects.toThrow('NEXT_NOT_FOUND');
        expect(notFound).toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('calls notFound when the lookup returns no team', async () => {
        fetch.mockImplementation((url) => {
            if (url.includes('/lookup/team/')) {
                return Promise.resolve(okJson({ lookup: null }));
            }
            return Promise.resolve(okJson({ schedule: [] }));
        });

        await expect(TeamPage(pageProps('999999999'))).rejects.toThrow('NEXT_NOT_FOUND');
        expect(notFound).toHaveBeenCalled();
    });

    describe('generateMetadata', () => {
        const mockTeamAndSchedule = (team, schedule = []) => {
            fetch.mockImplementation((url) => {
                if (url.includes('/lookup/team/')) {
                    return Promise.resolve(okJson({ lookup: team ? [team] : null }));
                }
                return Promise.resolve(okJson({ schedule }));
            });
        };

        it('returns team-specific title, description, and og image', async () => {
            mockTeamAndSchedule(mockTeam);

            const metadata = await generateMetadata(pageProps('134860'));

            expect(metadata.title).toBe('New York Knicks | ScoreSeeker');
            expect(metadata.description).toBe('New York Knicks schedule, live scores, and results. Play music generated from each match score.');
            expect(metadata.openGraph.url).toBe('/team/134860');
            expect(metadata.openGraph.images).toEqual(['https://example.com/knicks.png']);
        });

        it('omits og images when the team has no badge', async () => {
            mockTeamAndSchedule({ ...mockTeam, strBadge: null });

            const metadata = await generateMetadata(pageProps('134860'));

            expect(metadata.openGraph.images).toBeUndefined();
        });

        it('sets canonical, league, next-match description, and twitter metadata', async () => {
            mockTeamAndSchedule(
                { ...mockTeam, strLeague: 'NBA' },
                [
                    { idEvent: 'past', dateEvent: '2020-01-01', strStatus: 'FT', strEvent: 'Old game' },
                    { idEvent: 'next', strTimestamp: '2099-01-01T19:00:00', strStatus: 'NS', strEvent: 'New York Knicks vs Boston Celtics' },
                ]
            );

            const metadata = await generateMetadata(pageProps('134860'));

            expect(metadata.alternates.canonical).toBe('/team/134860');
            expect(metadata.description).toContain('NBA');
            expect(metadata.description).toContain('Next match: New York Knicks vs Boston Celtics');
            expect(metadata.twitter.title).toBe(metadata.title);
            expect(metadata.twitter.description).toBe(metadata.description);
        });

        it('calls notFound for an invalid id', async () => {
            await expect(generateMetadata(pageProps('../../all/leagues'))).rejects.toThrow('NEXT_NOT_FOUND');
            expect(fetch).not.toHaveBeenCalled();
        });

        it('calls notFound when the team is missing', async () => {
            mockTeamAndSchedule(null);

            await expect(generateMetadata(pageProps('999999999'))).rejects.toThrow('NEXT_NOT_FOUND');
        });
    });
});

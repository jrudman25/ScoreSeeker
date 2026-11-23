/**
 * @jest-environment node
 */
import sitemap from './sitemap';
import { SITE_URL } from '../lib/siteUrl';
import teamIndex from '../data/teams.json';

describe('sitemap', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);

    it('starts with the home URL', () => {
        expect(entries[0]).toEqual({
            url: SITE_URL,
            changeFrequency: 'daily',
            priority: 1,
        });
    });

    it('includes the New York Knicks team page', () => {
        expect(urls).toContain(`${SITE_URL}/team/134862`);
    });

    it('excludes non-curated leagues like NCAA basketball', () => {
        const ncaa = teamIndex.find((t) => t.strLeague === 'NCAA Division I Basketball Mens');
        expect(ncaa).toBeDefined();
        expect(urls).not.toContain(`${SITE_URL}/team/${ncaa.idTeam}`);
    });

    it('has no duplicate URLs', () => {
        expect(new Set(urls).size).toBe(urls.length);
    });

    it('uses absolute SITE_URL for every entry', () => {
        for (const url of urls) {
            expect(url.startsWith(SITE_URL)).toBe(true);
        }
    });

    it('stays well under sitemap size limits', () => {
        expect(entries.length).toBeLessThan(1000);
    });
});

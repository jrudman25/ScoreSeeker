import { SITE_URL } from '../lib/siteUrl';
import { getSitemapTeamIds } from '../lib/sitemapTeams';

export default function sitemap() {
    return [
        { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
        ...getSitemapTeamIds().map((idTeam) => ({
            url: `${SITE_URL}/team/${idTeam}`,
            changeFrequency: 'daily',
            priority: 0.7,
        })),
    ];
}

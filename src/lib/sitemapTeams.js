import teamIndex from '../data/teams.json';
import { isValidTeamId } from '../utils/isValidTeamId';

// Major leagues only; exact strLeague strings as they appear in teams.json
export const SITEMAP_LEAGUES = [
    'NFL',
    'NBA',
    'MLB',
    'NHL',
    'WNBA',
    'American Major League Soccer',
    'English Premier League',
    'English League Championship',
    'Spanish La Liga',
    'German Bundesliga',
    'Italian Serie A',
    'French Ligue 1',
    'Dutch Eredivisie',
    'Portuguese Primeira Liga',
    'Scottish Premiership',
    'UEFA Champions League',
    'Mexican Primera League',
    'Brazilian Serie A',
    'Argentinian Primera Division',
    'Japanese J1 League',
    'Australian A-League',
    'Indian Premier League',
    'Super Rugby',
    'Formula 1',
];

/**
 * Team IDs for the sitemap: exact league match, valid numeric ID,
 * deduplicated (UCL teams overlap domestic leagues), sorted numerically.
 */
export const getSitemapTeamIds = () => {
    const leagues = new Set(SITEMAP_LEAGUES);
    const ids = new Set();
    for (const team of teamIndex) {
        if (leagues.has(team.strLeague) && isValidTeamId(team.idTeam)) {
            ids.add(team.idTeam);
        }
    }
    return [...ids].sort((a, b) => Number(a) - Number(b));
};

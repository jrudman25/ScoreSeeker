import { isFinished, isLive, parseMatchDate } from './helpers';

/**
 * Returns the earliest upcoming match: not finished, not live, dated, and
 * strictly after `now`. Returns null when no such match exists.
 */
export const findNextMatch = (schedule, now = new Date()) => {
    let next = null;
    let nextTime = Infinity;
    for (const match of schedule || []) {
        if (isFinished(match) || isLive(match)) {
            continue;
        }
        const date = parseMatchDate(match);
        if (!date) {
            continue;
        }
        const time = date.getTime();
        if (time > now.getTime() && time < nextTime) {
            next = match;
            nextTime = time;
        }
    }
    return next;
};

export const formatMatchLabel = (match) => {
    if (match.strEvent) {
        return match.strEvent;
    }
    if (match.strHomeTeam && match.strAwayTeam) {
        return `${match.strHomeTeam} vs ${match.strAwayTeam}`;
    }
    return null;
};

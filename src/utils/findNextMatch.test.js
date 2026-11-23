import { findNextMatch, formatMatchLabel } from './findNextMatch';

describe('findNextMatch', () => {
    const now = new Date('2024-06-01T00:00:00Z');

    it('picks the earliest future match from unsorted input', () => {
        const schedule = [
            { idEvent: 'later', strTimestamp: '2024-07-01T18:00:00', strStatus: 'NS' },
            { idEvent: 'soonest', strTimestamp: '2024-06-10T18:00:00', strStatus: 'NS' },
            { idEvent: 'past', strTimestamp: '2024-05-01T18:00:00', strStatus: 'NS' },
        ];
        expect(findNextMatch(schedule, now).idEvent).toBe('soonest');
    });

    it('skips finished, live, past, and undated matches', () => {
        const schedule = [
            { idEvent: 'finished', strTimestamp: '2099-01-01T00:00:00', strStatus: 'FT' },
            { idEvent: 'live', strTimestamp: '2099-01-01T00:00:00', strStatus: '1H' },
            { idEvent: 'past', strTimestamp: '2000-01-01T00:00:00', strStatus: 'NS' },
            { idEvent: 'undated', strStatus: 'NS' },
            { idEvent: 'next', strTimestamp: '2099-01-02T00:00:00', strStatus: 'NS' },
        ];
        expect(findNextMatch(schedule, now).idEvent).toBe('next');
    });

    it('returns null for empty or undefined schedules', () => {
        expect(findNextMatch([], now)).toBeNull();
        expect(findNextMatch(undefined, now)).toBeNull();
        expect(findNextMatch(null, now)).toBeNull();
    });
});

describe('formatMatchLabel', () => {
    it('prefers strEvent when present', () => {
        expect(formatMatchLabel({ strEvent: 'Final', strHomeTeam: 'A', strAwayTeam: 'B' })).toBe('Final');
    });

    it('falls back to home vs away', () => {
        expect(formatMatchLabel({ strHomeTeam: 'Knicks', strAwayTeam: 'Celtics' })).toBe('Knicks vs Celtics');
    });

    it('returns null when neither is available', () => {
        expect(formatMatchLabel({ strHomeTeam: 'Knicks' })).toBeNull();
        expect(formatMatchLabel({})).toBeNull();
    });
});

import { convertTime, isScoreValid, isLive, isFinished, normalizeScore, parseMatchDate } from './helpers';

describe('Helper Functions', () => {
    describe('convertTime', () => {
        it('handles missing timestamp', () => {
             expect(convertTime(null, 'America/Los_Angeles')).toBe('Time not available');
        });
        it('formats ISO strings without crashing', () => {
             const res = convertTime('2024-01-01T20:00:00', 'America/New_York');
             expect(res).toBeDefined();
             expect(typeof res).toBe('string');
        });
    });

    describe('isScoreValid', () => {
        it('validates 0 as a valid score', () => {
            expect(isScoreValid("0")).toBe(true);
            expect(isScoreValid(0)).toBe(true);
        });
        
        it('rejects null and empty strings', () => {
            expect(isScoreValid(null)).toBe(false);
            expect(isScoreValid("")).toBe(false);
            expect(isScoreValid("null")).toBe(false);
        });
    });

    describe('isLive', () => {
        it('returns false for finished match status codes', () => {
            expect(isLive({ strStatus: "FT" })).toBe(false);
            expect(isLive({ strStatus: "MATCH FINISHED" })).toBe(false);
            expect(isLive({ strStatus: "AOT" })).toBe(false);
        });
        
        it('returns false for not started games', () => {
            expect(isLive({ strStatus: "NS" })).toBe(false);
            expect(isLive({ strStatus: "NOT STARTED" })).toBe(false);
        });
        
        it('returns true for active, in-progress games', () => {
            expect(isLive({ strStatus: "1H" })).toBe(true);
            expect(isLive({ strStatus: "In Progress" })).toBe(true);
        });

        it('returns false for missing or empty status', () => {
            expect(isLive({ strStatus: null })).toBe(false);
            expect(isLive({ strStatus: undefined })).toBe(false);
            expect(isLive({ strStatus: "" })).toBe(false);
            expect(isLive({})).toBe(false);
        });
    });

    describe('parseMatchDate', () => {
        it('parses dateEvent + strTime as UTC', () => {
            const date = parseMatchDate({ dateEvent: '2024-01-01', strTime: '23:30:00' });
            expect(date.getTime()).toBe(Date.UTC(2024, 0, 1, 23, 30));
        });

        it('defaults missing strTime to midnight UTC', () => {
            const date = parseMatchDate({ dateEvent: '2024-01-01' });
            expect(date.getTime()).toBe(Date.UTC(2024, 0, 1));
        });

        it('prefers strTimestamp over dateEvent', () => {
            const date = parseMatchDate({
                strTimestamp: '2024-06-15T19:00:00',
                dateEvent: '2024-01-01',
                strTime: '23:30:00',
            });
            expect(date.getTime()).toBe(Date.UTC(2024, 5, 15, 19, 0));
        });

        it('does not double-suffix strings that already carry a zone', () => {
            const zoned = parseMatchDate({ strTimestamp: '2024-06-15T19:00:00Z' });
            expect(zoned.getTime()).toBe(Date.UTC(2024, 5, 15, 19, 0));

            const offset = parseMatchDate({ strTimestamp: '2024-06-15T19:00:00+02:00' });
            expect(offset.getTime()).toBe(Date.UTC(2024, 5, 15, 17, 0));
        });

        it('returns null when no date info exists', () => {
            expect(parseMatchDate({})).toBeNull();
            expect(parseMatchDate({ strStatus: 'NS' })).toBeNull();
        });
    });

    describe('isFinished', () => {
        it('returns true for finished status codes', () => {
            expect(isFinished({ strStatus: "FT" })).toBe(true);
            expect(isFinished({ strStatus: "Match Finished" })).toBe(true);
            expect(isFinished({ strStatus: "AET" })).toBe(true);
        });

        it('returns false for non-finished status codes', () => {
            expect(isFinished({ strStatus: "NS" })).toBe(false);
            expect(isFinished({ strStatus: "1H" })).toBe(false);
            expect(isFinished({ strStatus: "" })).toBe(false);
        });
    });

    describe('normalizeScore', () => {
        it('returns score as-is when not null', () => {
            expect(normalizeScore("3", { strStatus: "FT" })).toBe("3");
            expect(normalizeScore("0", { strStatus: "FT" })).toBe("0");
        });

        it('coerces null to "0" for finished matches', () => {
            expect(normalizeScore(null, { strStatus: "FT" })).toBe("0");
            expect(normalizeScore(null, { strStatus: "Match Finished" })).toBe("0");
        });

        it('coerces null to "0" for live matches', () => {
            expect(normalizeScore(null, { strStatus: "1H" })).toBe("0");
        });

        it('keeps null for not-started matches', () => {
            expect(normalizeScore(null, { strStatus: "NS" })).toBe(null);
        });
    });
});

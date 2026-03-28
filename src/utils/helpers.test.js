import { convertTime, isScoreValid, isLive, isFinished, normalizeScore } from './helpers';

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

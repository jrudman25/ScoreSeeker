import { isValidTeamId } from './isValidTeamId';

describe('isValidTeamId', () => {
    it('accepts numeric string IDs up to 10 digits', () => {
        expect(isValidTeamId('1')).toBe(true);
        expect(isValidTeamId('134860')).toBe(true);
        expect(isValidTeamId('1234567890')).toBe(true);
    });

    it('rejects non-numeric and traversal values', () => {
        expect(isValidTeamId('abc')).toBe(false);
        expect(isValidTeamId('../../all/leagues')).toBe(false);
        expect(isValidTeamId('123abc')).toBe(false);
        expect(isValidTeamId('12 34')).toBe(false);
        expect(isValidTeamId('')).toBe(false);
        expect(isValidTeamId('12345678901')).toBe(false);
    });

    it('rejects non-string values', () => {
        expect(isValidTeamId(12345)).toBe(false);
        expect(isValidTeamId(null)).toBe(false);
        expect(isValidTeamId(undefined)).toBe(false);
    });
});

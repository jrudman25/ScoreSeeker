import { getSeedFromString } from './musicGenerator';

// Mock Tone.js to prevent Jest from crashing on ESM node_modules imports
jest.mock('tone', () => ({}));

describe('Audio Engine Determinism', () => {
    it('generates the exact same mathematical seed for identical string inputs', () => {
        const seed1 = getSeedFromString("match_12345");
        const seed2 = getSeedFromString("match_12345");
        
        expect(seed1).toBe(seed2);
        expect(seed1).toBeGreaterThan(0);
        expect(Number.isInteger(seed1)).toBe(true);
    });

    it('generates different seeds for different inputs', () => {
        const seed1 = getSeedFromString("match_12345");
        const seed2 = getSeedFromString("match_99999");
        
        expect(seed1).not.toBe(seed2);
    });

    it('safely handles empty strings or undefined', () => {
        expect(getSeedFromString("")).toBe(0);
        expect(getSeedFromString(null)).toBe(0);
        expect(getSeedFromString(undefined)).toBe(0);
    });
});

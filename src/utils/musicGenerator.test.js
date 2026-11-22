import { getSeedFromString, playMatchTheme } from './musicGenerator';
import * as Tone from 'tone';

// Mock Tone.js to prevent Jest from crashing on ESM node_modules imports
jest.mock('tone', () => ({
    start: jest.fn(),
}));

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

describe('playMatchTheme', () => {
    it('calls onStop when audio startup fails', async () => {
        Tone.start.mockRejectedValueOnce(new Error('Audio context unavailable'));
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const onStop = jest.fn();

        await playMatchTheme({ idEvent: '1', strEvent: 'A vs B' }, onStop);

        expect(onStop).toHaveBeenCalledTimes(1);
        warnSpy.mockRestore();
    });
});

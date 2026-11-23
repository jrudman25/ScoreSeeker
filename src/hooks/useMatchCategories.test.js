import { renderHook, act } from '@testing-library/react';
import { useMatchCategories } from './useMatchCategories';

describe('useMatchCategories Hook', () => {
    it('initializes safely with empty states', () => {
        const { result } = renderHook(() => useMatchCategories([], 'America/Los_Angeles'));

        expect(result.current.pastMatchInfo).toEqual([]);
        expect(result.current.currentMatchInfo).toEqual([]);
        expect(result.current.upcomingMatchInfo).toEqual([]);
        expect(result.current.pastPage).toBe(1);
        expect(result.current.upcomingPage).toBe(1);
    });

    it('categorizes past, live, and upcoming matches correctly', () => {
        const schedule = [
            { idEvent: '1', dateEvent: '2020-01-01', strTime: '12:00:00', strStatus: 'Match Finished' },
            { idEvent: '2', dateEvent: '2030-01-01', strTime: '12:00:00', strStatus: 'Not Started' },
            { idEvent: '3', dateEvent: '2030-01-02', strTime: '12:00:00', strStatus: '1H' },
        ];

        const { result } = renderHook(() => useMatchCategories(schedule, 'America/New_York'));

        expect(result.current.pastMatchInfo.map(m => m.idEvent)).toEqual(['1']);
        expect(result.current.currentMatchInfo.map(m => m.idEvent)).toEqual(['3']);
        expect(result.current.upcomingMatchInfo.map(m => m.idEvent)).toEqual(['2']);
    });

    it('sorts matches by date so past matches list most recent first', () => {
        const schedule = [
            { idEvent: 'old', dateEvent: '2020-01-01', strStatus: 'FT' },
            { idEvent: 'new', dateEvent: '2024-06-15', strStatus: 'FT' },
        ];

        const { result } = renderHook(() => useMatchCategories(schedule, 'UTC'));

        expect(result.current.pastMatchInfo.map(m => m.idEvent)).toEqual(['new', 'old']);
    });

    it('handles an empty schedule gracefully', () => {
        const { result } = renderHook(() => useMatchCategories([], 'UTC'));

        expect(result.current.pastMatchInfo).toEqual([]);
        expect(result.current.upcomingMatchInfo).toEqual([]);
        expect(result.current.pastPageCount).toBe(1);
        expect(result.current.upcomingPageCount).toBe(1);
    });

    it('exposes pagination state for past and upcoming matches', () => {
        const pastMatches = Array.from({ length: 15 }, (_, i) => ({
            idEvent: String(i),
            dateEvent: '2020-01-01',
            strTime: '12:00:00',
            strStatus: 'Match Finished'
        }));

        const { result } = renderHook(() => useMatchCategories(pastMatches, 'America/Los_Angeles'));

        expect(result.current.pastMatchInfo).toHaveLength(10);
        expect(result.current.pastPage).toBe(1);
        expect(result.current.pastPageCount).toBe(2);
    });

    it('changes pages via the page change handlers', () => {
        const pastMatches = Array.from({ length: 15 }, (_, i) => ({
            idEvent: String(i),
            dateEvent: '2020-01-01',
            strStatus: 'FT'
        }));

        const { result } = renderHook(() => useMatchCategories(pastMatches, 'UTC'));

        act(() => {
            result.current.onPastPageChange(null, 2);
        });

        expect(result.current.pastPage).toBe(2);
        expect(result.current.pastMatchInfo).toHaveLength(5);
    });
});

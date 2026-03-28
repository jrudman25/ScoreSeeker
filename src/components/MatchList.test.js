import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MatchList from './MatchList';

describe('MatchList Component', () => {
    const mockConvertTime = jest.fn((ts) => `Formatted: ${ts}`);
    const mockIsScoreValid = jest.fn((score) => score !== null && score !== '' && !isNaN(Number(score)));
    const mockIsLive = jest.fn(() => false);
    const mockOnPlayAudio = jest.fn();

    const sampleMatches = [
        {
            idEvent: '100',
            strEvent: 'Team A vs Team B',
            strTimestamp: '2024-06-15T19:00:00',
            strVenue: 'Stadium X',
            strStatus: 'Match Finished',
            intHomeScore: '3',
            intAwayScore: '1',
            strHomeTeam: 'Team A',
            strAwayTeam: 'Team B',
            intRound: '5',
        },
        {
            idEvent: '101',
            strEvent: 'Team C vs Team D',
            strTimestamp: '2024-06-16T20:00:00',
            strVenue: 'Stadium Y',
            strStatus: 'Match Finished',
            intHomeScore: '0',
            intAwayScore: '2',
            strHomeTeam: 'Team C',
            strAwayTeam: 'Team D',
            intRound: '6',
        },
    ];

    const defaultProps = {
        title: 'Past Matches',
        matches: sampleMatches,
        convertTime: mockConvertTime,
        isScoreValid: mockIsScoreValid,
        isLive: mockIsLive,
        darkMode: false,
        disableAudio: false,
        playingMatchId: null,
        onPlayAudio: mockOnPlayAudio,
        selectedTeamName: 'Team A',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the section title', () => {
        render(<MatchList {...defaultProps} />);
        expect(screen.getByText('Past Matches')).toBeInTheDocument();
    });

    it('renders all match entries', () => {
        render(<MatchList {...defaultProps} />);
        expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
        expect(screen.getByText('Team C vs Team D')).toBeInTheDocument();
    });

    it('shows "No matches available" when matches array is empty', () => {
        render(<MatchList {...defaultProps} matches={[]} />);
        expect(screen.getByText('No matches available')).toBeInTheDocument();
    });

    it('displays formatted time for each match', () => {
        render(<MatchList {...defaultProps} />);
        expect(screen.getByText('Formatted: 2024-06-15T19:00:00')).toBeInTheDocument();
    });

    it('displays score in Home Score – Away Score format', () => {
        render(<MatchList {...defaultProps} />);
        // Score is now always Home - Away format
        expect(screen.getByText(/Team A 3 – Team B 1/)).toBeInTheDocument();
        expect(screen.getByText(/Team C 0 – Team D 2/)).toBeInTheDocument();
    });

    it('shows W indicator for a win', () => {
        render(<MatchList {...defaultProps} selectedTeamName="Team A" />);
        // Team A won match 100 (3-1 as home)
        expect(screen.getByText('W')).toBeInTheDocument();
    });

    it('shows L indicator for a loss', () => {
        render(<MatchList {...defaultProps} selectedTeamName="Team C" />);
        // Team C lost match 101 (0-2 as home)
        expect(screen.getByText('L')).toBeInTheDocument();
    });

    it('shows fallback text when scores are invalid', () => {
        const noScoreMatches = [{
            ...sampleMatches[0],
            intHomeScore: null,
            intAwayScore: null,
            strStatus: 'ABD',
        }];
        render(<MatchList {...defaultProps} matches={noScoreMatches} />);
        expect(screen.getByText('Score not natively recorded by TheSportsDB')).toBeInTheDocument();
    });

    it('calls onPlayAudio when a match row is clicked', () => {
        render(<MatchList {...defaultProps} />);
        fireEvent.click(screen.getByText('Team A vs Team B'));
        expect(mockOnPlayAudio).toHaveBeenCalledWith(sampleMatches[0]);
    });

    it('does NOT call onPlayAudio when disableAudio is true', () => {
        render(<MatchList {...defaultProps} disableAudio={true} />);
        fireEvent.click(screen.getByText('Team A vs Team B'));
        expect(mockOnPlayAudio).not.toHaveBeenCalled();
    });

    it('shows live status indicator when isLive returns true', () => {
        mockIsLive.mockReturnValue(true);
        const liveMatch = [{
            ...sampleMatches[0],
            strStatus: '2H',
        }];
        render(<MatchList {...defaultProps} matches={liveMatch} />);
        expect(screen.getByText('Live: 2H')).toBeInTheDocument();
    });

    it('renders playing indicator for the currently playing match', () => {
        const { container } = render(
            <MatchList {...defaultProps} playingMatchId="100" />
        );
        const playingIcons = container.querySelectorAll('[data-testid="GraphicEqIcon"]');
        expect(playingIcons.length).toBe(1);
    });

    it('renders play icons for non-playing matches when audio is enabled', () => {
        const { container } = render(<MatchList {...defaultProps} />);
        const playIcons = container.querySelectorAll('[data-testid="PlayCircleOutlineIcon"]');
        expect(playIcons.length).toBe(2);
    });

    it('does not render play icons when disableAudio is true', () => {
        const { container } = render(
            <MatchList {...defaultProps} disableAudio={true} />
        );
        const playIcons = container.querySelectorAll('[data-testid="PlayCircleOutlineIcon"]');
        const eqIcons = container.querySelectorAll('[data-testid="GraphicEqIcon"]');
        expect(playIcons.length).toBe(0);
        expect(eqIcons.length).toBe(0);
    });

    it('renders round labels as chips', () => {
        render(<MatchList {...defaultProps} />);
        const chips = screen.getAllByText('Regular Season');
        expect(chips).toHaveLength(2);
    });

    it('shows Preseason label for round >= 500', () => {
        const preseasonMatch = [{ ...sampleMatches[0], intRound: '500' }];
        render(<MatchList {...defaultProps} matches={preseasonMatch} />);
        expect(screen.getByText('Preseason')).toBeInTheDocument();
    });

    it('shows Postseason label for round 200-499', () => {
        const postseasonMatch = [{ ...sampleMatches[0], intRound: '300' }];
        render(<MatchList {...defaultProps} matches={postseasonMatch} />);
        expect(screen.getByText('Postseason')).toBeInTheDocument();
    });

    it('renders pagination when pageCount is greater than 1', () => {
        render(
            <MatchList {...defaultProps} page={1} pageCount={3} onPageChange={jest.fn()} />
        );
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('does not render pagination when pageCount is 1', () => {
        render(
            <MatchList {...defaultProps} page={1} pageCount={1} onPageChange={jest.fn()} />
        );
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('does not render pagination when pageCount is not provided', () => {
        render(<MatchList {...defaultProps} />);
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
});

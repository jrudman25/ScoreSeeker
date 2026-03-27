import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamSearch from './TeamSearch';

describe('TeamSearch Component', () => {
    const mockOnSearch = jest.fn();
    const mockFetchTeams = jest.fn();

    const defaultProps = {
        onSearch: mockOnSearch,
        teamOptions: [],
        loading: false,
        fetchTeams: mockFetchTeams,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the search input with correct label', () => {
        render(<TeamSearch {...defaultProps} />);
        expect(screen.getByLabelText('Search for a team...')).toBeInTheDocument();
    });

    it('calls fetchTeams after 500ms debounce when input changes', async () => {
        jest.useRealTimers(); // Use real timers for userEvent

        render(<TeamSearch {...defaultProps} />);
        const input = screen.getByLabelText('Search for a team...');

        await userEvent.type(input, 'Lakers');

        // fetchTeams should be called after the debounce
        await waitFor(() => {
            expect(mockFetchTeams).toHaveBeenCalledWith('Lakers');
        }, { timeout: 2000 });
    });

    it('does NOT call fetchTeams immediately on keystroke', () => {
        render(<TeamSearch {...defaultProps} />);
        const input = screen.getByLabelText('Search for a team...');

        fireEvent.change(input, { target: { value: 'La' } });

        // Should not have called yet (debounce hasn't fired)
        expect(mockFetchTeams).not.toHaveBeenCalled();
    });

    it('shows loading spinner when loading prop is true', () => {
        render(<TeamSearch {...defaultProps} loading={true} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not show loading spinner when loading is false', () => {
        render(<TeamSearch {...defaultProps} loading={false} />);
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('calls onSearch when an option is selected', async () => {
        jest.useRealTimers();

        const teamOptions = [
            { idTeam: '1', strTeam: 'LA Lakers', strSport: 'Basketball', strLeague: 'NBA' },
            { idTeam: '2', strTeam: 'LA Clippers', strSport: 'Basketball', strLeague: 'NBA' },
        ];

        render(<TeamSearch {...defaultProps} teamOptions={teamOptions} />);

        const input = screen.getByLabelText('Search for a team...');
        await userEvent.click(input);

        // The options should be visible in the dropdown
        const option = await screen.findByText('LA Lakers (Basketball - NBA)');
        await userEvent.click(option);

        expect(mockOnSearch).toHaveBeenCalledWith(teamOptions[0]);
    });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import TeamSearch from './TeamSearch';

// Mock global fetch
global.fetch = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('TeamSearch Component', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue({ push: mockPush });
    });

    const searchResponse = (teams) => ({
        ok: true,
        json: async () => ({ search: teams }),
    });

    it('renders the search input with correct label', () => {
        render(<TeamSearch />);
        expect(screen.getByLabelText('Search for a team...')).toBeInTheDocument();
    });

    it('fetches matching teams after the debounce when input changes', async () => {
        fetch.mockResolvedValueOnce(searchResponse([]));

        render(<TeamSearch />);
        const input = screen.getByLabelText('Search for a team...');

        await userEvent.type(input, 'Lakers');

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/team?t=Lakers');
        }, { timeout: 2000 });
    });

    it('does NOT fetch immediately on keystroke', () => {
        render(<TeamSearch />);
        const input = screen.getByLabelText('Search for a team...');

        fireEvent.change(input, { target: { value: 'La' } });

        // Should not have called yet (debounce hasn't fired)
        expect(fetch).not.toHaveBeenCalled();
    });

    it('navigates to the team page when an option is selected', async () => {
        const user = userEvent.setup();
        const teamOptions = [
            { idTeam: '1', strTeam: 'LA Lakers', strSport: 'Basketball', strLeague: 'NBA' },
            { idTeam: '2', strTeam: 'LA Clippers', strSport: 'Basketball', strLeague: 'NBA' },
        ];
        fetch.mockResolvedValueOnce(searchResponse(teamOptions));

        render(<TeamSearch />);

        const input = screen.getByLabelText('Search for a team...');
        await user.type(input, 'Lakers');

        const option = await screen.findByText('LA Lakers (Basketball - NBA)');
        await user.click(option);

        expect(mockPush).toHaveBeenCalledWith('/team/1');
    });

    it('displays a search error under the input when fetching fails', async () => {
        const user = userEvent.setup();
        fetch.mockRejectedValueOnce(new Error('Network down'));

        render(<TeamSearch />);
        const input = screen.getByLabelText('Search for a team...');

        await user.type(input, 'Lakers');

        await waitFor(() => {
            expect(screen.getByText(/Error searching for teams/)).toBeInTheDocument();
        }, { timeout: 2000 });
    });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamDetails from './TeamDetails';

describe('TeamDetails Component', () => {
    const fullTeam = {
        strTeam: 'Manchester United',
        strTeamShort: 'MUN',
        strSport: 'Soccer',
        strLeague: 'English Premier League',
        strLocation: 'Manchester',
        strStadium: 'Old Trafford',
        intStadiumCapacity: 74310,
        strBadge: 'https://example.com/badge.png',
        strDescriptionEN: 'A'.repeat(600), // Long description to test truncation
    };

    it('renders team name with short name', () => {
        render(<TeamDetails team={fullTeam} />);
        expect(screen.getByText('Manchester United (MUN)')).toBeInTheDocument();
    });

    it('renders sport and league info', () => {
        render(<TeamDetails team={fullTeam} />);
        expect(screen.getByText('Sport: Soccer - English Premier League')).toBeInTheDocument();
    });

    it('renders location', () => {
        render(<TeamDetails team={fullTeam} />);
        expect(screen.getByText('City: Manchester')).toBeInTheDocument();
    });

    it('renders stadium and capacity', () => {
        render(<TeamDetails team={fullTeam} />);
        expect(screen.getByText('Arena: Old Trafford (Capacity: 74310)')).toBeInTheDocument();
    });

    it('renders team badge image', () => {
        render(<TeamDetails team={fullTeam} />);
        const img = screen.getByAltText('Manchester United Badge');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/badge.png');
    });

    it('truncates long descriptions and shows Read More button', () => {
        render(<TeamDetails team={fullTeam} />);
        expect(screen.getByText('Read More')).toBeInTheDocument();
        // Description should be truncated (500 chars + '...')
        expect(screen.queryByText(fullTeam.strDescriptionEN)).not.toBeInTheDocument();
    });

    it('expands and collapses description on button clicks', async () => {
        const user = userEvent.setup();
        render(<TeamDetails team={fullTeam} />);

        // Click "Read More" to expand
        await user.click(screen.getByText('Read More'));
        expect(screen.getByText('Read Less')).toBeInTheDocument();

        // Click "Read Less" to collapse
        await user.click(screen.getByText('Read Less'));
        expect(screen.getByText('Read More')).toBeInTheDocument();
    });

    it('does not show Read More button for short descriptions', () => {
        const shortTeam = { ...fullTeam, strDescriptionEN: 'A short description.' };
        render(<TeamDetails team={shortTeam} />);
        expect(screen.queryByText('Read More')).not.toBeInTheDocument();
    });

    it('shows fallback text when description is missing', () => {
        const noDescTeam = { ...fullTeam, strDescriptionEN: null };
        render(<TeamDetails team={noDescTeam} />);
        expect(screen.getByText(/No description available/)).toBeInTheDocument();
    });

    it('handles missing optional fields gracefully', () => {
        const minimalTeam = { strTeam: 'Mystery FC' };
        render(<TeamDetails team={minimalTeam} />);
        expect(screen.getByText('Mystery FC')).toBeInTheDocument();
        // Should not crash or render stadium/location sections
        expect(screen.queryByText(/Arena:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/City:/)).not.toBeInTheDocument();
    });

    it('renders team name without short name when not provided', () => {
        const noShortTeam = { ...fullTeam, strTeamShort: null };
        render(<TeamDetails team={noShortTeam} />);
        expect(screen.getByText('Manchester United')).toBeInTheDocument();
    });
});

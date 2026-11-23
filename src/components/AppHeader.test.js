import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import { TimeZoneProvider, useTimeZone } from './TimeZoneProvider';
import AppHeader from './AppHeader';

const TzProbe = () => {
    const { timeZone } = useTimeZone();
    return <span data-testid="tz">{timeZone ?? 'none'}</span>;
};

const renderHeader = () => render(
    <ThemeProvider theme={theme} modeStorageKey="scoreseeker_theme" defaultMode="light">
        <TimeZoneProvider>
            <AppHeader />
            <TzProbe />
        </TimeZoneProvider>
    </ThemeProvider>
);

describe('AppHeader Component', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    it('renders the ScoreSeeker title linked to home', () => {
        renderHeader();
        expect(screen.getByRole('link', { name: /ScoreSeeker/ })).toHaveAttribute('href', '/');
    });

    it('switches color scheme when the theme toggle is clicked', async () => {
        const user = userEvent.setup();
        renderHeader();

        await user.click(screen.getByLabelText('Settings'));
        await user.click(screen.getByText('🌙 Dark Mode'));

        await waitFor(() => {
            expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
        });
    });

    it('updates the time zone context and storage when a zone is selected', async () => {
        localStorage.setItem('scoreseeker_timeZone', 'America/New_York');
        const user = userEvent.setup();
        renderHeader();

        await waitFor(() => {
            expect(screen.getByTestId('tz').textContent).toBe('America/New_York');
        });

        await user.click(screen.getByLabelText('Settings'));
        await user.click(screen.getByRole('menuitem', { name: /UTC$/ }));

        await waitFor(() => {
            expect(screen.getByTestId('tz').textContent).toBe('UTC');
        });
        expect(localStorage.getItem('scoreseeker_timeZone')).toBe('UTC');
    });
});

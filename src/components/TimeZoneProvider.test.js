import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { TimeZoneProvider, useTimeZone } from './TimeZoneProvider';

const Probe = () => {
    const { timeZone, setTimeZone } = useTimeZone();
    return (
        <div>
            <span data-testid="tz">{timeZone ?? 'null'}</span>
            <button onClick={() => setTimeZone('Europe/London')}>change</button>
        </div>
    );
};

const renderProvider = () => render(
    <TimeZoneProvider>
        <Probe />
    </TimeZoneProvider>
);

describe('TimeZoneProvider', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders null during SSR and resolves to the stored value after hydration', async () => {
        localStorage.setItem('scoreseeker_timeZone', 'America/Chicago');
        const ui = (
            <TimeZoneProvider>
                <Probe />
            </TimeZoneProvider>
        );

        const container = document.createElement('div');
        document.body.appendChild(container);
        container.innerHTML = renderToString(ui);
        expect(container.querySelector('[data-testid="tz"]').textContent).toBe('null');

        await act(async () => {
            hydrateRoot(container, ui);
        });

        expect(container.querySelector('[data-testid="tz"]').textContent).toBe('America/Chicago');
        container.remove();
    });

    it('falls back to the system time zone when nothing is stored', async () => {
        const expected = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles';

        renderProvider();

        await waitFor(() => {
            expect(screen.getByTestId('tz').textContent).toBe(expected);
        });
    });

    it('persists changes to localStorage and updates the context', async () => {
        const user = userEvent.setup();
        renderProvider();

        await waitFor(() => {
            expect(screen.getByTestId('tz').textContent).not.toBe('null');
        });

        await user.click(screen.getByText('change'));

        expect(screen.getByTestId('tz').textContent).toBe('Europe/London');
        expect(localStorage.getItem('scoreseeker_timeZone')).toBe('Europe/London');
    });
});

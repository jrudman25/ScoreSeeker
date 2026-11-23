'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import { TimeZoneProvider } from '../components/TimeZoneProvider';

export default function Providers({ children }) {
    return (
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme} modeStorageKey="scoreseeker_theme" defaultMode="light">
                <CssBaseline />
                <TimeZoneProvider>{children}</TimeZoneProvider>
            </ThemeProvider>
        </AppRouterCacheProvider>
    );
}

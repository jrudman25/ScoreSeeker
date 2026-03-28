"use client";

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function Providers({ children }) {
    return (
        <NextThemesProvider
            attribute="data-theme"
            defaultTheme="light"
            storageKey="scoreseeker_theme"
            themes={['light', 'dark']}
        >
            {children}
        </NextThemesProvider>
    );
}

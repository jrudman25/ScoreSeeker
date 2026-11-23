'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    cssVariables: { colorSchemeSelector: 'data-theme' },
    colorSchemes: { light: true, dark: true },
});

export default theme;

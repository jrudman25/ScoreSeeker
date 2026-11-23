'use client';

import { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function ErrorPage({ error, retry }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Couldn&apos;t load this team
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                The schedule service may be unavailable. Please try again.
            </Typography>
            <Button variant="contained" onClick={() => retry()}>
                Try again
            </Button>
        </Box>
    );
}

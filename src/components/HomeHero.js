'use client';

import { Typography, Paper, Box } from '@mui/material';

const HomeHero = () => (
    <Paper
        sx={(theme) => ({
            p: { xs: 4, md: 8 },
            mt: 6,
            borderRadius: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            boxShadow: theme.shadows[4],
            ...theme.applyStyles('dark', {
                background: 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)',
                boxShadow: theme.shadows[1],
            }),
        })}
        elevation={0}
    >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Welcome to ScoreSeeker!
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Search for any professional sports team across the globe to instantly view their live, past, and upcoming match schedules.
        </Typography>

        <Box
            sx={(theme) => ({
                display: 'inline-block',
                textAlign: 'left',
                p: 3,
                backgroundColor: 'rgba(255,255,255,0.5)',
                borderRadius: 2,
                ...theme.applyStyles('dark', {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                }),
            })}
        >
            <Typography variant="body1" sx={{ mb: 1, fontSize: '1.1rem' }}>📅 <strong>Schedules:</strong> Comprehensive match histories</Typography>
            <Typography variant="body1" sx={{ mb: 1, fontSize: '1.1rem' }}>🎵 <strong>Audio:</strong> Hear unique, algorithmic theme songs based on game scores</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>🌎 <strong>Global:</strong> Search instantly across thousands of teams worldwide</Typography>
        </Box>
    </Paper>
);

export default HomeHero;

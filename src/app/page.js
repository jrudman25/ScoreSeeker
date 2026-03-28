"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Typography, CircularProgress, AppBar, Toolbar, Box, Paper, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme as useNextTheme } from 'next-themes';
import TeamSearch from '../components/TeamSearch';
import TeamDetails from '../components/TeamDetails';
import MatchList from '../components/MatchList';
import ErrorBoundary from '../components/ErrorBoundary';
import { convertTime, isScoreValid, isLive } from '../utils/helpers';
import { useTeamSearch } from '../hooks/useTeamSearch';
import { useMatchData } from '../hooks/useMatchData';
import { playMatchTheme } from '../utils/musicGenerator';

const timeZonesList = [
    { id: 'America/New_York', label: 'EST / EDT (New York)' },
    { id: 'America/Chicago', label: 'CST / CDT (Chicago)' },
    { id: 'America/Denver', label: 'MST / MDT (Denver)' },
    { id: 'America/Los_Angeles', label: 'PST / PDT (Los Angeles)' },
    { id: 'Europe/London', label: 'GMT / BST (London)' },
    { id: 'UTC', label: 'UTC' }
];

const getDefaultTimeZone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles';
    } catch (_e) {
        return 'America/Los_Angeles';
    }
};

const SportsMusicApp = () => {
    const { resolvedTheme, setTheme } = useNextTheme();
    const darkMode = resolvedTheme === 'dark';

    const [timeZone, setTimeZone] = useState(() => {
        if (typeof window === 'undefined') {
            return getDefaultTimeZone();
        }
        try {
            return localStorage.getItem('scoreseeker_timeZone') || getDefaultTimeZone();
        } catch (_e) {
            return getDefaultTimeZone();
        }
    });

    // Persist timezone when it changes (skip until next-themes has resolved)
    useEffect(() => {
        if (resolvedTheme === undefined) {
            return;
        }
        try {
            localStorage.setItem('scoreseeker_timeZone', timeZone);
        } catch (_e) {
            // localStorage unavailable
        }
    }, [timeZone, resolvedTheme]);

    const { teamSearchResult, teamId, teamOptions, error: searchError, loading, fetchingOptions, fetchTeams, searchTeam } = useTeamSearch();
    const {
        pastMatchInfo, currentMatchInfo, upcomingMatchInfo,
        pastPageCount, upcomingPageCount, pastPage, upcomingPage,
        onPastPageChange, onUpcomingPageChange,
        error: matchError, isFallback, isDataReady
    } = useMatchData(teamId, timeZone);

    const isLoading = loading || (teamId && !isDataReady);

    const [anchorEl, setAnchorEl] = useState(null);
    const [playingMatchId, setPlayingMatchId] = useState(null);
    
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const toggleDarkMode = () => {
        setTheme(darkMode ? 'light' : 'dark');
        handleMenuClose();
    };

    const theme = useMemo(() => createTheme({
        palette: { mode: darkMode ? 'dark' : 'light' },
    }), [darkMode]);

    const handleTimeZoneChange = (tz) => {
        setTimeZone(tz);
        handleMenuClose();
    };

    const convertTimeWrapper = (ts) => convertTime(ts, timeZone);

    const handlePlayAudio = (match) => {
        setPlayingMatchId(match.idEvent);
        playMatchTheme(match, () => {
            setPlayingMatchId((prev) => (prev === match.idEvent ? null : prev));
        });
    };

    const error = searchError || matchError;

    // Wait for next-themes to resolve before rendering MUI
    if (resolvedTheme === undefined) {
        return null;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            <AppBar position="static" color="primary" enableColorOnDark elevation={2}>
                <Toolbar>
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <AudiotrackIcon sx={{ mr: 1 }} /> ScoreSeeker
                    </Typography>

                    <IconButton color="inherit" onClick={handleMenuOpen}>
                        <SettingsIcon />
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem onClick={toggleDarkMode}>
                            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                        </MenuItem>
                        <Divider />
                        <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                            Time Zone
                        </MenuItem>
                        {timeZonesList.map(tz => (
                            <MenuItem 
                                key={tz.id} 
                                selected={timeZone === tz.id} 
                                onClick={() => handleTimeZoneChange(tz.id)}
                            >
                                {timeZone === tz.id ? '✓ ' : '\u00A0\u00A0\u00A0'} {tz.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Toolbar>
            </AppBar>

            <Container sx={{ pt: 4, pb: 8 }}>
            <ErrorBoundary>

                <TeamSearch
                    onSearch={searchTeam}
                    teamOptions={teamOptions}
                    loading={fetchingOptions}
                    fetchTeams={fetchTeams}
                />
                {error && (
                    <Typography color="error" variant="body1">
                        {error}
                    </Typography>
                )}

                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                        <CircularProgress size={60} />
                    </Box>
                )}

                {/* Hero / Empty State */}
                {!teamSearchResult && !isLoading && !error && (
                    <Paper
                        sx={{
                            p: { xs: 4, md: 8 },
                            mt: 6,
                            borderRadius: 3,
                            textAlign: 'center',
                            background: darkMode ? 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        }}
                        elevation={darkMode ? 1 : 4}
                    >
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Welcome to ScoreSeeker!
                        </Typography>
                        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
                            Search for any professional sports team across the globe to instantly view their live, past, and upcoming match schedules.
                        </Typography>

                        <Box sx={{ display: 'inline-block', textAlign: 'left', p: 3, backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', borderRadius: 2 }}>
                            <Typography variant="body1" sx={{ mb: 1, fontSize: '1.1rem' }}>📅 <strong>Schedules:</strong> Comprehensive match histories</Typography>
                            <Typography variant="body1" sx={{ mb: 1, fontSize: '1.1rem' }}>🎵 <strong>Audio:</strong> Hear unique, algorithmic theme songs based on game scores</Typography>
                            <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>🌎 <strong>Global:</strong> Search instantly from a database of over 14,000 teams</Typography>
                        </Box>
                    </Paper>
                )}

                {teamSearchResult && !isLoading && (
                    <Box sx={{ mt: 5 }}>
                        <TeamDetails
                            team={teamSearchResult}
                        />
                        {isFallback && (
                            <Paper sx={{ p: 2, mb: 3, backgroundColor: darkMode ? '#1a2332' : '#e3f2fd', borderRadius: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    📋 Showing recent results — full season schedule is unavailable (team may be between seasons).
                                </Typography>
                            </Paper>
                        )}
                        <MatchList
                            title="Past Matches"
                            matches={pastMatchInfo}
                            convertTime={convertTimeWrapper}
                            isScoreValid={isScoreValid}
                            isLive={isLive}
                            darkMode={darkMode}
                            playingMatchId={playingMatchId}
                            onPlayAudio={handlePlayAudio}
                            page={pastPage}
                            pageCount={pastPageCount}
                            onPageChange={onPastPageChange}
                            selectedTeamName={teamSearchResult?.strTeam}
                        />
                        <MatchList
                            title="Live Now"
                            matches={currentMatchInfo}
                            convertTime={convertTimeWrapper}
                            isScoreValid={isScoreValid}
                            isLive={isLive}
                            darkMode={darkMode}
                            disableAudio={true}
                            playingMatchId={playingMatchId}
                            onPlayAudio={handlePlayAudio}
                            selectedTeamName={teamSearchResult?.strTeam}
                        />
                        <MatchList
                            title="Upcoming Matches"
                            matches={upcomingMatchInfo}
                            convertTime={convertTimeWrapper}
                            isScoreValid={isScoreValid}
                            isLive={isLive}
                            darkMode={darkMode}
                            disableAudio={true}
                            playingMatchId={playingMatchId}
                            onPlayAudio={handlePlayAudio}
                            page={upcomingPage}
                            pageCount={upcomingPageCount}
                            onPageChange={onUpcomingPageChange}
                            selectedTeamName={teamSearchResult?.strTeam}
                        />
                    </Box>
                )}
            </ErrorBoundary>
            </Container>
        </ThemeProvider>
    );
};

export default SportsMusicApp;

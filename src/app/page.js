"use client";

import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Button, Typography, CircularProgress } from '@mui/material';
import TeamSearch from '../components/TeamSearch';
import TeamDetails from '../components/TeamDetails';
import MatchList from '../components/MatchList';
import { convertTime, isScoreValid, isLive } from '../utils/helpers';
import { useTeamSearch } from '../hooks/useTeamSearch';
import { useMatchData } from '../hooks/useMatchData';

const SportsMusicApp = () => {
    const [timeZone, setTimeZone] = useState('America/Los_Angeles');
    const [darkMode, setDarkMode] = useState(false);

    const { teamSearchResult, teamId, error: searchError, loading, searchTeam } = useTeamSearch();
    const { pastMatchInfo, currentMatchInfo, upcomingMatchInfo, error: matchError, isFetchingMatches } = useMatchData(teamId, timeZone);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const theme = createTheme({
        palette: { mode: darkMode ? 'dark' : 'light' },
    });

    const handleTimeZoneChange = () => {
        setTimeZone((prev) => prev === 'America/Los_Angeles' ? 'America/New_York' : 'America/Los_Angeles');
    };

    const convertTimeWrapper = (ts) => convertTime(ts, timeZone);

    const error = searchError || matchError;

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container>
                <Button
                    variant="contained"
                    onClick={toggleDarkMode}
                    sx={{ position: 'fixed', top: 20, right: 20 }}
                >
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
                <Typography variant="h2" component="h1" gutterBottom sx={{ mt: 4 }}>
                    ScoreSeeker
                </Typography>
                <TeamSearch onSearch={searchTeam} />
                {loading && <CircularProgress sx={{ display: 'block', mt: 4 }} />}
                {error && (
                    <Typography color="error" variant="body1">
                        {error}
                    </Typography>
                )}
                {teamSearchResult && !loading && (
                    <TeamDetails
                        team={teamSearchResult}
                        timeZone={timeZone}
                        onTimeZoneChange={handleTimeZoneChange}
                    />
                )}
                {isFetchingMatches && <CircularProgress sx={{ display: 'block', mt: 4 }} />}
                {!isFetchingMatches && !loading && teamSearchResult && (
                    <>
                        <MatchList
                            title="Past Matches"
                            matches={pastMatchInfo}
                            convertTime={convertTimeWrapper}
                            isScoreValid={isScoreValid}
                            isLive={isLive}
                            darkMode={darkMode}
                        />
                        <MatchList
                            title="Live Now"
                            matches={currentMatchInfo}
                            convertTime={convertTimeWrapper}
                            isScoreValid={isScoreValid}
                            isLive={isLive}
                            darkMode={darkMode}
                        />
                        <MatchList
                            title="Upcoming Matches"
                            matches={upcomingMatchInfo}
                            convertTime={convertTimeWrapper}
                            isScoreValid={isScoreValid}
                            isLive={isLive}
                            darkMode={darkMode}
                            disableAudio={true}
                        />
                    </>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default SportsMusicApp;

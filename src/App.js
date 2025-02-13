/**
 * App.js
 * App functionality and display
 * Note: Free API limitations include no future matches and only past games at home
 * @version 2025.02.10
 */
import React, { useState, useEffect } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import { ThemeProvider, createTheme, CssBaseline, Container, Button, Typography, CircularProgress } from '@mui/material';
import TeamSearch from './TeamSearch';
import TeamDetails from './TeamDetails';
import MatchList from './MatchList';

const SportsMusicApp = () => {
    const [teamSearchResult, setTeamSearchResult] = useState(null);
    const [teamId, setTeamId] = useState('');
    const [pastMatchInfo, setPastMatchInfo] = useState([]);
    const [upcomingMatchInfo, setUpcomingMatchInfo] = useState([]);
    const [timeZone, setTimeZone] = useState('America/Los_Angeles');
    const apiKey = process.env.REACT_APP_SPORTS_DB_API_KEY;
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Create MUI theme
    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    // Search for team by name
    const handleTeamSearch = async (teamName) => {
        console.clear();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${teamName}`);
            const data = await response.json();
            if (data.teams && data.teams.length > 0) {
                const team = data.teams[0];
                setTeamSearchResult(team);
                setTeamId(team.idTeam);
            } else {
                setError('No teams found');
            }
        } catch (error) {
            setError('Error searching for team: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Convert UTC time to local time
    const convertTime = (utcTimestamp) => {
        if (!utcTimestamp) return 'Time not available';
        const utcDate = new Date(`${utcTimestamp}Z`);
        const zonedTime = toZonedTime(utcDate, timeZone);
        return format(zonedTime, 'MMMM dd, yyyy, hh:mm a zzz', { timeZone });
    };

    // Change time zone
    const handleTimeZoneChange = () => {
        setTimeZone((prev) =>
            prev === 'America/Los_Angeles' ? 'America/New_York' : 'America/Los_Angeles'
        );
    };

    // Fetch matches when teamId changes
    useEffect(() => {
        const fetchMatches = async () => {
            if (teamId) {
                try {
                    const pastResponse = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventslast.php?id=${teamId}`);
                    const pastData = await pastResponse.json();
                    setPastMatchInfo(pastData.results || []);

                    const upcomingResponse = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnext.php?id=${teamId}`);
                    const upcomingData = await upcomingResponse.json();
                    setUpcomingMatchInfo(upcomingData.events || []);
                } catch (error) {
                    setError('Error fetching matches: ' + error.message);
                }
            }
        };

        fetchMatches();
    }, [teamId, apiKey]);

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
                <Typography variant="h2" component="h1" gutterBottom>
                    RhythmicReplay
                </Typography>
                <TeamSearch onSearch={handleTeamSearch} />
                {loading && <CircularProgress />}
                {error && (
                    <Typography color="error" variant="body1">
                        {error}
                    </Typography>
                )}
                {teamSearchResult && (
                    <TeamDetails
                        team={teamSearchResult}
                        timeZone={timeZone}
                        onTimeZoneChange={handleTimeZoneChange}
                    />
                )}
                <MatchList
                    title="Past Matches"
                    matches={pastMatchInfo}
                    convertTime={convertTime}
                />
                <MatchList
                    title="Upcoming Matches"
                    matches={upcomingMatchInfo}
                    convertTime={convertTime}
                />
            </Container>
        </ThemeProvider>
    );
};

export default SportsMusicApp;
/**
 * App.js
 * App functionality and display
 * Note: Free API limitations include no future matches and only past games at home
 * @version 2025.08.06
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
    const [currentMatchInfo, setCurrentMatchInfo] = useState([]);
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
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${teamName}`);
            const data = await response.json();
            if (data.teams && data.teams.length > 0) {
                const team = data.teams[0];
                setTeamSearchResult(team);
                setTeamId(team.idTeam);
            }
            else {
                setError('No teams found');
            }
        }
        catch (error) {
            setError('Error searching for team: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };

    // Convert UTC time to local time
    const convertTime = (utcTimestamp) => {
        if (!utcTimestamp) {
            return 'Time not available';
        }
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

    const isScoreValid = (score) => {
        const parsed = Number(score);
        return score !== null && score !== "" && score !== "null" && !isNaN(parsed);
    };

    const isLive = (match) => {
        const status = match.strStatus?.toUpperCase();
        const final = status === "FT" || status === "MATCH FINISHED" || status === "AOT" || status === "AET"
            || status === "PEN" || status === "AWD" || status === "WO" || status === "AP" || status === "AW"
            || status === "";
        const notStarted = status === "NS" || status === "NOT STARTED" || status === "TBD";
        const abandoned = status === "ABD"  || status === "CANC"  || status === "PST" || status === "POST";

        return !final && !notStarted && !abandoned;
    };

    // Fetch matches when teamId changes
    useEffect(() => {
        const fetchMatches = async () => {
            if (!teamId) {
                return;
            }

            try {
                const [pastRes, upcomingRes] = await Promise.all([
                    fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventslast.php?id=${teamId}`),
                    fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnext.php?id=${teamId}`)
                ]);

                const pastData = await pastRes.json();
                const upcomingData = await upcomingRes.json();

                const allMatches = [
                    ...(pastData.results || []),
                    ...(upcomingData.events || [])
                ].sort((a, b) => {
                    const dateA = a.dateEvent ?
                        new Date(`${a.dateEvent}T${a.strTime || '00:00:00'}`) :
                        new Date(0);
                    const dateB = b.dateEvent ?
                        new Date(`${b.dateEvent}T${b.strTime || '00:00:00'}`) :
                        new Date(0);
                    return dateA - dateB;
                });

                // Get current time in the specified timezone
                const now = new Date();
                const zonedNow = toZonedTime(now, timeZone);
                const today = new Date(zonedNow);
                today.setHours(0, 0, 0, 0);

                const pastMatches = [];
                const currentMatches = [];
                const upcomingMatches = [];

                const isFinished = (status) => {
                    const s = status.toUpperCase();
                    return s === "FT" || s === "MATCH FINISHED";
                };

                for (const match of allMatches) {
                    // Convert match date to the specified timezone
                    const matchDate = match.dateEvent ?
                        toZonedTime(new Date(`${match.dateEvent}T${match.strTime || '00:00:00'}`), timeZone) :
                        null;

                    const status = match.strStatus?.toUpperCase();

                    if (isLive(match)) {
                        currentMatches.push(match);
                    }
                    else if (isFinished(status)) {
                        pastMatches.push(match);
                    }
                    else if (matchDate && matchDate < today) {
                        pastMatches.push(match);
                    }
                    else {
                        upcomingMatches.push(match);
                    }
                }

                setPastMatchInfo(pastMatches);
                setCurrentMatchInfo(currentMatches);
                setUpcomingMatchInfo(upcomingMatches);

            }
            catch (error) {
                setError('Error fetching matches: ' + error.message);
            }
        };
        fetchMatches();
    }, [teamId, apiKey, timeZone]);

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
                    ScoreSeeker
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
                    isScoreValid={isScoreValid}
                    isLive={isLive}
                    darkMode={darkMode}
                />
                <MatchList
                    title="Live Now"
                    matches={currentMatchInfo}
                    convertTime={convertTime}
                    isScoreValid={isScoreValid}
                    isLive={isLive}
                    darkMode={darkMode}
                />
                <MatchList
                    title="Upcoming Matches"
                    matches={upcomingMatchInfo}
                    convertTime={convertTime}
                    isScoreValid={isScoreValid}
                    isLive={isLive}
                    darkMode={darkMode}
                />
            </Container>
        </ThemeProvider>
    );
};

export default SportsMusicApp;

/**
 * App.js
 * App functionality and display
 * Note: Free API limitations include no future matches and only past games at home
 * @version 2025.02.03
 */
import React, { useState, useEffect} from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import TeamSearch from './TeamSearch';
import TeamDetails from './TeamDetails';
import MatchList from './MatchList';
import './App.css';

const SportsMusicApp = () => {

    const [teamSearchResult, setTeamSearchResult] = useState(null); // The team searched for
    const [teamId, setTeamId] = useState(''); // Team ID number
    const [pastMatchInfo, setPastMatchInfo] = useState([]); // Past home games for selected team
    const [upcomingMatchInfo, setUpcomingMatchInfo] = useState([]); // Future games for selected team
    const [timeZone, setTimeZone] = useState('America/Los_Angeles');
    const apiKey = process.env.REACT_APP_SPORTS_DB_API_KEY;
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Search for team by name
    const handleTeamSearch = async (teamName) => {
        console.clear();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${teamName}`);
            const data = await response.json();
            if (data.teams) {
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

    // Convert UTC time to PST
    const convertTime = (utcTimestamp) => {
        if (!utcTimestamp) {
            return 'Error fetching time';
        }
        const utcDate = new Date(`${utcTimestamp}Z`);
        const zonedTime = toZonedTime(utcDate, timeZone);
        return format(zonedTime, 'MMMM dd, yyyy, hh:mm a zzz', { timeZone });
    };

    // Change time zone from PST to EST or vice versa
    const handleTimeZoneChange = () => {
        setTimeZone((prev) =>
            prev === 'America/Los_Angeles' ? 'America/New_York' : 'America/Los_Angeles'
        );
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Find matches when teamId changes
    useEffect(() => {
        // Fetch past matches when team id changes
        const handleFindPastMatches = async (id) => {
            if (!id) {
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventslast.php?id=${id}`);
                const data = await response.json();
                setPastMatchInfo(data.results || []);
            }
            catch (error) {
                setError('Error fetching past matches: ' + error.message);
            }
            finally {
                setLoading(false);
            }
        };

        // Fetch upcoming matches when teamId changes
        const handleFindUpcomingMatches = async (id) => {
            if (!id) {
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnext.php?id=${id}`);
                const data = await response.json();
                setUpcomingMatchInfo(data.events || []);
            }
            catch (error) {
                setError('Error fetching upcoming matches: ' + error.message);
            }
            finally {
                setLoading(false);
            }
        };

        if (teamId) {
            return Promise.all([
                handleFindPastMatches(teamId),
                handleFindUpcomingMatches(teamId),
            ]).catch((error) => {
                setError('Error fetching matches: ' + error.message);
            });
        }
    }, [teamId, apiKey]);

    return (
        <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
            <button onClick={toggleDarkMode} className="dark-mode-toggle">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <h1>RhythmicReplay</h1>
            <TeamSearch onSearch={handleTeamSearch}/>
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
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
        </div>
    );
};

export default SportsMusicApp;

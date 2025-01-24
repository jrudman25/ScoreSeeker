/**
 * App.js
 * App functionality and display
 * Note: Free API limitations include no future matches and only past home games
 * @version 2025.01.23
 */
import React, { useState, useEffect} from 'react';

const SportsMusicApp = () => {

    const [teamSearchResult, setTeamSearchResult] = useState(null);
    const [teamName, setTeamName] = useState(''); // Input for team name search
    const [teamId, setTeamId] = useState(''); // Team ID number
    const [pastMatchInfo, setPastMatchInfo] = useState([]); // Past home games for selected team
    const [matchInfo, setMatchInfo] = useState([]); // Future games for selected team
    const apiKey = `${process.env.SPORTS_DB_API_KEY}`;

    // Search for team by name
    const handleTeamSearch = () => {
        console.clear();
        fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${teamName}`)
            .then(response => response.json())
            .then(data => {
                console.log('API Response:', data);
                if (data.teams) {
                    console.log('Team search result:', data.teams);
                    const team = data.teams[0];
                    setTeamSearchResult(team); // Set team result
                    setTeamId(team.idTeam); // Set team ID
                } else {
                    console.log('No teams found');
                }
            })
            .catch(error => console.error('Error searching for team:', error));
    };

    // Fetch past matches when team id changes
    const handleFindPastMatches = (id) => {
        if (id) {
            console.log('Fetching past matches for team ID:', id);
            fetch(`https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Past Matches:', data);
                    setPastMatchInfo(data.results || []);
                })
                .catch(error => console.error('Error fetching past match data:', error));
        }
    };

    // Fetch upcoming matches when teamId changes
    const handleFindUpcomingMatches = (id) => {
        if (id) {
            console.log('Fetching matches for team ID:', id); // Debugging line to check if the correct ID is being passed
            fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Upcoming Matches:', data); // Log the match data
                    setMatchInfo(data.events || []); // Store the match data in state
                })
                .catch(error => console.error('Error fetching match data:', error));
        } else {
            console.log('No team ID to fetch matches for');
        }
    };

    // Find matches when teamId changes
    useEffect(() => {
        if (teamId) {
            handleFindPastMatches(teamId); // Fetch past matches
            handleFindUpcomingMatches(teamId); // Fetch upcoming matches
        }
    }, [teamId]);

    // Handles the enter key for the team search bar
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleTeamSearch();
        }
    };

    return (
        <div>
            <h2>Team Search</h2>
            <div>
                <label>Enter Team Name: </label>
                <input
                    type="text"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleTeamSearch}>Search</button>
            </div>

            <h2>Team Search Result</h2>
            {teamSearchResult ? (
                <div>
                    <p>Team Name: {teamSearchResult.strTeam} ({teamSearchResult.strTeamShort})</p>
                    <p>Sport: {teamSearchResult.strSport} ({teamSearchResult.strLeague})</p>
                    <p>City: {teamSearchResult.strLocation}</p>
                    <p>Arena: {teamSearchResult.strStadium} (Capacity: {teamSearchResult.intStadiumCapacity})</p>
                    <p>Description: {teamSearchResult.strDescriptionEN}</p>
                    <img
                        src={teamSearchResult.strFanart1}
                        alt={`${teamSearchResult.strTeam} Badge`}
                        style={{width: '100px', height: '100px'}}
                    />
                </div>
            ) : (
                <p>No team found</p>
            )}
            <h2>Past Home Matches</h2>
            {pastMatchInfo.length > 0 ? (
                <ul>
                    {pastMatchInfo.map((match, index) => (
                        <li key={index}>
                            <p>{match.strEvent}</p>
                            <p>{match.dateEventLocal} ({match.strTimeLocal})</p>
                            <p>Venue: {match.strVenue}</p>
                            <p>Score: {match.intHomeScore} - {match.intAwayScore}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No past matches available</p>
            )}
            {/* Display upcoming matches */}
            <h2>Upcoming Matches</h2>
            {matchInfo.length > 0 ? (
                <ul>
                    {matchInfo.map((match, index) => (
                        <li key={index}>
                            <p>{match.strEvent}</p>
                            <p>{match.strDate} - {match.strTime}</p>
                            <p>{match.strHomeTeam} vs {match.strAwayTeam}</p>
                            <p>League: {match.strLeague}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No upcoming matches</p>
            )}
        </div>
    );
};

export default SportsMusicApp;

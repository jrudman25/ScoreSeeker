/**
 * TeamDetails.js
 * Fetch team details
 * @version 2025.01.31
 */
import React from 'react';

const TeamDetails = ({ team, timeZone, onTimeZoneChange }) => {
    return (
        <div className="team-details">
            <h2>{team.strTeam} ({team.strTeamShort})</h2>
            <p>Sport: {team.strSport} ({team.strLeague})</p>
            <p>City: {team.strLocation}</p>
            <p>Arena: {team.strStadium} (Capacity: {team.intStadiumCapacity})</p>
            <p>Description: {team.strDescriptionEN}</p>
            <img
                src={team.strFanart1}
                alt={`${team.strTeam} Badge`}
                style={{ width: '100px', height: '100px' }}
            />
            <button onClick={onTimeZoneChange}>
                Switch to {timeZone === 'America/Los_Angeles' ? 'EST' : 'PST'}
            </button>
        </div>
    );
};

export default TeamDetails;

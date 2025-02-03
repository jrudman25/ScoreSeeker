/**
 * TeamDetails.js
 * Fetch team details
 * @version 2025.02.03
 */
import React, {useState} from 'react';

const TeamDetails = ({ team, timeZone, onTimeZoneChange }) => {

    const [showMore, setShowMore] = useState(false);
    const maxLength = 500;

    const toggleDesc = () => {
        setShowMore(!showMore);
    }

    const truncateDescription = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    return (
        <div className="team-details">
            <h2>{team.strTeam} ({team.strTeamShort})</h2>
            <p>Sport: {team.strSport} ({team.strLeague})</p>
            <p>City: {team.strLocation}</p>
            <p>Arena: {team.strStadium} (Capacity: {team.intStadiumCapacity})</p>
            <p>
                Description:{' '}
                {showMore ? team.strDescriptionEN : truncateDescription(team.strDescriptionEN, maxLength)}
                {team.strDescriptionEN.length > maxLength && (
                    <button onClick={toggleDesc} className="read-more-button">
                        {showMore ? 'Read Less' : 'Read More'}
                    </button>
                )}
            </p>
            <img
                src={team.strFanart1}
                alt={`${team.strTeam} Badge`}
                style={{width: '100px', height: '100px'}}
            />
            <button onClick={onTimeZoneChange}>
                Switch to {timeZone === 'America/Los_Angeles' ? 'EST' : 'PST'}
            </button>
        </div>
    );
};

export default TeamDetails;

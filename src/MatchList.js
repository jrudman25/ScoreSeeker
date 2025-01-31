/**
 * MatchList.js
 * Lists a team's matches
 * @version 2025.01.31
 */
import React from 'react';

const MatchList = ({ title, matches, convertTime }) => {
    return (
        <div className="match-list">
            <h2>{title}</h2>
            {matches.length > 0 ? (
                <ul>
                    {matches.map((match, index) => (
                        <li key={index}>
                            <p>{match.strEvent}</p>
                            <p>{convertTime(match.strTimestamp)}</p>
                            <p>Venue: {match.strVenue}</p>
                            {match.intHomeScore !== undefined && (
                                <p>Score: {match.intHomeScore} - {match.intAwayScore}</p>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No matches available</p>
            )}
        </div>
    );
};

export default MatchList;

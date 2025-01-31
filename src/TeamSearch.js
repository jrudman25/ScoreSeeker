/**
 * TeamSearch.js
 * Search for teams
 * @version 2025.01.31
 */
import React, { useState } from 'react';

const TeamSearch = ({ onSearch }) => {
    const [teamName, setTeamName] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch(teamName);
        }
    };

    return (
        <div className="team-search">
            <label>Enter Team Name: </label>
            <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., New York Yankees"
            />
            <button onClick={() => onSearch(teamName)}>Search</button>
        </div>
    );
};

export default TeamSearch;

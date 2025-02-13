/**
 * TeamSearch.js
 * Search for teams
 * @version 2025.02.10
 */
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const TeamSearch = ({ onSearch }) => {
    const [teamName, setTeamName] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch(teamName);
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
                label="Enter Team Name"
                variant="outlined"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
            />
            <Button variant="contained" onClick={() => onSearch(teamName)}>
                Search
            </Button>
        </Box>
    );
};

export default TeamSearch;
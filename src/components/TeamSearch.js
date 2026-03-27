/**
 * TeamSearch.js
 * Search for teams with autocomplete dropdown
 * @version 2026.03.23
 */
import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Box, CircularProgress } from '@mui/material';

const TeamSearch = ({ onSearch, teamOptions, loading, fetchTeams }) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (inputValue) {
                fetchTeams(inputValue);
            }
        }, 500); // Debounce to prevent spamming the API on every keystroke
        return () => clearTimeout(timeoutId);
    }, [inputValue, fetchTeams]);

    return (
        <Box sx={{ mb: 4 }}>
            <Autocomplete
                options={teamOptions}
                getOptionLabel={(option) => `${option.strTeam} (${option.strSport} - ${option.strLeague})`}
                loading={loading}
                filterOptions={(x) => x} // Disable built-in filtering, API handles it
                onChange={(event, newValue) => {
                    if (newValue) {
                        onSearch(newValue);
                    }
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search for a team..."
                        variant="outlined"
                        slotProps={{
                            input: {
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            },
                        }}
                    />
                )}
            />
        </Box>
    );
};

export default TeamSearch;

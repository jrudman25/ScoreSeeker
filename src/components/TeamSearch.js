'use client';

/**
 * TeamSearch.js
 * Search for teams with autocomplete dropdown; selection navigates to /team/[id]
 * @version 2026.03.23
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Autocomplete, TextField, Box, CircularProgress, Typography } from '@mui/material';
import { useTeamSearch } from '../hooks/useTeamSearch';

const TeamSearch = () => {
    const router = useRouter();
    const { teamOptions, fetchingOptions, error, fetchTeams } = useTeamSearch();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (!inputValue) {
            fetchTeams('');
            return undefined;
        }
        const timeoutId = setTimeout(() => {
            fetchTeams(inputValue);
        }, 500); // Debounce to prevent spamming the API on every keystroke
        return () => clearTimeout(timeoutId);
    }, [inputValue, fetchTeams]);

    return (
        <Box sx={{ mb: 4 }}>
            <Autocomplete
                options={teamOptions}
                getOptionLabel={(option) => `${option.strTeam} (${option.strSport} - ${option.strLeague})`}
                loading={fetchingOptions}
                filterOptions={(x) => x} // Disable built-in filtering, API handles it
                value={null}
                inputValue={inputValue}
                blurOnSelect
                onChange={(event, newValue) => {
                    if (newValue) {
                        setInputValue('');
                        router.push(`/team/${newValue.idTeam}`);
                    }
                }}
                onInputChange={(event, newInputValue, reason) => {
                    if (reason !== 'reset') {
                        setInputValue(newInputValue);
                    }
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
                                        {fetchingOptions ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            },
                        }}
                    />
                )}
            />
            {error && (
                <Typography color="error" variant="body1" sx={{ mt: 1 }}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default TeamSearch;

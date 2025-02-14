/**
 * TeamDetails.js
 * Fetch team details
 * @version 2025.02.10
 */
import React, { useState } from 'react';
import { Typography, Button, Paper, Box, Avatar } from '@mui/material';

const TeamDetails = ({ team, timeZone, onTimeZoneChange }) => {
    const [showMore, setShowMore] = useState(false);
    const maxLength = 500;

    const toggleDesc = () => {
        setShowMore(!showMore);
    };

    const truncateDescription = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    return (
        <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar src={team.strFanart1} alt={`${team.strTeam} Badge`} sx={{ width: 100, height: 100 }} />
                <Box>
                    <Typography variant="h4" component="h2">
                        {team.strTeam} ({team.strTeamShort})
                    </Typography>
                    <Typography variant="body1">Sport: {team.strSport} ({team.strLeague})</Typography>
                    <Typography variant="body1">City: {team.strLocation}</Typography>
                    <Typography variant="body1">Arena: {team.strStadium} (Capacity: {team.intStadiumCapacity})</Typography>
                </Box>
            </Box>
            <Typography variant="body1">
                Description:{' '}
                {showMore ? team.strDescriptionEN : truncateDescription(team.strDescriptionEN, maxLength)}
                {team.strDescriptionEN.length > maxLength && (
                    <Button onClick={toggleDesc} color="primary">
                        {showMore ? 'Read Less' : 'Read More'}
                    </Button>
                )}
            </Typography>
            <Button variant="contained" onClick={onTimeZoneChange} sx={{ mt: 2 }}>
                Switch to {timeZone === 'America/Los_Angeles' ? 'EST' : 'PST'}
            </Button>
        </Paper>
    );
};

export default TeamDetails;

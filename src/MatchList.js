/**
 * MatchList.js
 * Lists a team's matches
 * @version 2025.02.10
 */
import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const MatchList = ({ title, matches, convertTime }) => {
    return (
        <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                {title}
            </Typography>
            {matches.length > 0 ? (
                <List>
                    {matches.map((match, index) => (
                        <ListItem key={index} divider>
                            <ListItemText
                                primary={match.strEvent}
                                secondary={
                                    <>
                                        <Typography variant="body2">{convertTime(match.strTimestamp)}</Typography>
                                        <Typography variant="body2">Venue: {match.strVenue}</Typography>
                                        {match.intHomeScore !== undefined && (
                                            <Typography variant="body2">
                                                Score: {match.intHomeScore} - {match.intAwayScore}
                                            </Typography>
                                        )}
                                     </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body1">No matches available</Typography>
            )}
        </Paper>
    );
};

export default MatchList;
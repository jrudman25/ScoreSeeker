/**
 * MatchList.js
 * Lists a team's matches
 * @version 2025.02.13
 */
import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import * as Tone from 'tone';

const MatchList = ({ title, matches, convertTime, darkMode }) => {

    const playSound = (match) => {
        const synth = new Tone.Synth().toDestination();
        const now = Tone.now();

        if (match.intHomeScore > match.intAwayScore) {
            synth.triggerAttackRelease("C4", "8n", now);
            synth.triggerAttackRelease("E4", "8n", now + 0.5);
        } else if (match.intHomeScore < match.intAwayScore) {
            synth.triggerAttackRelease("G4", "8n", now);
            synth.triggerAttackRelease("B4", "8n", now + 0.5);
        } else {
            synth.triggerAttackRelease("A4", "8n", now);
            synth.triggerAttackRelease("C5", "8n", now + 0.5);
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                {title}
            </Typography>
            {matches.length > 0 ? (
                <List>
                    {matches.map((match, index) => (
                        <ListItem key={index}
                                  divider
                                  onClick={() => playSound(match)}
                                  sx={{
                                      cursor: 'pointer',
                                      transition: 'background-color 0.3s',
                                      '&:hover': {
                                          backgroundColor: darkMode ? '#333' : '#f0f0f0',
                                      },
                                      '&:active': {
                                          backgroundColor: darkMode ? '#555' : '#ddd',
                                      },
                                  }}>
                            <ListItemText
                                    primary={
                                        <>
                                            {match.strEvent} 🔊
                                        </>
                                    }
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

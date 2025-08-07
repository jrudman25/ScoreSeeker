/**
 * MatchList.js
 * Lists a team's matches
 * @version 2025.08.06
 */
import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import * as Tone from 'tone';

const MatchList = ({ title, matches, convertTime, isScoreValid, isLive, darkMode }) => {

    const playSound = (match) => {
        try {
            const synth = new Tone.Synth().toDestination();
            const now = Tone.now();
            if (match.intHomeScore > match.intAwayScore) {
                synth.triggerAttackRelease("C4", "8n", now);
                synth.triggerAttackRelease("E4", "8n", now + 0.5);
            }
            else if (match.intHomeScore < match.intAwayScore) {
                synth.triggerAttackRelease("G4", "8n", now);
                synth.triggerAttackRelease("B4", "8n", now + 0.5);
            }
            else {
                synth.triggerAttackRelease("A4", "8n", now);
                synth.triggerAttackRelease("C5", "8n", now + 0.5);
            }
        }
        catch(error){
            console.warn("Audio playback error:", error);
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
                                        {isLive(match) && (
                                            <Typography variant="body2" sx={{ color: 'red' }}>
                                                Live: {match.strStatus}
                                            </Typography>
                                        )}
                                        {isScoreValid(match.intHomeScore) && isScoreValid(match.intAwayScore) && (
                                            <Typography variant="body2">
                                                {
                                                    match.intHomeScore > match.intAwayScore
                                                    ? `${match.strHomeTeam} (${match.intHomeScore}) - ${match.strAwayTeam} (${match.intAwayScore})`
                                                    : `${match.strAwayTeam} (${match.intAwayScore}) - ${match.strHomeTeam} (${match.intHomeScore})`
                                                }
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

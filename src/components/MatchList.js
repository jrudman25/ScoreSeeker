/**
 * MatchList.js
 * Lists a team's matches
 * @version 2026.03.23
 */
import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { playMatchTheme } from '../utils/musicGenerator';

const MatchList = ({ title, matches, convertTime, isScoreValid, isLive, darkMode, disableAudio }) => {
    return (
        <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                {title}
            </Typography>
            {matches.length > 0 ? (
                <List>
                    {matches.map((match) => (
                        <ListItem key={match.idEvent}
                                  divider
                                  onClick={disableAudio ? undefined : () => playMatchTheme(match)}
                                  sx={{
                                      cursor: disableAudio ? 'default' : 'pointer',
                                      transition: 'background-color 0.3s',
                                      '&:hover': {
                                          backgroundColor: darkMode ? '#333' : '#f0f0f0',
                                      },
                                      ...(disableAudio ? {} : {
                                          '&:active': {
                                              backgroundColor: darkMode ? '#555' : '#ddd',
                                          }
                                      })
                                  }}>
                            <ListItemText
                                    primary={
                                        <>
                                            {match.strEvent} {!disableAudio && '🔊'}
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

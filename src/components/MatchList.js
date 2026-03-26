/**
 * MatchList.js
 * Lists a team's matches
 * @version 2026.03.23
 */
import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Box } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

const MatchList = ({ title, matches, convertTime, isScoreValid, isLive, darkMode, disableAudio, playingMatchId, onPlayAudio }) => {
    return (
        <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                {title}
            </Typography>
            {matches.length > 0 ? (
                <List>
                    {matches.map((match) => {
                        const isPlaying = playingMatchId === match.idEvent;
                        return (
                        <ListItem key={match.idEvent}
                                  divider
                                  onClick={disableAudio ? undefined : () => onPlayAudio(match)}
                                  sx={{
                                      cursor: disableAudio ? 'default' : 'pointer',
                                      transition: 'all 0.2s ease-in-out',
                                      backgroundColor: isPlaying ? (darkMode ? '#1e3a2f' : '#e8f5e9') : 'transparent',
                                      '&:hover': disableAudio ? {} : {
                                          backgroundColor: isPlaying ? (darkMode ? '#1e3a2f' : '#e8f5e9') : (darkMode ? '#333' : '#f4f8fc'),
                                          transform: 'translateX(6px)'
                                      },
                                      ...(disableAudio ? {} : {
                                          '&:active': {
                                              backgroundColor: darkMode ? '#555' : '#e0e0e0',
                                              transform: 'translateX(2px)'
                                          }
                                      })
                                  }}>
                            <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                                            {match.strEvent}
                                            {!disableAudio && (
                                                isPlaying 
                                                ? <GraphicEqIcon color="success" sx={{ ml: 1, fontSize: '1.3rem' }} />
                                                : <PlayCircleOutlineIcon color="primary" sx={{ ml: 1, fontSize: '1.2rem' }} />
                                            )}
                                        </Box>
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
                                        {isScoreValid(match.intHomeScore) && isScoreValid(match.intAwayScore) ? (
                                            <Typography variant="body2">
                                                {
                                                    match.intHomeScore > match.intAwayScore
                                                    ? `${match.strHomeTeam} (${match.intHomeScore}) - ${match.strAwayTeam} (${match.intAwayScore})`
                                                    : `${match.strAwayTeam} (${match.intAwayScore}) - ${match.strHomeTeam} (${match.intHomeScore})`
                                                }
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                                {isLive(match) || title === "Upcoming Matches" ? "" : "Score not natively recorded by TheSportsDB"}
                                            </Typography>
                                        )}
                                     </>
                                }
                                slotProps={{ secondary: { component: 'div' } }}
                            />
                        </ListItem>
                        );
                    })}
                </List>
            ) : (
                <Typography variant="body1">No matches available</Typography>
            )}
        </Paper>
    );
};

export default MatchList;

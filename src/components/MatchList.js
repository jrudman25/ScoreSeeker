/**
 * MatchList.js
 * Lists a team's matches with W/L indicators and pagination
 * @version 2026.03.27
 */
import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Box, Pagination, Chip } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { normalizeScore } from '../utils/helpers';

/**
 * Determine W/L/D result for the selected team
 * Returns 'W', 'L', 'D', or null if undetermined
 */
const getResult = (match, selectedTeamName) => {
    if (!selectedTeamName) {
        return null;
    }

    const homeScore = Number(match.intHomeScore);
    const awayScore = Number(match.intAwayScore);
    if (isNaN(homeScore) || isNaN(awayScore)) {
        return null;
    }

    const isHome = match.strHomeTeam === selectedTeamName;
    const isAway = match.strAwayTeam === selectedTeamName;
    if (!isHome && !isAway) {
        return null;
    }

    if (homeScore === awayScore) {
        return 'D';
    }
    const homeWins = homeScore > awayScore;
    return (isHome && homeWins) || (isAway && !homeWins) ? 'W' : 'L';
};

/**
 * Format intRound into a human-readable label
 * Returns null for normal rounds (displayed elsewhere), or a label for special rounds
 */
const getRoundLabel = (intRound) => {
    const round = Number(intRound);
    if (isNaN(round) || round <= 0) {
        return null;
    }
    if (round >= 500) {
        return 'Preseason';
    }
    if (round >= 100 && round < 500) {
        return 'Postseason';
    }
    return `Regular Season`;
};

const resultColors = {
    W: { bg: '#e8f5e9', color: '#2e7d32', darkBg: '#1b3a1b', darkColor: '#66bb6a' },
    L: { bg: '#ffebee', color: '#c62828', darkBg: '#3a1b1b', darkColor: '#ef5350' },
    D: { bg: '#fff8e1', color: '#f57f17', darkBg: '#3a351b', darkColor: '#ffca28' },
};

const MatchList = ({ title, matches, convertTime, isScoreValid, isLive, darkMode, disableAudio, playingMatchId, onPlayAudio, page, pageCount, onPageChange, selectedTeamName }) => {
    return (
        <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                {title}
            </Typography>
            {matches.length > 0 ? (
                <List>
                    {matches.map((match) => {
                        const isPlaying = playingMatchId === match.idEvent;
                        const homeScore = normalizeScore(match.intHomeScore, match);
                        const awayScore = normalizeScore(match.intAwayScore, match);
                        const hasScore = isScoreValid(homeScore) && isScoreValid(awayScore);
                        const normalizedMatch = { ...match, intHomeScore: homeScore, intAwayScore: awayScore };
                        const result = hasScore ? getResult(normalizedMatch, selectedTeamName) : null;
                        const roundLabel = getRoundLabel(match.intRound);
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                                <Typography variant="body2" component="span">{convertTime(match.strTimestamp)}</Typography>
                                                {match.strVenue && (
                                                    <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}>
                                                        · {match.strVenue}
                                                    </Typography>
                                                )}
                                                {roundLabel && (
                                                    <Chip label={roundLabel} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                )}
                                            </Box>
                                            {isLive(match) && (
                                                <Typography variant="body2" sx={{ color: 'red', fontWeight: 'bold', mt: 0.5 }}>
                                                    Live: {match.strStatus}
                                                </Typography>
                                            )}
                                            {hasScore ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 0.5 }}>
                                                    {result && (
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                fontSize: '0.95rem',
                                                                color: darkMode
                                                                    ? resultColors[result].darkColor
                                                                    : resultColors[result].color,
                                                                minWidth: 18,
                                                            }}
                                                        >
                                                            {result}
                                                        </Typography>
                                                    )}
                                                    <Typography
                                                        variant="body1"
                                                        component="span"
                                                        sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}
                                                    >
                                                        {match.strHomeTeam} {homeScore} – {match.strAwayTeam} {awayScore}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 0.5 }}>
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
            {pageCount > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={onPageChange}
                        color="primary"
                    />
                </Box>
            )}
        </Paper>
    );
};

export default MatchList;

'use client';

import React, { useState } from 'react';
import { Paper, Typography } from '@mui/material';
import MatchList from './MatchList';
import { convertTime, isScoreValid, isLive } from '../utils/helpers';
import { useMatchCategories } from '../hooks/useMatchCategories';
import { useTimeZone } from './TimeZoneProvider';
import { playMatchTheme } from '../utils/musicGenerator';

const TeamSchedule = ({ schedule, isFallback, teamName }) => {
    const { timeZone } = useTimeZone();
    const [playingMatchId, setPlayingMatchId] = useState(null);

    const {
        pastMatchInfo, currentMatchInfo, upcomingMatchInfo,
        pastPageCount, upcomingPageCount, pastPage, upcomingPage,
        onPastPageChange, onUpcomingPageChange,
    } = useMatchCategories(schedule, timeZone ?? 'UTC');

    const handlePlayAudio = (match) => {
        setPlayingMatchId(match.idEvent);
        playMatchTheme(match, () => {
            setPlayingMatchId((prev) => (prev === match.idEvent ? null : prev));
        });
    };

    // Render an empty element until the time zone resolves to avoid hydration mismatch
    const convertTimeWrapper = (ts) => (timeZone ? convertTime(ts, timeZone) : '');

    return (
        <>
            {isFallback && (
                <Paper
                    sx={(theme) => ({
                        p: 2,
                        mb: 3,
                        backgroundColor: '#e3f2fd',
                        borderRadius: 2,
                        ...theme.applyStyles('dark', {
                            backgroundColor: '#1a2332',
                        }),
                    })}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        📋 Showing recent results — full season schedule is unavailable (team may be between seasons).
                    </Typography>
                </Paper>
            )}
            <MatchList
                title="Past Matches"
                matches={pastMatchInfo}
                convertTime={convertTimeWrapper}
                isScoreValid={isScoreValid}
                isLive={isLive}
                playingMatchId={playingMatchId}
                onPlayAudio={handlePlayAudio}
                page={pastPage}
                pageCount={pastPageCount}
                onPageChange={onPastPageChange}
                selectedTeamName={teamName}
            />
            <MatchList
                title="Live Now"
                matches={currentMatchInfo}
                convertTime={convertTimeWrapper}
                isScoreValid={isScoreValid}
                isLive={isLive}
                disableAudio={true}
                playingMatchId={playingMatchId}
                onPlayAudio={handlePlayAudio}
                selectedTeamName={teamName}
            />
            <MatchList
                title="Upcoming Matches"
                matches={upcomingMatchInfo}
                convertTime={convertTimeWrapper}
                isScoreValid={isScoreValid}
                isLive={isLive}
                disableAudio={true}
                playingMatchId={playingMatchId}
                onPlayAudio={handlePlayAudio}
                page={upcomingPage}
                pageCount={upcomingPageCount}
                onPageChange={onUpcomingPageChange}
                selectedTeamName={teamName}
            />
        </>
    );
};

export default TeamSchedule;

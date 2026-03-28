import { useState, useEffect, useMemo, useCallback } from 'react';
import { toZonedTime } from 'date-fns-tz';
import { isLive, isFinished } from '../utils/helpers';

const MATCHES_PER_PAGE = 10;

export const useMatchData = (teamId, timeZone) => {
    const [allMatches, setAllMatches] = useState([]);
    const [error, setError] = useState(null);
    const [isFetchingMatches, setIsFetchingMatches] = useState(false);
    const [loadedTeamId, setLoadedTeamId] = useState('');
    const [isFallback, setIsFallback] = useState(false);

    // Pagination state
    const [pastPage, setPastPage] = useState(1);
    const [upcomingPage, setUpcomingPage] = useState(1);

    // Reset pagination when team changes
    useEffect(() => {
        setPastPage(1);
        setUpcomingPage(1);
    }, [teamId]);

    // Fetch full schedule when teamId changes
    useEffect(() => {
        let isMounted = true;
        const fetchSchedule = async () => {
            if (!teamId) {
                setAllMatches([]);
                setLoadedTeamId('');
                return;
            }
            setIsFetchingMatches(true);
            try {
                const res = await fetch(`/api/matches?id=${encodeURIComponent(teamId)}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to fetch schedule');
                }

                if (!isMounted) {
                    return;
                }

                const schedule = (data.schedule || []).sort((a, b) => {
                    const dateA = a.dateEvent ? new Date(`${a.dateEvent}T${a.strTime || '00:00:00'}`) : new Date(0);
                    const dateB = b.dateEvent ? new Date(`${b.dateEvent}T${b.strTime || '00:00:00'}`) : new Date(0);
                    return dateA - dateB;
                });

                setAllMatches(schedule);
                setIsFallback(!!data.isFallback);
                setLoadedTeamId(teamId);
            } catch (err) {
                if (isMounted) {
                    setError('Error fetching schedule: ' + err.message);
                    setLoadedTeamId(teamId);
                }
            } finally {
                if (isMounted) {
                    setIsFetchingMatches(false);
                }
            }
        };

        fetchSchedule();
        return () => { isMounted = false; };
    }, [teamId]);

    // Categorize matches by status/date in the selected timezone
    const { pastMatchInfo, currentMatchInfo, upcomingMatchInfo } = useMemo(() => {
        const past = [];
        const current = [];
        const upcoming = [];

        const now = new Date();
        const zonedNow = toZonedTime(now, timeZone);
        const today = new Date(zonedNow);
        today.setHours(0, 0, 0, 0);


        for (const match of allMatches) {
            const matchDate = match.dateEvent ?
                toZonedTime(new Date(`${match.dateEvent}T${match.strTime || '00:00:00'}`), timeZone) : null;

            if (isLive(match)) {
                current.push(match);
            } else if (isFinished(match)) {
                past.push(match);
            } else if (matchDate && matchDate < today) {
                past.push(match);
            } else {
                upcoming.push(match);
            }
        }

        return { pastMatchInfo: past.reverse(), currentMatchInfo: current, upcomingMatchInfo: upcoming };
    }, [allMatches, timeZone]);

    // Paginate past and upcoming
    const pastPageCount = Math.ceil(pastMatchInfo.length / MATCHES_PER_PAGE) || 1;
    const upcomingPageCount = Math.ceil(upcomingMatchInfo.length / MATCHES_PER_PAGE) || 1;

    const paginatedPast = useMemo(() => {
        const start = (pastPage - 1) * MATCHES_PER_PAGE;
        return pastMatchInfo.slice(start, start + MATCHES_PER_PAGE);
    }, [pastMatchInfo, pastPage]);

    const paginatedUpcoming = useMemo(() => {
        const start = (upcomingPage - 1) * MATCHES_PER_PAGE;
        return upcomingMatchInfo.slice(start, start + MATCHES_PER_PAGE);
    }, [upcomingMatchInfo, upcomingPage]);

    const handlePastPageChange = useCallback((_event, page) => {
        setPastPage(page);
    }, []);

    const handleUpcomingPageChange = useCallback((_event, page) => {
        setUpcomingPage(page);
    }, []);

    const isDataReady = loadedTeamId === teamId && !isFetchingMatches;

    return {
        pastMatchInfo: paginatedPast,
        currentMatchInfo,
        upcomingMatchInfo: paginatedUpcoming,
        pastPageCount,
        upcomingPageCount,
        pastPage,
        upcomingPage,
        onPastPageChange: handlePastPageChange,
        onUpcomingPageChange: handleUpcomingPageChange,
        error,
        isFetchingMatches,
        isFallback,
        isDataReady,
    };
};

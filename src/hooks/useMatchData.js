import { useState, useEffect, useMemo } from 'react';
import { toZonedTime } from 'date-fns-tz';
import { isLive } from '../utils/helpers';

export const useMatchData = (teamId, timeZone) => {
    const [allMatches, setAllMatches] = useState([]);
    const [error, setError] = useState(null);

    // Fetch matches only when teamId changes. This fixes the previous bug 
    // where toggling timezone triggered a full API re-fetch.
    useEffect(() => {
        let isMounted = true;
        const fetchMatches = async () => {
            if (!teamId) {
                setAllMatches([]);
                return;
            }
            try {
                const res = await fetch(`/api/matches?id=${encodeURIComponent(teamId)}`);
                const data = await res.json();
                
                if (!res.ok) {
                    throw new Error(data.error || 'Failed to fetch matches');
                }

                if (!isMounted) return;

                const { pastData, upcomingData } = data;

                const combined = [
                    ...(pastData?.results || []),
                    ...(upcomingData?.events || [])
                ].sort((a, b) => {
                    const dateA = a.dateEvent ? new Date(`${a.dateEvent}T${a.strTime || '00:00:00'}`) : new Date(0);
                    const dateB = b.dateEvent ? new Date(`${b.dateEvent}T${b.strTime || '00:00:00'}`) : new Date(0);
                    return dateA - dateB;
                });

                setAllMatches(combined);
            } catch (err) {
                if (isMounted) setError('Error fetching matches: ' + err.message);
            }
        };

        fetchMatches();
        return () => { isMounted = false; };
    }, [teamId]);

    // Categorize matches without re-fetching, purely based on selected timeZone
    const { pastMatchInfo, currentMatchInfo, upcomingMatchInfo } = useMemo(() => {
        const past = [];
        const current = [];
        const upcoming = [];

        const now = new Date();
        const zonedNow = toZonedTime(now, timeZone);
        const today = new Date(zonedNow);
        today.setHours(0, 0, 0, 0);

        const isFinished = (status) => {
            const s = (status || "").toUpperCase();
            return s === "FT" || s === "MATCH FINISHED";
        };

        for (const match of allMatches) {
            const matchDate = match.dateEvent ?
                toZonedTime(new Date(`${match.dateEvent}T${match.strTime || '00:00:00'}`), timeZone) : null;

            const status = match.strStatus?.toUpperCase() || "";

            if (isLive(match)) {
                current.push(match);
            } else if (isFinished(status)) {
                past.push(match);
            } else if (matchDate && matchDate < today) {
                past.push(match);
            } else {
                upcoming.push(match);
            }
        }

        return { pastMatchInfo: past, currentMatchInfo: current, upcomingMatchInfo: upcoming };
    }, [allMatches, timeZone]);

    return { pastMatchInfo, currentMatchInfo, upcomingMatchInfo, error };
};

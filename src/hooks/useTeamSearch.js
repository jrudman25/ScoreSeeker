import { useState, useCallback, useRef } from 'react';

export const useTeamSearch = () => {
    const [teamSearchResult, setTeamSearchResult] = useState(null);
    const [teamId, setTeamId] = useState('');
    const [teamOptions, setTeamOptions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Controls the final full team profile lookup
    const [fetchingOptions, setFetchingOptions] = useState(false); // Controls the dropdown spinner
    const searchRequestId = useRef(0); // Guards against stale autocomplete responses landing out of order

    const fetchTeams = useCallback(async (teamName) => {
        const requestId = ++searchRequestId.current;
        if (!teamName || teamName.length < 2) {
            setTeamOptions([]);
            setFetchingOptions(false);
            return;
        }
        setFetchingOptions(true);
        setError(null);
        try {
            const response = await fetch(`/api/team?t=${encodeURIComponent(teamName)}`);
            const data = await response.json();

            if (requestId !== searchRequestId.current) {
                return;
            }
            if (response.ok && data.search) {
                setTeamOptions(data.search);
            } else {
                setTeamOptions([]);
            }
        } catch (err) {
            if (requestId === searchRequestId.current) {
                setError('Error searching for teams: ' + err.message);
            }
        } finally {
            if (requestId === searchRequestId.current) {
                setFetchingOptions(false);
            }
        }
    }, []);

    const searchTeam = async (teamObj) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/team?id=${teamObj.idTeam}`);
            if (!res.ok) {
                setError("Failed to fetch team details");
                return;
            }
            const data = await res.json();
            if (data.lookup && data.lookup.length > 0) {
                setTeamSearchResult(data.lookup[0]);
                setTeamId(data.lookup[0].idTeam);
            } else {
                setError("Team details not found");
            }
        } catch (_e) {
            setError("Failed to fetch team details");
        } finally {
            setTeamOptions([]);
            setLoading(false);
        }
    };

    return { teamSearchResult, teamId, teamOptions, error, loading, fetchingOptions, fetchTeams, searchTeam };
};

import { useState, useCallback, useRef } from 'react';

export const useTeamSearch = () => {
    const [teamOptions, setTeamOptions] = useState([]);
    const [error, setError] = useState(null);
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

    return { teamOptions, fetchingOptions, error, fetchTeams };
};

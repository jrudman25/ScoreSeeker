import { useState, useCallback } from 'react';

export const useTeamSearch = () => {
    const [teamSearchResult, setTeamSearchResult] = useState(null);
    const [teamId, setTeamId] = useState('');
    const [teamOptions, setTeamOptions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Controls the final full team profile lookup
    const [fetchingOptions, setFetchingOptions] = useState(false); // Controls the dropdown spinner

    const fetchTeams = useCallback(async (teamName) => {
        if (!teamName || teamName.length < 2) {
            setTeamOptions([]);
            return;
        }

        setFetchingOptions(true);
        setError(null);
        try {
            const response = await fetch(`/api/team?t=${encodeURIComponent(teamName)}`);
            const data = await response.json();
            
            if (response.ok && data.teams) {
                setTeamOptions(data.teams);
            } else {
                setTeamOptions([]); // No teams found
            }
        } catch (err) {
            setError('Error searching for teams: ' + err.message);
        } finally {
            setFetchingOptions(false);
        }
    }, []);

    const searchTeam = async (teamObj) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/team?id=${teamObj.idTeam}`);
            const data = await res.json();
            if (data.teams && data.teams.length > 0) {
                setTeamSearchResult(data.teams[0]);
                setTeamId(data.teams[0].idTeam);
            } else {
                setError("Team details not found");
            }
        } catch(e) {
            setError("Failed to fetch team details");
        } finally {
            setTeamOptions([]);
            setLoading(false);
        }
    };

    return { teamSearchResult, teamId, teamOptions, error, loading, fetchingOptions, fetchTeams, searchTeam };
};

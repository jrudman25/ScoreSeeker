import { useState } from 'react';

export const useTeamSearch = () => {
    const [teamSearchResult, setTeamSearchResult] = useState(null);
    const [teamId, setTeamId] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const searchTeam = async (teamName) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/team?t=${encodeURIComponent(teamName)}`);
            const data = await response.json();
            
            if (response.ok && data.teams && data.teams.length > 0) {
                const team = data.teams[0];
                setTeamSearchResult(team);
                setTeamId(team.idTeam);
            } else {
                setError(data.error || 'No teams found');
            }
        } catch (err) {
            setError('Error searching for team: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return { teamSearchResult, teamId, error, loading, searchTeam };
};

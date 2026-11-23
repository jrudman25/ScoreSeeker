import { notFound } from 'next/navigation';
import TeamDetails from '../../../components/TeamDetails';
import TeamSchedule from '../../../components/TeamSchedule';
import { getTeam, getSchedule } from '../../../lib/sportsDb';
import { isValidTeamId } from '../../../utils/isValidTeamId';
import { findNextMatch, formatMatchLabel } from '../../../utils/findNextMatch';

export const revalidate = 60;

// Nothing prerendered at build time; every team page is generated on-demand (ISR)
export async function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    if (!isValidTeamId(id)) {
        notFound();
    }

    const [team, scheduleData] = await Promise.all([getTeam(id), getSchedule(id)]);
    if (!team) {
        notFound();
    }

    const nextMatch = findNextMatch(scheduleData.schedule);
    const nextLabel = nextMatch ? formatMatchLabel(nextMatch) : null;
    const title = `${team.strTeam} | ScoreSeeker`;
    const description = `${team.strTeam} schedule, live scores, and results`
        + (team.strLeague ? ` in the ${team.strLeague}` : '') + '.'
        + (nextLabel ? ` Next match: ${nextLabel}.` : '')
        + ' Play music generated from each match score.';
    const images = team.strBadge ? [team.strBadge] : undefined;
    return {
        title,
        description,
        alternates: {
            canonical: `/team/${id}`,
        },
        openGraph: {
            title,
            description,
            url: `/team/${id}`,
            images,
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images,
        },
    };
}

export default async function TeamPage({ params }) {
    const { id } = await params;
    if (!isValidTeamId(id)) {
        notFound();
    }

    const [team, scheduleData] = await Promise.all([getTeam(id), getSchedule(id)]);
    if (!team) {
        notFound();
    }

    return (
        <>
            <TeamDetails team={team} />
            <TeamSchedule
                schedule={scheduleData.schedule}
                isFallback={scheduleData.isFallback}
                teamName={team.strTeam}
            />
        </>
    );
}

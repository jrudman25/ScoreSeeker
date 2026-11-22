import { format, toZonedTime } from 'date-fns-tz';

export const convertTime = (utcTimestamp, timeZone) => {
    if (!utcTimestamp) {
        return 'Time not available';
    }
    const utcDate = new Date(`${utcTimestamp}Z`);
    const zonedTime = toZonedTime(utcDate, timeZone);
    return format(zonedTime, 'MMMM dd, yyyy, hh:mm a zzz', { timeZone });
};

export const isScoreValid = (score) => {
    const parsed = Number(score);
    return score !== null && score !== "" && score !== "null" && !isNaN(parsed);
};

export const isLive = (match) => {
    const status = match.strStatus?.toUpperCase();
    if (!status) {
        return false;
    }
    const final = status === "FT" || status === "MATCH FINISHED" || status === "AOT" || status === "AET"
        || status === "PEN" || status === "AWD" || status === "WO" || status === "AP" || status === "AW";
    const notStarted = status === "NS" || status === "NOT STARTED" || status === "TBD";
    const abandoned = status === "ABD"  || status === "CANC"  || status === "PST" || status === "POST";

    return !final && !notStarted && !abandoned;
};

export const isFinished = (match) => {
    const status = (match.strStatus || "").toUpperCase();
    return status === "FT" || status === "MATCH FINISHED" || status === "AOT" || status === "AET"
        || status === "PEN" || status === "AWD" || status === "WO" || status === "AP" || status === "AW";
};

/**
 * Parse a match into a Date in UTC. Prefers strTimestamp; falls back to
 * dateEvent + strTime. Appends 'Z' unless the source already carries a
 * 'Z' suffix or a ±HH:MM offset. Returns null when no date info exists.
 */
export const parseMatchDate = (match) => {
    let dateStr;
    if (match.strTimestamp) {
        dateStr = match.strTimestamp;
    } else if (match.dateEvent) {
        dateStr = `${match.dateEvent}T${match.strTime || '00:00:00'}`;
    } else {
        return null;
    }
    const hasZone = dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr);
    return new Date(hasZone ? dateStr : `${dateStr}Z`);
};

/**
 * TheSportsDB returns null instead of 0 for zero scores.
 * For finished or live matches, coerce null/undefined to "0".
 */
export const normalizeScore = (score, match) => {
    if (score !== null && score !== undefined) {
        return score;
    }
    if (isFinished(match) || isLive(match)) {
        return "0";
    }
    return score;
};

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
    const final = status === "FT" || status === "MATCH FINISHED" || status === "AOT" || status === "AET"
        || status === "PEN" || status === "AWD" || status === "WO" || status === "AP" || status === "AW"
        || status === "";
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

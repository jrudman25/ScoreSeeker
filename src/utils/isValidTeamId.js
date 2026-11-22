/**
 * TheSportsDB team IDs are numeric strings. Anything else (path traversal
 * fragments, slugs, oversized values) must be rejected before it is
 * interpolated into an upstream URL.
 */
export const isValidTeamId = (id) => typeof id === 'string' && /^\d{1,10}$/.test(id);

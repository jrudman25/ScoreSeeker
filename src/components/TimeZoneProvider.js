'use client';

import React, { createContext, useContext, useRef, useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'scoreseeker_timeZone';

const TimeZoneContext = createContext({ timeZone: null, setTimeZone: () => {} });

const getDefaultTimeZone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles';
    } catch (_e) {
        return 'America/Los_Angeles';
    }
};

// Server snapshot is null: SSR and the first client render see no time zone,
// then the stored/system value resolves after hydration.
const getServerSnapshot = () => null;

export const TimeZoneProvider = ({ children }) => {
    const listeners = useRef(new Set());

    const subscribe = useCallback((onStoreChange) => {
        listeners.current.add(onStoreChange);
        return () => listeners.current.delete(onStoreChange);
    }, []);

    const getSnapshot = useCallback(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) || getDefaultTimeZone();
        } catch (_e) {
            return getDefaultTimeZone();
        }
    }, []);

    const timeZone = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setTimeZone = useCallback((tz) => {
        try {
            localStorage.setItem(STORAGE_KEY, tz);
        } catch (_e) {
            // localStorage unavailable
        }
        listeners.current.forEach((cb) => cb());
    }, []);

    return (
        <TimeZoneContext.Provider value={{ timeZone, setTimeZone }}>
            {children}
        </TimeZoneContext.Provider>
    );
};

export const useTimeZone = () => useContext(TimeZoneContext);

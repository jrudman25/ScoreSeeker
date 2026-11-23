'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SettingsIcon from '@mui/icons-material/Settings';
import { useColorScheme } from '@mui/material/styles';
import { useTimeZone } from './TimeZoneProvider';

const timeZonesList = [
    { id: 'America/New_York', label: 'EST / EDT (New York)' },
    { id: 'America/Chicago', label: 'CST / CDT (Chicago)' },
    { id: 'America/Denver', label: 'MST / MDT (Denver)' },
    { id: 'America/Los_Angeles', label: 'PST / PDT (Los Angeles)' },
    { id: 'Europe/London', label: 'GMT / BST (London)' },
    { id: 'UTC', label: 'UTC' }
];

const AppHeader = () => {
    const { mode, setMode } = useColorScheme();
    const { timeZone, setTimeZone } = useTimeZone();

    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const toggleDarkMode = () => {
        setMode(mode === 'dark' ? 'light' : 'dark');
        handleMenuClose();
    };

    const handleTimeZoneChange = (tz) => {
        setTimeZone(tz);
        handleMenuClose();
    };

    return (
        <AppBar position="static" color="primary" enableColorOnDark elevation={2}>
            <Toolbar>
                <Typography
                    variant="h5"
                    component={Link}
                    href="/"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'inherit',
                        textDecoration: 'none',
                    }}
                >
                    <AudiotrackIcon sx={{ mr: 1 }} /> ScoreSeeker
                </Typography>

                <IconButton color="inherit" onClick={handleMenuOpen} aria-label="Settings">
                    <SettingsIcon />
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem onClick={toggleDarkMode}>
                        {mode === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </MenuItem>
                    <Divider />
                    <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                        Time Zone
                    </MenuItem>
                    {timeZonesList.map(tz => (
                        <MenuItem
                            key={tz.id}
                            selected={timeZone === tz.id}
                            onClick={() => handleTimeZoneChange(tz.id)}
                        >
                            {timeZone === tz.id ? '✓ ' : '\u00A0\u00A0\u00A0'} {tz.label}
                        </MenuItem>
                    ))}
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default AppHeader;

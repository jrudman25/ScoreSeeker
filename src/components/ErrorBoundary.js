/**
 * ErrorBoundary.js
 * Catches unhandled React rendering errors and displays a user-friendly fallback UI
 * @version 2026.03.26
 */
import React from 'react';
import { Typography, Paper, Button, Box } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Paper
                    sx={{
                        p: { xs: 4, md: 6 },
                        mt: 6,
                        borderRadius: 3,
                        textAlign: 'center',
                    }}
                    elevation={2}
                >
                    <Box sx={{ mb: 2, fontSize: '3rem' }}>⚠️</Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Something went wrong
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        An unexpected error occurred. Please try again.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleReset}
                    >
                        Try Again
                    </Button>
                </Paper>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

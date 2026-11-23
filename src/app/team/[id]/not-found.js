import { Box, Button, Typography } from '@mui/material';

export default function NotFound() {
    return (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Team not found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We could not find a team with that ID. It may have been removed or the link is incorrect.
            </Typography>
            <Button variant="contained" href="/">
                Back to search
            </Button>
        </Box>
    );
}

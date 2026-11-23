import { Typography, Link } from '@mui/material';
import packageJson from '../../package.json';

const Footer = () => (
    <Typography
        component="footer"
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ py: 3 }}
    >
        {`ScoreSeeker v${packageJson.version}`}
        <br />
        {'Data and artwork from '}
        <Link
            href="https://www.thesportsdb.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
        >
            TheSportsDB
        </Link>
    </Typography>
);

export default Footer;

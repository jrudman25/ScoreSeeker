import './globals.css';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import Container from '@mui/material/Container';
import Providers from './providers';
import AppHeader from '../components/AppHeader';
import TeamSearch from '../components/TeamSearch';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';
import { SITE_URL } from '../lib/siteUrl';

const description = 'Search for any sports team to see its schedule, live scores, and results, then play a short piece of music generated from each match score.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'ScoreSeeker | Team Schedules, Live Scores, and Match Music',
  description,
  verification: {
    google: 'EYUYDnQ_TItGIvsEw9g7CEr-eSEmurfJ5rR1iZL6Sxc',
  },
  openGraph: {
    title: 'ScoreSeeker | Team Schedules, Live Scores, and Match Music',
    description,
    url: '/',
    siteName: 'ScoreSeeker',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScoreSeeker | Team Schedules, Live Scores, and Match Music',
    description,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon-152x152.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          attribute="data-theme"
          modeStorageKey="scoreseeker_theme"
          defaultMode="light"
        />
        <Providers>
          <AppHeader />
          <ErrorBoundary>
            <Container sx={{ pt: 4, pb: 8 }}>
              <TeamSearch />
              {children}
            </Container>
          </ErrorBoundary>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

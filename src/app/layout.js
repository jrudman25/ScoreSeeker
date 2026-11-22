import './globals.css';
import Providers from './providers';

const description = 'Sports scores and music snippets';

export const metadata = {
  metadataBase: new URL('https://scoreseeker.netlify.app'),
  title: 'ScoreSeeker',
  description,
  openGraph: {
    title: 'ScoreSeeker',
    description,
    url: '/',
    siteName: 'ScoreSeeker',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScoreSeeker',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import './globals.css';

export const metadata = {
  title: 'ScoreSeeker',
  description: 'Sports scores and music snippets',
  icons: {
    icon: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon-152x152.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

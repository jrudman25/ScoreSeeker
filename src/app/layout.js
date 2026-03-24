import './globals.css';

export const metadata = {
  title: 'ScoreSeeker',
  description: 'Sports scores and music snippets',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

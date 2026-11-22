import { ImageResponse } from 'next/og';

export const alt = 'ScoreSeeker';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          ScoreSeeker
        </div>
        <div
          style={{
            fontSize: 44,
            color: 'rgba(255, 255, 255, 0.85)',
            marginTop: 24,
          }}
        >
          Sports schedules with dynamic audio snippets
        </div>
      </div>
    ),
    { ...size }
  );
}

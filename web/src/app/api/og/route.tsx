import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'ForMe';
  const description =
    searchParams.get('description') ||
    'Book services, manage your business, and grow your professional presence.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#0c0a09',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #78716c 0%, #d6d3d1 50%, #78716c 100%)',
          }}
        />

        {/* Logo text */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#a8a29e',
            letterSpacing: '0.1em',
            marginBottom: '32px',
            textTransform: 'uppercase',
          }}
        >
          ForMe
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#fafaf9',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: '#78716c',
            lineHeight: 1.5,
            maxWidth: '700px',
          }}
        >
          {description}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

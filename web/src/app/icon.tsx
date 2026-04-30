import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';

// iOS-style rounded-square favicon: white FM mark on a stone-900 background.
// Renders identically on light tabs (Chrome) and dark tabs (Safari).
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default async function Icon() {
  const logo = readFileSync(path.join(process.cwd(), 'public/logos/fm-logo-white.png'));
  const dataUri = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1c1917',
          borderRadius: 14,
          padding: '14px 8px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} alt="ForMe" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    ),
    size,
  );
}

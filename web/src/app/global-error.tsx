'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#fafaf9', color: '#1c1917' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 9999, backgroundColor: '#f5f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Something went wrong</h2>
          <p style={{ fontSize: 13, color: '#78716c', maxWidth: 360, margin: '0 0 24px' }}>
            An unexpected error occurred. Try again, or head back home.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={reset}
              style={{ height: 40, padding: '0 16px', borderRadius: 12, backgroundColor: '#1c1917', color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              style={{ height: 40, padding: '0 16px', borderRadius: 12, backgroundColor: '#fff', color: '#44403c', border: '1px solid #e7e5e4', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

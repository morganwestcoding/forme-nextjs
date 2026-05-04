'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function LicensingError({
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 dark:text-stone-500">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1">Couldn&apos;t load licensing</h2>
      <p className="text-sm text-stone-500 dark:text-stone-500 max-w-sm mb-6">
        Something went wrong loading this page. Try again or head back home.
      </p>
      <div className="flex gap-2.5">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go home
        </Button>
      </div>
    </div>
  );
}

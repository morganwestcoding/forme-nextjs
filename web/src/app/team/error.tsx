'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    // If this is a sign-out related crash, just redirect home
    router.push('/');
  }, [error, router]);

  return null;
}

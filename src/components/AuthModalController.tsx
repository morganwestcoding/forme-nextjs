// components/AuthModalController.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import useLoginModal from '@/app/hooks/useLoginModal';

/**
 * Opens LoginModal once when unauthenticated.
 * Will NOT open if session is loading or authenticated.
 * Never re-opens after first attempt.
 */
export default function AuthModalController() {
  const { status } = useSession(); // 'loading' | 'authenticated' | 'unauthenticated'
  const loginModal = useLoginModal();
  const openedOnce = useRef(false);

  useEffect(() => {
    // Guard: only open when truly unauthenticated
    if (status !== 'unauthenticated') return;

    if (openedOnce.current) return;
    openedOnce.current = true;

    const t = setTimeout(() => {
      if (!loginModal.isOpen) {
        loginModal.onOpen();
      }
    }, 120);

    return () => clearTimeout(t);
  }, [status, loginModal.isOpen, loginModal.onOpen]);

  return null;
}

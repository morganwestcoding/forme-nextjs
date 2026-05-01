'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from './Modal';
import Logo from '@/components/ui/Logo';
import useWelcomeModal from '@/app/hooks/useWelcomeModal';
import useWalkthrough from '@/app/hooks/useWalkthrough';
import walkthroughSteps from '@/components/walkthrough/walkthroughSteps';
import { SafeUser } from '@/app/types';

const STORAGE_KEY = 'forme-walkthrough-dismissed';

interface WelcomeModalProps {
  currentUser?: SafeUser | null;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ currentUser }) => {
  const welcomeModal = useWelcomeModal();
  const walkthrough = useWalkthrough();
  const [neverShow, setNeverShow] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Auto-open on first visit. Logged-in users use their saved preference;
  // anonymous visitors fall back to localStorage.
  useEffect(() => {
    const dismissed = currentUser
      ? Boolean(currentUser.hideWelcomeModal)
      : Boolean(localStorage.getItem(STORAGE_KEY));
    setHasCheckedStorage(true);
    if (!dismissed) {
      const t = setTimeout(() => welcomeModal.onOpen(), 800);
      return () => clearTimeout(t);
    }
  }, [currentUser?.id, currentUser?.hideWelcomeModal]);

  const persistDismissal = useCallback(() => {
    if (!neverShow) return;
    if (currentUser) {
      axios
        .put(`/api/users/${currentUser.id}`, { hideWelcomeModal: true })
        .catch(() => {});
    } else {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [neverShow, currentUser]);

  const handleDismiss = useCallback(() => {
    persistDismissal();
    welcomeModal.onClose();
  }, [persistDismissal, welcomeModal]);

  const handleStartTour = useCallback(() => {
    persistDismissal();
    welcomeModal.onClose();
    setTimeout(() => {
      walkthrough.start(walkthroughSteps);
    }, 250);
  }, [persistDismissal, welcomeModal, walkthrough]);

  if (!hasCheckedStorage) return null;

  const body = (
    <div className="flex flex-col items-center text-center py-4">
      <div className="mb-4 flex justify-center">
        <Logo priority />
      </div>

      <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
        Welcome to ForMe
      </h2>
      <p className="text-[14px] text-stone-500  dark:text-stone-500   leading-relaxed max-w-sm mb-2">
        Discover local businesses, book services, shop products, and connect with professionals — all in one place.
      </p>

      <label className="flex items-center gap-2 mt-4 cursor-pointer select-none group">
        <input
          type="checkbox"
          checked={neverShow}
          onChange={(e) => setNeverShow(e.target.checked)}
          className="sr-only peer"
        />
        <span
          className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors duration-150 ${
            neverShow
              ? 'bg-stone-900 border-stone-900 dark:bg-stone-100 dark:border-stone-100'
              : 'bg-white border-stone-300 dark:bg-stone-800 dark:border-stone-600 group-hover:border-stone-400 dark:group-hover:border-stone-500'
          }`}
        >
          {neverShow && (
            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white dark:text-stone-900" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2.5 6.5 5 9 9.5 3.5" />
            </svg>
          )}
        </span>
        <span className="text-[12px] text-stone-500 dark:text-stone-400">
          Don&apos;t show this again
        </span>
      </label>
    </div>
  );

  return (
    <Modal
      id="welcome-modal"
      isOpen={welcomeModal.isOpen}
      onClose={handleDismiss}
      onSubmit={handleStartTour}
      title="Welcome to ForMe"
      body={body}
      actionLabel="Take a Tour"
      secondaryAction={handleDismiss}
      secondaryActionLabel="Skip for now"
      className="w-full md:w-[480px] lg:w-[480px] xl:w-[480px]"
    />
  );
};

export default WelcomeModal;

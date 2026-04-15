'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import useWelcomeModal from '@/app/hooks/useWelcomeModal';
import useWalkthrough from '@/app/hooks/useWalkthrough';
import walkthroughSteps from '@/components/walkthrough/walkthroughSteps';

const STORAGE_KEY = 'forme-walkthrough-dismissed';

const WelcomeModal: React.FC = () => {
  const welcomeModal = useWelcomeModal();
  const walkthrough = useWalkthrough();
  const [neverShow, setNeverShow] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Auto-open on first visit (if not dismissed)
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setHasCheckedStorage(true);
    if (!dismissed) {
      // Small delay so the page finishes rendering first
      const t = setTimeout(() => welcomeModal.onOpen(), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    if (neverShow) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    welcomeModal.onClose();
  }, [neverShow, welcomeModal]);

  const handleStartTour = useCallback(() => {
    if (neverShow) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    welcomeModal.onClose();
    // Start walkthrough after modal close animation
    setTimeout(() => {
      walkthrough.start(walkthroughSteps);
    }, 250);
  }, [neverShow, welcomeModal, walkthrough]);

  if (!hasCheckedStorage) return null;

  const body = (
    <div className="flex flex-col items-center text-center py-4">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 dark:text-white mb-2">
        Welcome to ForMe
      </h2>
      <p className="text-[14px] text-stone-500  dark:text-stone-500   leading-relaxed max-w-sm mb-2">
        Discover local businesses, book services, shop products, and connect with professionals — all in one place.
      </p>

      {/* Never show again */}
      <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={neverShow}
          onChange={(e) => setNeverShow(e.target.checked)}
          className="w-4 h-4 rounded border-stone-300  dark:border-stone-600 text-stone-900 dark:text-stone-100 dark:text-white focus:ring-stone-500 dark:focus:ring-stone-400 bg-transparent"
        />
        <span className="text-[12px] text-stone-400   dark:text-stone-400 ">
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

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from './Modal';
import Logo from '@/components/ui/Logo';
import useWelcomeModal from '@/app/hooks/useWelcomeModal';
import useWalkthrough from '@/app/hooks/useWalkthrough';
import walkthroughSteps from '@/components/walkthrough/walkthroughSteps';
import { categories } from '@/components/Categories';
import { SafeUser } from '@/app/types';

const STORAGE_KEY = 'forme-walkthrough-dismissed';

type Screen = 'interests' | 'welcome';

interface WelcomeModalProps {
  currentUser?: SafeUser | null;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ currentUser }) => {
  const welcomeModal = useWelcomeModal();
  const walkthrough = useWalkthrough();
  const [screen, setScreen] = useState<Screen>('interests');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
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

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const persistInterests = useCallback(() => {
    if (!currentUser || selectedInterests.length === 0) return;
    axios
      .put(`/api/users/${currentUser.id}`, { interests: selectedInterests })
      .catch(() => {});
  }, [currentUser, selectedInterests]);

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

  const interestsBody = (
    <div className="py-2">
      <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1 text-center">
        What are you interested in?
      </h2>
      <p className="text-[13px] text-stone-500 dark:text-stone-500 mb-5 text-center">
        Select all that apply. This helps us personalize your experience.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((category) => {
          const isSelected = selectedInterests.includes(category.label);
          return (
            <button
              key={category.label}
              type="button"
              onClick={() => toggleInterest(category.label)}
              style={{ WebkitTapHighlightColor: 'transparent', willChange: 'box-shadow, background-color, border-color' }}
              className={`
                p-3 rounded-xl border text-left
                transition-[background-color,border-color,box-shadow] duration-200 ease-out
                focus:outline-none
                ${isSelected
                  ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-inset-pressed'
                  : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-none hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }
              `}
            >
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-stone-400 dark:text-stone-500 text-center mt-5">
        Optional — you can skip this step
      </p>
    </div>
  );

  const welcomeBody = (
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

  if (screen === 'interests') {
    return (
      <Modal
        id="welcome-modal"
        isOpen={welcomeModal.isOpen}
        onClose={() => welcomeModal.onClose()}
        onSubmit={() => {
          persistInterests();
          setScreen('welcome');
        }}
        title="Welcome to ForMe"
        body={interestsBody}
        actionLabel={selectedInterests.length > 0 ? 'Continue' : 'Skip'}
        secondaryAction={() => setScreen('welcome')}
        secondaryActionLabel={selectedInterests.length > 0 ? 'Skip' : undefined}
        className="w-full md:w-[520px] lg:w-[520px] xl:w-[520px]"
      />
    );
  }

  return (
    <Modal
      id="welcome-modal"
      isOpen={welcomeModal.isOpen}
      onClose={handleDismiss}
      onSubmit={handleStartTour}
      title="Welcome to ForMe"
      body={welcomeBody}
      actionLabel="Take a Tour"
      secondaryAction={handleDismiss}
      secondaryActionLabel="Skip for now"
      className="w-full md:w-[480px] lg:w-[480px] xl:w-[480px]"
    />
  );
};

export default WelcomeModal;

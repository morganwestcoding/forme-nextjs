'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  GridViewIcon,
  Route01Icon,
} from 'hugeicons-react';
import Modal from './Modal';
import Logo from '@/components/ui/Logo';
import ImageUpload from '@/components/inputs/ImageUpload';
import useWelcomeModal from '@/app/hooks/useWelcomeModal';
import useWalkthrough from '@/app/hooks/useWalkthrough';
import walkthroughSteps from '@/components/walkthrough/walkthroughSteps';
import { categories } from '@/components/Categories';
import { SafeUser } from '@/app/types';

const STORAGE_KEY = 'forme-walkthrough-dismissed';

type Screen = 'welcome' | 'interests' | 'profile' | 'started';

const PostIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="7.5" r="1.5" />
    <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" />
    <path d="M5 21C9.37246 15.775 14.2741 8.88406 21.4975 13.5424" />
  </svg>
);

const ShopIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 8.75L15.0447 19.5532C15.015 19.684 15 19.8177 15 19.9518C15 20.9449 15.8051 21.75 16.7982 21.75H18" />
    <path d="M19.2192 21.75H4.78078C3.79728 21.75 3 20.9527 3 19.9692C3 19.8236 3.01786 19.6786 3.05317 19.5373L5.24254 10.7799C5.60631 9.32474 5.78821 8.59718 6.33073 8.17359C6.87325 7.75 7.6232 7.75 9.12311 7.75H14.8769C16.3768 7.75 17.1267 7.75 17.6693 8.17359C18.2118 8.59718 18.3937 9.32474 18.7575 10.7799L20.9468 19.5373C20.9821 19.6786 21 19.8236 21 19.9692C21 20.9527 20.2027 21.75 19.2192 21.75Z" />
    <path d="M15 7.75V5.75C15 4.09315 13.6569 2.75 12 2.75C10.3431 2.75 9 4.09315 9 5.75V7.75" />
  </svg>
);

interface WelcomeModalProps {
  currentUser?: SafeUser | null;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ currentUser }) => {
  const router = useRouter();
  const welcomeModal = useWelcomeModal();
  const walkthrough = useWalkthrough();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState<string>(currentUser?.bio || '');
  const [profileImage, setProfileImage] = useState<string>(currentUser?.image || '');
  const [neverShow, setNeverShow] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Open on every visit until the user opts out via "Don't show again".
  // Logged-in users use their saved preference; anonymous visitors fall back
  // to localStorage.
  useEffect(() => {
    const dismissed = currentUser
      ? Boolean(currentUser.hideWelcomeModal)
      : Boolean(localStorage.getItem(STORAGE_KEY));
    setHasCheckedStorage(true);
    if (dismissed) return;
    const t = setTimeout(() => welcomeModal.onOpen(), 800);
    return () => clearTimeout(t);
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

  const persistProfile = useCallback(() => {
    if (!currentUser) return;
    const payload: Record<string, string> = {};
    if (bio !== (currentUser.bio || '')) payload.bio = bio;
    if (profileImage && profileImage !== (currentUser.image || '')) payload.image = profileImage;
    if (Object.keys(payload).length === 0) return;
    axios.put(`/api/users/${currentUser.id}`, payload).catch(() => {});
  }, [currentUser, bio, profileImage]);

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

  const closeAndDismiss = useCallback(() => {
    persistDismissal();
    welcomeModal.onClose();
  }, [persistDismissal, welcomeModal]);

  const handleAction = useCallback(
    (path: string) => {
      persistDismissal();
      welcomeModal.onClose();
      router.push(path);
    },
    [persistDismissal, welcomeModal, router]
  );

  const handleStartTour = useCallback(() => {
    persistDismissal();
    welcomeModal.onClose();
    setTimeout(() => {
      walkthrough.start(walkthroughSteps);
    }, 250);
  }, [persistDismissal, welcomeModal, walkthrough]);

  if (!hasCheckedStorage) return null;

  const welcomeBody = (
    <div className="flex flex-col items-center text-center py-4">
      <div className="mb-4 flex justify-center">
        <Logo priority />
      </div>
      <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
        Welcome to ForMe
      </h2>
      <p className="text-[14px] text-stone-500 dark:text-stone-500 leading-relaxed max-w-sm">
        Discover local businesses, book services, shop products, and connect with professionals — all in one place.
      </p>
      <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-4">
        Let&apos;s get you set up — it only takes a minute.
      </p>
    </div>
  );

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

  const profileBody = (
    <div className="py-2">
      <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1 text-center">
        Set up your profile
      </h2>
      <p className="text-[13px] text-stone-500 dark:text-stone-500 mb-5 text-center">
        Add a photo and short bio so others can recognize you.
      </p>

      <div className="flex justify-center mb-5">
        <div className="w-24">
          <ImageUpload
            value={profileImage}
            onChange={setProfileImage}
            onRemove={() => setProfileImage('')}
            label=""
            ratio="square"
            rounded="full"
            enableCrop
            folder="avatars"
          />
        </div>
      </div>

      <label className="block text-[13px] font-medium text-stone-700 dark:text-stone-300 mb-1.5">
        Bio
      </label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell people a bit about yourself..."
        rows={3}
        maxLength={280}
        className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 resize-none"
      />
      <p className="text-[11px] text-stone-400 dark:text-stone-500 text-right mt-1">
        {bio.length}/280
      </p>

      <p className="text-xs text-stone-400 dark:text-stone-500 text-center mt-3">
        Optional — you can skip this step
      </p>
    </div>
  );

  const actionCards = [
    {
      icon: PostIcon,
      label: 'Share a Post',
      description: 'Show your work or share an update',
      onClick: () => handleAction('/post/new'),
    },
    {
      icon: GridViewIcon,
      label: 'Create a Listing',
      description: 'Set up your business profile',
      onClick: () => handleAction('/listing/new'),
    },
    {
      icon: ShopIcon,
      label: 'Open a Shop',
      description: 'Sell products to your community',
      onClick: () => handleAction('/shop/new'),
    },
    {
      icon: Route01Icon,
      label: 'Take a Tour',
      description: 'Quick walkthrough of the app',
      onClick: handleStartTour,
    },
  ];

  const startedBody = (
    <div className="py-2">
      <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1 text-center">
        Ready to get started?
      </h2>
      <p className="text-[13px] text-stone-500 dark:text-stone-500 mb-5 text-center">
        Pick something to dive into — you can always come back to this later.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actionCards.map(({ icon: Icon, label, description, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-left hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors duration-200"
          >
            <div className="shrink-0 w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {label}
              </p>
              <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-snug mt-0.5">
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <label className="flex items-center justify-center gap-2 mt-5 cursor-pointer select-none group">
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

  const widthClass = 'w-full md:w-[520px] lg:w-[520px] xl:w-[520px]';

  if (screen === 'welcome') {
    return (
      <Modal
        id="welcome-modal"
        isOpen={welcomeModal.isOpen}
        onClose={() => welcomeModal.onClose()}
        onSubmit={() => setScreen('interests')}
        title="Welcome to ForMe"
        body={welcomeBody}
        actionLabel="Get Started"
        className={widthClass}
      />
    );
  }

  if (screen === 'interests') {
    return (
      <Modal
        id="welcome-modal"
        isOpen={welcomeModal.isOpen}
        onClose={() => welcomeModal.onClose()}
        onSubmit={() => {
          persistInterests();
          setScreen('profile');
        }}
        title="Welcome to ForMe"
        body={interestsBody}
        actionLabel={selectedInterests.length > 0 ? 'Continue' : 'Skip'}
        secondaryAction={() => setScreen('profile')}
        secondaryActionLabel={selectedInterests.length > 0 ? 'Skip' : undefined}
        className={widthClass}
      />
    );
  }

  if (screen === 'profile') {
    const hasProfileChanges =
      bio !== (currentUser?.bio || '') ||
      (profileImage && profileImage !== (currentUser?.image || ''));
    return (
      <Modal
        id="welcome-modal"
        isOpen={welcomeModal.isOpen}
        onClose={() => welcomeModal.onClose()}
        onSubmit={() => {
          persistProfile();
          setScreen('started');
        }}
        title="Welcome to ForMe"
        body={profileBody}
        actionLabel={hasProfileChanges ? 'Continue' : 'Skip'}
        secondaryAction={() => setScreen('started')}
        secondaryActionLabel={hasProfileChanges ? 'Skip' : undefined}
        className={widthClass}
      />
    );
  }

  return (
    <Modal
      id="welcome-modal"
      isOpen={welcomeModal.isOpen}
      onClose={closeAndDismiss}
      onSubmit={closeAndDismiss}
      title="Welcome to ForMe"
      body={startedBody}
      actionLabel="Done"
      className={widthClass}
    />
  );
};

export default WelcomeModal;

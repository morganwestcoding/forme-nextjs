// hooks/useReviewModal.ts
'use client';

import { create } from 'zustand';
import { SafeUser, SafeListing } from '@/app/types';

interface ReviewModalStore {
  isOpen: boolean;
  targetType: 'user' | 'listing';
  targetUser?: SafeUser | null;
  targetListing?: SafeListing | null;
  currentUser?: SafeUser | null;
  onOpen: (params: {
    targetType: 'user' | 'listing';
    targetUser?: SafeUser | null;
    targetListing?: SafeListing | null;
    currentUser?: SafeUser | null;
  }) => void;
  onClose: () => void;
}

const useReviewModal = create<ReviewModalStore>((set) => ({
  isOpen: false,
  targetType: 'user',
  targetUser: null,
  targetListing: null,
  currentUser: null,
  onOpen: ({ targetType, targetUser, targetListing, currentUser }) =>
    set({ isOpen: true, targetType, targetUser, targetListing, currentUser }),
  onClose: () =>
    set({
      isOpen: false,
      targetType: 'user',
      targetUser: null,
      targetListing: null,
      currentUser: null,
    }),
}));

export default useReviewModal;

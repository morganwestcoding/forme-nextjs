// hooks/useReservationModal.ts
'use client';

import { create } from 'zustand';
import { SafeListing, SafeUser } from '@/app/types';

interface ReservationModalStore {
  isOpen: boolean;
  listing?: SafeListing;
  currentUser?: SafeUser | null;
  serviceId?: string;
  onOpen: (listing: SafeListing, currentUser?: SafeUser | null, serviceId?: string) => void;
  onClose: () => void;
}

const useReservationModal = create<ReservationModalStore>((set) => ({
  isOpen: false,
  listing: undefined,
  currentUser: null,
  serviceId: undefined,
  onOpen: (listing, currentUser, serviceId) =>
    set({ isOpen: true, listing, currentUser, serviceId }),
  onClose: () =>
    set({ isOpen: false, listing: undefined, currentUser: null, serviceId: undefined }),
}));

export default useReservationModal;

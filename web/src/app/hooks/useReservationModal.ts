// hooks/useReservationModal.ts
'use client';

import { create } from 'zustand';
import { SafeListing, SafeUser } from '@/app/types';

interface ReservationModalStore {
  isOpen: boolean;
  listing?: SafeListing;
  currentUser?: SafeUser | null;
  serviceId?: string;
  employeeId?: string;
  onOpen: (listing: SafeListing, currentUser?: SafeUser | null, serviceId?: string, employeeId?: string) => void;
  onClose: () => void;
}

const useReservationModal = create<ReservationModalStore>((set) => ({
  isOpen: false,
  listing: undefined,
  currentUser: null,
  serviceId: undefined,
  employeeId: undefined,
  onOpen: (listing, currentUser, serviceId, employeeId) =>
    set({ isOpen: true, listing, currentUser, serviceId, employeeId }),
  onClose: () =>
    set({ isOpen: false, listing: undefined, currentUser: null, serviceId: undefined, employeeId: undefined }),
}));

export default useReservationModal;
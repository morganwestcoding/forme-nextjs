'use client';

import { create } from 'zustand';
import { SafeReservation } from '@/app/types';

type Direction = 'outgoing' | 'incoming';

type AsyncAction = () => Promise<void> | void;

interface ReservationModalStore {
  isOpen: boolean;
  reservation: SafeReservation | null;
  direction: Direction;
  past: boolean;
  onCancel?: AsyncAction;
  onRefund?: AsyncAction;
  onAccept?: AsyncAction;
  onDecline?: AsyncAction;
  onViewListing?: () => void;
  onRebook?: () => void;
  onOpen: (params: {
    reservation: SafeReservation;
    direction: Direction;
    past: boolean;
    onCancel?: AsyncAction;
    onRefund?: AsyncAction;
    onAccept?: AsyncAction;
    onDecline?: AsyncAction;
    onViewListing?: () => void;
    onRebook?: () => void;
  }) => void;
  onClose: () => void;
}

const useReservationModal = create<ReservationModalStore>((set) => ({
  isOpen: false,
  reservation: null,
  direction: 'outgoing',
  past: false,
  onOpen: (params) => set({ ...params, isOpen: true }),
  onClose: () =>
    set({
      isOpen: false,
      reservation: null,
      onCancel: undefined,
      onRefund: undefined,
      onAccept: undefined,
      onDecline: undefined,
      onViewListing: undefined,
      onRebook: undefined,
    }),
}));

export default useReservationModal;

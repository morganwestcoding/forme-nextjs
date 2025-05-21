'use client';

import { create } from 'zustand';

interface ReservationModalStore {
  isOpen: boolean;
  serviceId?: string;
  onOpen: (serviceId?: string) => void;
  onClose: () => void;
}

const useReservationModal = create<ReservationModalStore>((set) => ({
  isOpen: false,
  serviceId: undefined,
  onOpen: (serviceId) => set({ isOpen: true, serviceId }),
  onClose: () => set({ isOpen: false })
}));

export default useReservationModal;
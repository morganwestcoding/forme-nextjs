// app/hooks/useStripeCheckoutModal.ts
import { create } from 'zustand';

interface ReservationData {
  totalPrice: number;
  date: Date;
  time: string;
  listingId: string;
  serviceId: string;
  serviceName?: string;
  employeeId: string;
  employeeName?: string;
  note?: string;
  businessName?: string;
}

interface StripeCheckoutModalStore {
  isOpen: boolean;
  reservationData: ReservationData | null;
  onOpen: (data: ReservationData) => void;
  onClose: () => void;
}

const useStripeCheckoutModal = create<StripeCheckoutModalStore>((set) => ({
  isOpen: false,
  reservationData: null,
  onOpen: (data) => set({ isOpen: true, reservationData: data }),
  onClose: () => set({ isOpen: false, reservationData: null }),
}));

export default useStripeCheckoutModal;
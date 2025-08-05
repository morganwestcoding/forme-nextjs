import { create } from 'zustand';

export interface ReservationData {
  totalPrice: number;
  date: string; // Changed from Date to string to match component usage
  time: string;
  listingId: string;
  serviceId: string;
  serviceName: string; // Made required since component expects it
  employeeId: string;
  employeeName: string; // Made required since component expects it
  businessName: string; // Made required since component expects it
  note?: string;
  userId?: string; // Added for API calls
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
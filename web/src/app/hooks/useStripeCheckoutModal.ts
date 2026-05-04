import { create } from 'zustand';

export interface ReservationData {
  // totalPrice = subtotal + tipAmount.
  totalPrice: number;
  subtotal?: number;
  tipAmount?: number;
  date: string; // Changed from Date to string to match component usage
  time: string;
  listingId: string;
  // serviceId is the lead/legacy single-service id; serviceIds is the full set.
  serviceId: string;
  serviceIds?: string[];
  serviceName: string; // Made required since component expects it
  // For multi-service bookings, used to render "N services" in the modal.
  serviceCount?: number;
  employeeId: string;
  employeeName: string; // Made required since component expects it
  businessName: string; // Made required since component expects it
  note?: string;
  userId?: string; // Added for API calls
  // Guest checkout — populated when the booker isn't signed in.
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
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
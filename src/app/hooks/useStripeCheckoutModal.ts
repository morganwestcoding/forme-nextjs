// app/hooks/useStripeCheckoutModal.ts
import { create } from 'zustand';

export interface ReservationData {
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
  reservationId?: string;
  services?: Array<{
    serviceId: string;
    serviceName: string;
    price: number;
  }>;
  customerName?: string;
  customerEmail?: string;
}

export interface SubscriptionData {
  userId: string;
  subscriptionTier: string;
  tierPrice: number;
  tierDuration: string;
  tierFeatures: string[];
  customerName: string;
  customerEmail: string;
  subscriptionType: string;
  planId: string;
}

export type StripeCheckoutData = ReservationData | SubscriptionData;

interface StripeCheckoutModalStore {
  isOpen: boolean;
  checkoutData: StripeCheckoutData | null;
  checkoutType: 'reservation' | 'subscription' | null;
  onOpen: (data: StripeCheckoutData, type?: 'reservation' | 'subscription') => void;
  onClose: () => void;
  isReservation: () => boolean;
  isSubscription: () => boolean;
  getReservationData: () => ReservationData | null;
  getSubscriptionData: () => SubscriptionData | null;
}

const useStripeCheckoutModal = create<StripeCheckoutModalStore>((set, get) => ({
  isOpen: false,
  checkoutData: null,
  checkoutType: null,
  
  onOpen: (data: StripeCheckoutData, type?: 'reservation' | 'subscription') => {
    let detectedType: 'reservation' | 'subscription';
    
    if (type) {
      detectedType = type;
    } else {
      // Auto-detect based on data properties
      detectedType = 'listingId' in data ? 'reservation' : 'subscription';
    }
    
    set({ 
      isOpen: true, 
      checkoutData: data, 
      checkoutType: detectedType 
    });
  },
  
  onClose: () => set({ 
    isOpen: false, 
    checkoutData: null, 
    checkoutType: null 
  }),
  
  isReservation: () => get().checkoutType === 'reservation',
  isSubscription: () => get().checkoutType === 'subscription',
  
  getReservationData: () => {
    const { checkoutData, checkoutType } = get();
    return checkoutType === 'reservation' ? checkoutData as ReservationData : null;
  },
  
  getSubscriptionData: () => {
    const { checkoutData, checkoutType } = get();
    return checkoutType === 'subscription' ? checkoutData as SubscriptionData : null;
  },
}));

export default useStripeCheckoutModal;
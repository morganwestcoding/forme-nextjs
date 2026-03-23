import { create } from 'zustand';
import { SafeProduct } from '@/app/types';

interface ProductDetailModalStore {
  isOpen: boolean;
  product: SafeProduct | null;
  onOpen: (product: SafeProduct) => void;
  onClose: () => void;
}

const useProductDetailModal = create<ProductDetailModalStore>((set) => ({
  isOpen: false,
  product: null,
  onOpen: (product: SafeProduct) => set({ isOpen: true, product }),
  onClose: () => set({ isOpen: false, product: null }),
}));

export default useProductDetailModal;

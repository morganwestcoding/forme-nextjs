// app/hooks/useProductModal.ts
import { create } from 'zustand';
import { SafeProduct } from '@/app/types';

interface ProductModalStore {
  isOpen: boolean;
  product: SafeProduct | null;
  shopId: string | null;
  onOpen: (shopId?: string) => void;
  onClose: () => void;
  onEdit: (product: SafeProduct) => void;
}

const useProductModal = create<ProductModalStore>((set) => ({
  isOpen: false,
  product: null,
  shopId: null,
  onOpen: (shopId?: string) => set({ isOpen: true, product: null, shopId: shopId || null }),
  onClose: () => set({ isOpen: false, product: null, shopId: null }),
  onEdit: (product: SafeProduct) => set({ isOpen: true, product, shopId: product.shopId }),
}));

export default useProductModal;
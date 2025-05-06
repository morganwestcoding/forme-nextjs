// app/hooks/useShopModal.ts
import { create } from 'zustand';
import { SafeShop } from '@/app/types';

interface ShopModalStore {
  isOpen: boolean;
  shop: SafeShop | null;
  onOpen: () => void;
  onClose: () => void;
  onEdit: (shop: SafeShop) => void;
}

const useShopModal = create<ShopModalStore>((set) => ({
  isOpen: false,
  shop: null,
  onOpen: () => set({ isOpen: true, shop: null }),
  onClose: () => set({ isOpen: false, shop: null }),
  onEdit: (shop: SafeShop) => set({ isOpen: true, shop }),
}));

export default useShopModal;
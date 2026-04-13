import { create } from "zustand";

interface UpgradeModalStore {
  isOpen: boolean;
  feature: string;
  requiredTier: string;
  onOpen: (feature: string, requiredTier?: string) => void;
  onClose: () => void;
}

const useUpgradeModal = create<UpgradeModalStore>((set) => ({
  isOpen: false,
  feature: "",
  requiredTier: "Gold",
  onOpen: (feature, requiredTier = "Gold") =>
    set({ isOpen: true, feature, requiredTier }),
  onClose: () => set({ isOpen: false }),
}));

export default useUpgradeModal;

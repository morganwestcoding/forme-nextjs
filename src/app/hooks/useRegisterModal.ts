// app/hooks/useRegisterModal.ts
import { create } from "zustand";

type Prefill = {
  id?: string;
  name?: string;
  email?: string;
  location?: string;
  bio?: string;
  image?: string | null;
  imageSrc?: string | null;
  backgroundImage?: string | null;
  targetUserId?: string;  // For master users editing other profiles
};

interface RegisterModalStore {
  isOpen: boolean;
  mode: 'register' | 'edit';
  prefill?: Prefill;
  onOpen: (opts?: { mode?: 'register' | 'edit'; prefill?: Prefill }) => void;
  onClose: () => void;
  clear: () => void;
}

const useRegisterModal = create<RegisterModalStore>((set) => ({
  isOpen: false,
  mode: 'register',
  prefill: undefined,
  onOpen: (opts) => set({
    isOpen: true,
    mode: opts?.mode ?? 'register',
    prefill: opts?.prefill,
  }),
  onClose: () => set({ isOpen: false }),
  clear: () => set({ prefill: undefined, mode: 'register' })
}));

export default useRegisterModal;

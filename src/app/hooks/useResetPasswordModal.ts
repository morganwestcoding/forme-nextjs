import { create } from 'zustand';

interface ResetPasswordModalStore {
  isOpen: boolean;
  token: string | null;
  onOpen: (token: string) => void;
  onClose: () => void;
}

const useResetPasswordModal = create<ResetPasswordModalStore>((set) => ({
  isOpen: false,
  token: null,
  onOpen: (token: string) => {
    set((state) => ({
      ...state,
      isOpen: true,
      token: token
    }));
  },
  onClose: () => {
    set((state) => ({
      ...state,
      isOpen: false,
      token: null
    }));
  },
}));

export default useResetPasswordModal;
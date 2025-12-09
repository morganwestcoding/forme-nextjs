// app/hooks/useInboxModal.ts
import { create } from 'zustand';

// Simplified user type that works with both full SafeUser and partial user from Sidebar
interface InboxUser {
  id?: string;
  name?: string | null;
  image?: string | null;
}

interface InboxModalStore {
  isOpen: boolean;
  currentUser: InboxUser | null | undefined;
  onOpen: (user: InboxUser | null | undefined) => void;
  onClose: () => void;
}

const useInboxModal = create<InboxModalStore>((set) => ({
  isOpen: false,
  currentUser: null,
  onOpen: (user) => set({ isOpen: true, currentUser: user }),
  // 👇 keep currentUser so MessageModal can restore the inbox with it
  onClose: () => set((s) => ({ isOpen: false, currentUser: s.currentUser })),
}));

export default useInboxModal;

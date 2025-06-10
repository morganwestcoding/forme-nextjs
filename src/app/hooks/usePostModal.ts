import { create } from 'zustand';
import { SafePost } from '@/app/types';

interface PostModalStore {
  isOpen: boolean;
  post: SafePost | null;
  onOpen: (post: SafePost) => void;
  onClose: () => void;
}

const usePostModal = create<PostModalStore>((set) => ({
  isOpen: false,
  post: null,
  onOpen: (post) => set({ isOpen: true, post }),
  onClose: () => set({ isOpen: false, post: null })
}));

export default usePostModal;

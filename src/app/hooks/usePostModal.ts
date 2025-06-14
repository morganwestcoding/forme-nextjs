import { create } from 'zustand';
import { SafePost, SafeUser } from '@/app/types';

interface PostModalStore {
  isOpen: boolean;
  post: SafePost | null;
  currentUser: SafeUser | null;
  onOpen: (post: SafePost, user: SafeUser, onUpdate?: (updatedPost: SafePost) => void) => void;
  onClose: () => void;
  setPost: (post: SafePost) => void;
  syncCallback?: (updatedPost: SafePost) => void;
}

const usePostModal = create<PostModalStore>((set) => ({
  isOpen: false,
  post: null,
  currentUser: null,
  syncCallback: undefined,
  onOpen: (post, user, onUpdate) => set({ isOpen: true, post, currentUser: user, syncCallback: onUpdate }),
  onClose: () => set({ isOpen: false, post: null, currentUser: null, syncCallback: undefined }),
  setPost: (post) => set({ post }),
}));

export default usePostModal;

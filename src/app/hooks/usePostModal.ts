import { create } from 'zustand';
import { SafePost, SafeUser } from '@/app/types';

interface PostModalStore {
  isOpen: boolean;
  post: SafePost | null;
  currentUser: SafeUser | null;
  onOpen: (post: SafePost, user: SafeUser) => void;
  onClose: () => void;
  setPost: (post: SafePost) => void;
}

const usePostModal = create<PostModalStore>((set) => ({
  isOpen: false,
  post: null,
  currentUser: null,
  setPost: (post) => set({ post }),
  onOpen: async (post, user) => {
    try {
      const res = await fetch(`/api/posts/${post.id}`);
      const freshPost = await res.json();
      set({ isOpen: true, post: freshPost, currentUser: user });
    } catch {
      set({ isOpen: true, post, currentUser: user });
    }
  },
  onClose: () => set({ isOpen: false, post: null, currentUser: null }),
}));

export default usePostModal;
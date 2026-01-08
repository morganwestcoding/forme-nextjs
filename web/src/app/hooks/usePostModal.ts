import { create } from 'zustand';
import { SafePost, SafeUser } from '@/app/types';

interface PostModalStore {
  isOpen: boolean;
  post: SafePost | null;
  currentUser: SafeUser | null;
  posts: SafePost[]; // NEW: Array of all posts for carousel
  initialIndex: number; // NEW: Starting index for the carousel
  onOpen: (
    post: SafePost,
    user: SafeUser | null | undefined,
    onUpdate?: (updatedPost: SafePost) => void,
    posts?: SafePost[], // NEW: Optional posts array
    initialIndex?: number // NEW: Optional starting index
  ) => void;
  onClose: () => void;
  setPost: (post: SafePost) => void;
  syncCallback?: (updatedPost: SafePost) => void;
}

const usePostModal = create<PostModalStore>((set) => ({
  isOpen: false,
  post: null,
  currentUser: null,
  posts: [], // NEW: Initialize empty array
  initialIndex: 0, // NEW: Initialize to 0
  syncCallback: undefined,
  onOpen: (post, user, onUpdate, posts = [], initialIndex = 0) => set({
    isOpen: true,
    post,
    currentUser: user ?? null,
    syncCallback: onUpdate,
    posts, // NEW: Set posts array
    initialIndex // NEW: Set starting index
  }),
  onClose: () => set({ 
    isOpen: false, 
    post: null, 
    currentUser: null, 
    syncCallback: undefined,
    posts: [], // NEW: Reset posts array
    initialIndex: 0 // NEW: Reset index
  }),
  setPost: (post) => set({ post }),
}));

export default usePostModal;
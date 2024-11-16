// hooks/usePostStore.ts
import { create } from 'zustand';
import { SafePost } from '@/app/types';

interface PostStore {
  posts: SafePost[];
  addPost: (post: SafePost) => void;
  setPosts: (posts: SafePost[]) => void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  setPosts: (posts) => set({ posts }),
}));
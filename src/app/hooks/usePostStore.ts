// app/hooks/usePostStore.ts
import { create } from 'zustand';
import { SafePost } from '@/app/types';

interface PostStore {
  posts: SafePost[];
  setPosts: (posts: SafePost[]) => void;
  addPost: (post: SafePost) => void;
  updatePost: (postId: string, updates: Partial<SafePost>) => void;
  removePost: (postId: string) => void;
}

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  
  setPosts: (posts) => set({ posts }),
  
  addPost: (post) => set((state) => ({ 
    posts: [post, ...state.posts] 
  })),
  
  updatePost: (postId, updates) => set((state) => ({
    posts: state.posts.map(post => 
      post.id === postId 
        ? { ...post, ...updates }
        : post
    )
  })),
  
  removePost: (postId) => set((state) => ({
    posts: state.posts.filter(post => post.id !== postId)
  }))
}));
import { create } from 'zustand';
import { SafeUser, SafeComment, MediaType } from '@/app/types';

interface PostData {
  id: string;
  user: SafeUser;
  createdAt: string;
  content: string;
  imageSrc: string | null;
  mediaUrl?: string | null;
  mediaType?: MediaType | null;
  category: string;
  location?: string | null;
  likes: string[];
  bookmarks: string[];
}

interface PostModalStore {
  isOpen: boolean;
  post: PostData | null;
  comments: SafeComment[];
  currentUser: SafeUser | null;
  onOpen: () => void;
  onClose: () => void;
  setPost: (post: PostData) => void;
  setComments: (comments: SafeComment[]) => void;
  setCurrentUser: (user: SafeUser | null) => void;
  onLike: () => void;
  onBookmark: () => void;
  refreshComments: () => void;
}

const usePostModal = create<PostModalStore>((set, get) => ({
  isOpen: false,
  post: null,
  comments: [],
  currentUser: null,
  
  onOpen: () => {
    set({ isOpen: true });
  },
  
  onClose: () => {
    set({ isOpen: false });
  },
  
  setPost: (post) => set({ post }),
  setComments: (comments) => set({ comments }),
  setCurrentUser: (user) => set({ currentUser: user }),
  
  onLike: async () => {
    const { post, currentUser } = get();
    if (!post || !currentUser) return;
    
    try {
      const response = await fetch(`/api/postActions/${post.id}/like`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        set({ post: { ...post, likes: data.likes } });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  },
  
  onBookmark: async () => {
    const { post, currentUser } = get();
    if (!post || !currentUser) return;
    
    try {
      const response = await fetch(`/api/postActions/${post.id}/bookmark`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        set({ post: { ...post, bookmarks: data.bookmarks } });
      }
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  },
  
  refreshComments: async () => {
    const { post } = get();
    if (!post) return;
    
    try {
      const response = await fetch(`/api/comments?postId=${post.id}`);
      const data = await response.json();
      
      if (response.ok) {
        set({ comments: data });
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }
}));

export default usePostModal;
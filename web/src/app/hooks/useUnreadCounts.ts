'use client';

import { create } from 'zustand';

interface UnreadCountsStore {
  unreadMessages: number;
  unreadNotifications: number;
  incrementMessages: () => void;
  incrementNotifications: () => void;
  setMessages: (count: number) => void;
  setNotifications: (count: number) => void;
  decrementMessages: () => void;
  decrementNotifications: (amount?: number) => void;
}

const useUnreadCounts = create<UnreadCountsStore>((set) => ({
  unreadMessages: 0,
  unreadNotifications: 0,
  incrementMessages: () =>
    set((s) => ({ unreadMessages: s.unreadMessages + 1 })),
  incrementNotifications: () =>
    set((s) => ({ unreadNotifications: s.unreadNotifications + 1 })),
  setMessages: (count) => set({ unreadMessages: count }),
  setNotifications: (count) => set({ unreadNotifications: count }),
  decrementMessages: () =>
    set((s) => ({ unreadMessages: Math.max(0, s.unreadMessages - 1) })),
  decrementNotifications: (amount = 1) =>
    set((s) => ({ unreadNotifications: Math.max(0, s.unreadNotifications - amount) })),
}));

export default useUnreadCounts;

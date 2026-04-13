'use client';

import { useEffect } from 'react';
import { useSSE } from '@/app/hooks/useSSE';
import useUnreadCounts from '@/app/hooks/useUnreadCounts';

/**
 * Fetches initial unread counts on mount and listens for SSE events
 * to keep badge counts up-to-date in real time.
 * Render once near the app root (e.g., in layout.tsx).
 */
export default function UnreadBadgeProvider() {
  const { setMessages, setNotifications, incrementMessages, incrementNotifications } =
    useUnreadCounts();

  // Fetch initial counts on mount
  useEffect(() => {
    async function fetchCounts() {
      try {
        const [convRes, notifRes] = await Promise.all([
          fetch('/api/conversations'),
          fetch('/api/notifications'),
        ]);
        if (convRes.ok) {
          const conversations = await convRes.json();
          const unread = conversations.filter(
            (c: any) => c.lastMessage && !c.lastMessage.isRead
          ).length;
          setMessages(unread);
        }
        if (notifRes.ok) {
          const data = await notifRes.json();
          const items = data.notifications || data;
          const unread = items.filter((n: any) => !n.isRead).length;
          setNotifications(unread);
        }
      } catch {
        // silently handled
      }
    }
    fetchCounts();
  }, [setMessages, setNotifications]);

  // Real-time: bump message count
  useSSE('CONVERSATION_UPDATED', () => {
    incrementMessages();
  });

  // Real-time: bump notification count
  useSSE('NOTIFICATION_CREATED', () => {
    incrementNotifications();
  });

  return null;
}

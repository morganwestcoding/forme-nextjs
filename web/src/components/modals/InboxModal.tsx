// components/modals/InboxModal.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { SafeConversation } from "@/app/types";
import useMessageModal from "@/app/hooks/useMessageModal";
import Modal from './Modal';
import BouncingDots from '../ui/BouncingDots';
import Skeleton from '../ui/Skeleton';
import useInboxModal from '@/app/hooks/useInboxModal';
import useUnreadCounts from '@/app/hooks/useUnreadCounts';
import { useSSE } from '@/app/hooks/useSSE';
import { Search01Icon as Search, MessageMultiple01Icon as MessageCircle, UserIcon as User } from 'hugeicons-react';

type ItemType = "user" | "listing" | "post" | "shop" | "product" | "employee" | "service";
type ResultItem = { id: string; type: ItemType; title: string; subtitle?: string; image?: string | null };

// Global state to persist read conversations across modal openings
let readConversations = new Set<string>();
// Cache last-known conversations so reopening the inbox renders instantly
// while a fresh fetch runs in the background.
let conversationsCache: SafeConversation[] | null = null;

// Let non-modal code (e.g. the unread-badge provider that already fetches
// /api/conversations on app mount) seed the cache so the first open of the
// inbox renders instantly instead of showing a skeleton.
export function primeConversationsCache(data: SafeConversation[]) {
  conversationsCache = data;
}

function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const initials = (name?: string | null) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || '';
  const b = parts[1]?.[0] || '';
  return (a + b || a).toUpperCase();
};

// Generate avatar colors based on name
const getAvatarColor = (name?: string | null) => {
  if (!name) return 'bg-stone-500';

  const colors = [
    'bg-stone-500',
    'bg-success',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-stone-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-danger',
    'bg-stone-500'
  ];

  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const Avatar: React.FC<{
  src?: string | null;
  name?: string | null;
  size?: number;
}> = ({
  src,
  name,
  size = 48
}) => {
  const px = `${size}px`;
  const avatarColor = getAvatarColor(name);

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`relative rounded-full overflow-hidden flex items-center justify-center text-white font-semibold
                   ${!src ? avatarColor : 'bg-stone-100 dark:bg-stone-800'}`}
        style={{ width: px, height: px }}
      >
        {src ? (
          <Image
            src={src}
            alt={name || 'User'}
            fill
            sizes={px}
            className="object-cover"
            onError={(e) => {
              const target = e.currentTarget.parentElement;
              if (target) {
                target.className = `relative rounded-full overflow-hidden flex items-center justify-center text-white font-semibold ${avatarColor}`;
                target.textContent = '';
                const span = document.createElement('span');
                span.style.fontSize = `${size * 0.4}px`;
                span.textContent = initials(name);
                target.appendChild(span);
              }
            }}
          />
        ) : (
          <span style={{ fontSize: `${size * 0.4}px` }}>{initials(name)}</span>
        )}
      </div>

    </div>
  );
};

const ConversationCard: React.FC<{
  conversation: SafeConversation;
  onClick: () => void;
}> = ({ conversation, onClick }) => {
  const isRead = readConversations.has(conversation.id) || (conversation.lastMessage?.isRead ?? true);
  const hasUnread = conversation.lastMessage && !isRead;

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`group cursor-pointer rounded-xl transition-all duration-200
                 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900 active:scale-[0.99]
                 ${hasUnread ? 'bg-stone-50/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar
            src={conversation.otherUser.image}
            name={conversation.otherUser.name}
            size={48}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-0.5">
            <h3 className={`font-medium text-sm truncate ${
              hasUnread ? 'text-stone-900 dark:text-stone-100' : 'text-stone-700 dark:text-stone-200'
            }`}>
              {conversation.otherUser.name}
            </h3>
            {conversation.lastMessage?.createdAt && (
              <span className={`text-xs flex-shrink-0 ${
                hasUnread ? 'text-stone-500  dark:text-stone-500 font-medium' : 'text-stone-400 dark:text-stone-500'
              }`}>
                {formatRelativeTime(conversation.lastMessage.createdAt)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className={`text-sm truncate ${
              hasUnread ? 'text-stone-600 dark:text-stone-300' : 'text-stone-500  dark:text-stone-500'
            }`}>
              {conversation.lastMessage?.content || (
                <span className="italic text-stone-400 dark:text-stone-500">Say hello...</span>
              )}
            </p>
            {hasUnread && (
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#1c1917' }}></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InboxModal = () => {
  const [conversations, setConversations] = useState<SafeConversation[]>(conversationsCache || []);
  // Only show the loader on the very first fetch (no cache). After that we render
  // the cached list immediately and refresh silently in the background.
  const [conversationsLoading, setConversationsLoading] = useState<boolean>(conversationsCache === null);
  const messageModal = useMessageModal();
  const inboxModal = useInboxModal();
  const currentUser = inboxModal.currentUser;
  const { setMessages: setUnreadMessages } = useUnreadCounts();

  // search state
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q, 250);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inboxModal.isOpen && currentUser) {
      fetchConversations();
    }
  }, [inboxModal.isOpen, currentUser]);

  const fetchConversations = async () => {
    // If the cache has been primed since this component mounted (e.g. by
    // UnreadBadgeProvider's initial fetch on app load), hydrate local state
    // from it immediately so the inbox opens with data instead of a skeleton.
    if (conversationsCache && conversationsCache.length > 0) {
      setConversations(conversationsCache);
      setConversationsLoading(false);
    } else {
      setConversationsLoading(true);
    }
    try {
      const response = await axios.get('/api/conversations');
      conversationsCache = response.data;
      setConversations(response.data);
      // Sync unread badge count
      const unread = response.data.filter(
        (c: SafeConversation) => c.lastMessage && !c.lastMessage.isRead
      ).length;
      setUnreadMessages(unread);
    } catch (error) {
      // Keep the previously-rendered conversations in place rather than
      // clobbering with an empty list; only toast if we had nothing to show.
      if (!conversationsCache || conversationsCache.length === 0) {
        toast.error('Couldn’t load your inbox. Check your connection and try again.');
      }
    } finally {
      setConversationsLoading(false);
    }
  };

  const openConversation = (
    conversationId: string,
    otherUserId: string,
    otherUserName?: string | null,
    otherUserImage?: string | null
  ) => {
    // Optimistically mark as read locally and open the conversation modal.
    readConversations.add(conversationId);
    setConversations(prev => [...prev]);

    messageModal.onOpen(conversationId, otherUserId, {
      name: otherUserName || null,
      image: otherUserImage || null
    });
    inboxModal.onClose();

    // Fire-and-forget: mark as read on the server. A failure here must not
    // block the conversation from opening or messages from loading.
    axios.post('/api/messages/read', { conversationId }).catch(() => {
      readConversations.delete(conversationId);
      setConversations(prev => [...prev]);
    });
  };

  const startNewConversation = async (userId: string) => {
    try {
      const response = await axios.post('/api/conversations', { userId });
      const newConversation = response.data;
      openConversation(newConversation.id, userId);
    } catch (error) {
      toast.error('Couldn’t start that conversation. Try again.');
    }
  };

  // Global function for MessageModal to mark as read
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).markInboxConversationAsRead = (conversationId: string) => {
        readConversations.add(conversationId);
        setConversations(prev => [...prev]); // Force re-render
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).markInboxConversationAsRead;
      }
    };
  }, []);

  // fetch users-only results
  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!debouncedQ || debouncedQ.length < 2) {
        setResults([]);
        setOpen(!!debouncedQ);
        setActiveIdx(-1);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        if (!ignore) {
          const items: ResultItem[] = (data.results || []).filter((r: ResultItem) => r.type === 'user');
          setResults(items);
          setOpen(true);
          setActiveIdx(items.length ? 0 : -1);
        }
      } catch {
        if (!ignore) {
          setResults([]);
          setOpen(true);
          setActiveIdx(-1);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => { ignore = true; };
  }, [debouncedQ]);

  // click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // keyboard nav
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open || e.target !== e.currentTarget) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((idx) => Math.min(idx + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((idx) => Math.max(idx - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) handleSelect(results[activeIdx]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  // Real-time: update conversation list when new messages arrive
  useSSE('CONVERSATION_UPDATED', (data: any) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === data.conversationId);
      if (idx === -1) {
        // New conversation - refetch to get full data
        fetchConversations();
        return prev;
      }
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt,
      };
      // Re-sort by lastMessageAt descending
      updated.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      return updated;
    });
  });

  // Real-time: new notification means new message, clear read state
  useSSE('NOTIFICATION_CREATED', (data: any) => {
    if (data.type === 'NEW_MESSAGE') {
      // A new message notification arrived - conversations list may need refresh
      // The CONVERSATION_UPDATED event handles the actual data update
    }
  });

  // keep active in view
  useEffect(() => {
    if (!listRef.current) return;
    const node = listRef.current.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const handleSelect = (item: ResultItem) => {
    setOpen(false);
    setQ('');
    if (item?.id) startNewConversation(item.id);
  };

  const styles = `
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) transparent; }
  `;

  const bodyContent = conversationsLoading ? (
    <div className="flex flex-col h-[580px] pb-2 pt-6 md:pt-8 px-4">
      <style>{styles}</style>
      <div className="mx-auto w-full max-w-[520px] flex flex-col flex-1 min-h-0">
        {/* Header skeleton */}
        <div className="text-center mb-6">
          <Skeleton className="h-9 w-40 mx-auto" />
          <Skeleton className="h-3 w-56 mx-auto mt-3" />
        </div>
        {/* Search skeleton */}
        <div className="mb-6">
          <Skeleton rounded="2xl" className="h-11 w-full" />
        </div>
        {/* Conversation row skeletons */}
        <div className="flex-1 overflow-hidden -mx-2 px-2">
          <div className="space-y-2 py-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton rounded="full" className="h-12 w-12 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Footer link skeleton */}
        <div className="pt-4 mt-auto">
          <Skeleton rounded="xl" className="h-10 w-full" />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col h-[580px] pb-2 pt-6 md:pt-8 px-4">
      <style>{styles}</style>

      <div className="mx-auto w-full max-w-[520px] flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Messages</h2>
          <p className="text-stone-500  dark:text-stone-500 text-sm mt-2">Connect with your community</p>
        </div>

        {/* Search - Market style */}
        <div ref={containerRef} className="relative mb-6">
          <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800">
            <div className="flex items-center gap-2 px-4 py-2.5">
              <Search className="w-[18px] h-[18px] text-stone-400 dark:text-stone-500 flex-shrink-0" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => results.length && setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder="Search for people to message..."
                className="flex-1 text-sm bg-transparent border-none outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400 font-normal"
              />
            </div>
          </div>

          {/* Search dropdown */}
          {open && (
            <div
              ref={listRef}
              className="absolute z-50 mt-2 w-full max-h-72 overflow-auto rounded-2xl
                         border border-stone-200 dark:border-stone-800 bg-white/95 backdrop-blur-xl shadow-elevation-3 custom-scrollbar"
            >
              {loading && (
                <div className="px-4 py-6 flex flex-col items-center justify-center gap-3">
                  <BouncingDots />
                </div>
              )}
              {!loading && q.trim().length >= 2 && results.length === 0 && (
                <div className="px-4 py-6 text-sm text-stone-400 dark:text-stone-500 text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                  </div>
                  No people found for &ldquo;{q}&rdquo;
                </div>
              )}
              {!loading && results.length > 0 && (
                <div className="py-2">
                  {results.map((item, idx) => {
                    const active = idx === activeIdx;
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        data-idx={idx}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => handleSelect(item)}
                        className={`mx-2 px-3 py-2.5 cursor-pointer flex items-center gap-3 rounded-xl transition-all duration-150 ${
                          active ? 'bg-stone-100 dark:bg-stone-800' : 'hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
                        }`}
                      >
                        <div className={`shrink-0 transition-all duration-150 ${active ? 'ring-2 ring-stone-300 rounded-full' : ''}`}>
                          <Avatar src={item.image} name={item.title} size={36} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-medium truncate transition-colors duration-150 ${
                            active ? 'text-stone-900 dark:text-stone-100' : 'text-stone-700 dark:text-stone-200'
                          }`}>{item.title}</div>
                          {!!item.subtitle && (
                            <div className="text-xs text-stone-400 dark:text-stone-500 truncate">{item.subtitle}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
          <div className="space-y-2 py-1">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onClick={() => openConversation(
                  conversation.id,
                  conversation.otherUser.id,
                  conversation.otherUser.name,
                  conversation.otherUser.image
                )}
              />
            ))}

            {conversations.length === 0 && (
              <div className="text-center pt-16 pb-12">
                <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-7 h-7 text-stone-400 dark:text-stone-500" />
                </div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1.5">No conversations yet</h3>
                <p className="text-sm text-stone-500  dark:text-stone-500 max-w-[240px] mx-auto">
                  Search for someone above to start your first conversation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full page link */}
        <div className="pt-4 mt-auto">
          <a
            href="/messages"
            onClick={(e) => {
              e.preventDefault();
              inboxModal.onClose();
              window.location.href = '/messages';
            }}
            className="block w-full py-2.5 rounded-xl text-center text-sm font-medium
                       text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800
                       hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white
                       transition-all duration-200"
          >
            See all messages
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={inboxModal.isOpen}
      onClose={inboxModal.onClose}
      onSubmit={() => {}}
      title="Inbox"
      body={bodyContent}
      className="md:w-[520px]"
    />
  );
};

export default InboxModal;

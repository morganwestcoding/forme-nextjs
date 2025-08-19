// components/modals/InboxModal.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search } from 'lucide-react';
import { SafeConversation } from "@/app/types";
import useMessageModal from "@/app/hooks/useMessageModal";
import Modal from './Modal';
import useInboxModal from '@/app/hooks/useInboxModal';
import Heading from '@/components/Heading';

type ItemType = "user" | "listing" | "post" | "shop" | "product" | "employee" | "service";
type ResultItem = { id: string; type: ItemType; title: string; subtitle?: string; image?: string | null };

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

const Avatar: React.FC<{ src?: string | null; name?: string | null; size?: number }> = ({ src, name, size = 44 }) => {
  const px = `${size}px`;
  return (
    <div
      className="relative rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center text-sm text-neutral-600"
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
            // @ts-ignore
            e.currentTarget.parentElement.innerHTML =
              `<div class="w-full h-full flex items-center justify-center text-[12px] text-neutral-600 bg-gray-100">${initials(name)}</div>`;
          }}
        />
      ) : (
        <span className="text-[12px]">{initials(name)}</span>
      )}
    </div>
  );
};

const InboxModal = () => {
  const [conversations, setConversations] = useState<SafeConversation[]>([]);
  const messageModal = useMessageModal();
  const inboxModal = useInboxModal();
  const currentUser = inboxModal.currentUser;

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
    if (inboxModal.isOpen && currentUser) fetchConversations();
  }, [inboxModal.isOpen, currentUser]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const openConversation = async (conversationId: string, otherUserId: string) => {
    try {
      await axios.post('/api/messages/read', { conversationId });
      messageModal.onOpen(conversationId, otherUserId);
      inboxModal.onClose();
    } catch (error) {
      console.error('Error updating message read status:', error);
      toast.error('Failed to update message status');
    }
  };

  const startNewConversation = async (userId: string) => {
    try {
      const response = await axios.post('/api/conversations', { userId });
      const newConversation = response.data;
      openConversation(newConversation.id, userId);
    } catch (error) {
      console.error('Error starting new conversation:', error);
      toast.error('Failed to start new conversation');
    }
  };

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
    if (!open) return;
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
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.25) transparent; }
  `;

  const bodyContent = (
    <div className="flex flex-col h-[550px] pb-2 pt-4 md:pt-6">
      <style>{styles}</style>

      {/* Shared width container: search + conversations match exactly */}
      <div className="mx-auto w-full max-w-[520px]">
        <Heading
          title="Your Inbox"
          subtitle="Search for users to start a chat or pick a recent conversation"
        />

        {/* SEARCH */}
        <div ref={containerRef} className="relative mb-4 mt-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => results.length && setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Search users…"
              className="w-full h-12 pl-12 pr-4 text-sm
                         bg-white border border-gray-200 rounded-xl
                         outline-none focus:ring-2 focus:ring-[#60A5FA]
                         text-neutral-600 placeholder:text-gray-400"
            />
          </div>

          {/* DROPDOWN */}
          {open && (
            <div
              ref={listRef}
              className="absolute z-50 mt-2 w-full max-h-96 overflow-auto rounded-xl
                         border border-gray-200 bg-white shadow-lg custom-scrollbar"
            >
              {loading && (
                <div className="px-4 py-3 text-sm text-neutral-600">Searching…</div>
              )}
              {!loading && q.trim().length >= 2 && results.length === 0 && (
                <div className="px-4 py-3 text-sm text-neutral-600">No users found</div>
              )}
              {!loading && results.length > 0 && (
                <ul className="py-2">
                  {results.map((item, idx) => {
                    const active = idx === activeIdx;
                    return (
                      <li
                        key={`${item.type}-${item.id}`}
                        data-idx={idx}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => handleSelect(item)}
                        className={`px-3 py-2 cursor-pointer flex items-center gap-3 rounded-md ${
                          active ? 'bg-[#EBF4FE]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="shrink-0">
                          <Avatar src={item.image} name={item.title} size={32} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-neutral-800 truncate">{item.title}</div>
                          {!!item.subtitle && (
                            <div className="text-xs text-neutral-600 truncate">{item.subtitle}</div>
                          )}
                        </div>
                        <div className="ml-auto text-[10px] uppercase tracking-wide text-gray-400">
                          User
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* CONVERSATIONS (exact same width as search) */}
        <div className="h-[420px] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            {conversations.map((c) => (
              <div
                key={c.id}
                className="w-full flex items-center gap-3 cursor-pointer
                           bg-white border border-gray-200 hover:bg-gray-50
                           rounded-2xl p-4 transition shadow-sm"
                onClick={() => openConversation(c.id, c.otherUser.id)}
              >
                <Avatar src={c.otherUser.image} name={c.otherUser.name} size={44} />

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-800 truncate">
                    {c.otherUser.name}
                  </div>
                  <div className="text-sm text-neutral-600 truncate">
                    {c.lastMessage?.content || 'No messages yet'}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-neutral-500">
                    {c.lastMessage?.createdAt &&
                      new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </span>
                  {c.lastMessage && (
<span
  className={`text-xs px-3 py-1 rounded-lg font-medium ${
    c.lastMessage.isRead
      ? 'bg-gray-100 text-neutral-600 border border-gray-200'
      : 'text-[#60A5FA] bg-blue-50 border border-[#60A5FA]'
  }`}
>
  {c.lastMessage.isRead ? 'Read' : 'New'}
</span>

                  )}
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center text-neutral-600 mt-6 text-sm">
                No conversations yet. Search a user above to start chatting.
              </div>
            )}
          </div>
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
      className="md:w-[500px]"
    />
  );
};

export default InboxModal;

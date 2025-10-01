// components/modals/InboxModal.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, MessageCircle, Clock, User, ChevronRight } from 'lucide-react';
import { SafeConversation } from "@/app/types";
import useMessageModal from "@/app/hooks/useMessageModal";
import Modal from './Modal';
import useInboxModal from '@/app/hooks/useInboxModal';

type ItemType = "user" | "listing" | "post" | "shop" | "product" | "employee" | "service";
type ResultItem = { id: string; type: ItemType; title: string; subtitle?: string; image?: string | null };

// Global state to persist read conversations across modal openings
let readConversations = new Set<string>();

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
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-cyan-500'
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
  size = 44
}) => {
  const px = `${size}px`;
  const avatarColor = getAvatarColor(name);
  
  return (
    <div className="relative">
      <div
        className={`relative rounded-full overflow-hidden flex items-center justify-center text-white font-medium
                   ${!src ? avatarColor : 'bg-gray-100'}`}
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
                target.className = `relative rounded-full overflow-hidden flex items-center justify-center text-white font-medium ${avatarColor}`;
                target.innerHTML = `<span style="font-size: ${size * 0.4}px">${initials(name)}</span>`;
              }
            }}
          />
        ) : (
          <span style={{ fontSize: `${size * 0.4}px` }}>{initials(name)}</span>
        )}
      </div>
      
      {/* Green online status indicator - always show */}
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
    </div>
  );
};

const ConversationCard: React.FC<{
  conversation: SafeConversation;
  onClick: () => void;
}> = ({ conversation, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  // Check if conversation is read from global state OR from lastMessage.isRead
  const isRead = readConversations.has(conversation.id) || (conversation.lastMessage?.isRead ?? true);
  const hasUnread = conversation.lastMessage && !isRead;
  
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`w-full flex items-center gap-3 cursor-pointer
                   bg-white border rounded-xl p-3 transition-all duration-300 ease-out
                   ${hasUnread ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}
                   ${isHovered ? 'shadow-lg border-gray-400' : 'shadow-sm'}`}
        onClick={onClick}
      >
        {/* Avatar */}
        <div className={`transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}>
          <Avatar 
            src={conversation.otherUser.image} 
            name={conversation.otherUser.name} 
            size={44}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Name and message closer together */}
          <div className="space-y-0.5">
            <h3 className={`font-semibold truncate text-sm transition-colors duration-200 ${
              hasUnread ? 'text-gray-900' : 'text-gray-800'
            } ${isHovered ? 'text-blue-600' : ''}`}>
              {conversation.otherUser.name}
            </h3>
            <p className={`text-xs truncate leading-tight transition-colors duration-200 ${
              hasUnread ? 'text-gray-700' : 'text-gray-600'
            } ${isHovered ? 'text-gray-800' : ''}`}>
              {conversation.lastMessage?.content || (
                <span className="italic text-gray-500">Start a conversation</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {/* Time */}
          {conversation.lastMessage?.createdAt && (
            <span className={`text-[10px] font-medium transition-colors duration-200 ${
              isHovered ? 'text-blue-500' : 'text-gray-500'
            }`}>
              {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
          
          {/* Status indicator */}
          {conversation.lastMessage && (
            <div className="flex items-center gap-1">
              {hasUnread ? (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
              ) : (
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              )}
              <span className={`text-[10px] font-medium transition-colors duration-200 ${
                hasUnread ? 'text-blue-600' : 'text-gray-500'
              } ${isHovered ? 'text-blue-600' : ''}`}>
                {hasUnread ? 'New' : 'Read'}
              </span>
            </div>
          )}
          
          {/* Hover arrow */}
          <ChevronRight className={`w-3 h-3 transition-all duration-300 ${
            isHovered ? 'translate-x-1 opacity-100 text-blue-500' : 'opacity-0 text-gray-400'
          }`} />
        </div>
      </div>
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
    if (inboxModal.isOpen && currentUser) {
      fetchConversations();
    }
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
      // Add to read conversations set immediately
      readConversations.add(conversationId);
      
      // Trigger re-render by updating conversations state
      setConversations(prev => [...prev]);
      
      // Call API to mark as read
      await axios.post('/api/messages/read', { conversationId });
      
      messageModal.onOpen(conversationId, otherUserId);
      inboxModal.onClose();
    } catch (error) {
      console.error('Error updating message read status:', error);
      // Remove from read set if API call failed
      readConversations.delete(conversationId);
      setConversations(prev => [...prev]);
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

  // FIXED: keyboard nav - only handle when dropdown is open AND this input is focused
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    // Only handle keyboard nav if dropdown is open AND this is the focused element
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
    // Let all other keys (including space) pass through normally
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
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) transparent; }
  `;

  const bodyContent = (
    <div className="flex flex-col h-[580px] pb-2 pt-4 md:pt-6 px-3">
      <style>{styles}</style>
      
      <div className="mx-auto w-full max-w-[520px]">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inbox</h2>
          <p className="text-gray-600">Connect with your community</p>
        </div>

        {/* Search */}
        <div ref={containerRef} className="relative mb-6">
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
              placeholder="Search for people to message..."
              className="w-full h-12 pl-12 pr-4 text-sm bg-white border border-gray-200 rounded-lg
                         outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-700 placeholder:text-gray-400 transition-all duration-200"
            />
          </div>

          {/* Search dropdown */}
          {open && (
            <div
              ref={listRef}
              className="absolute z-50 mt-2 w-full max-h-80 overflow-auto rounded-lg
                         border border-gray-200 bg-white shadow-lg custom-scrollbar"
            >
              {loading && (
                <div className="px-4 py-3 text-sm text-gray-600 flex items-center gap-3">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  Searching for people...
                </div>
              )}
              {!loading && q.trim().length >= 2 && results.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">No people found</div>
                  <div className="text-xs text-gray-400 mt-1">Try a different search term</div>
                </div>
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
                        className={`px-3 py-2 cursor-pointer flex items-center gap-3 transition-colors ${
                          active ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="shrink-0">
                          <Avatar src={item.image} name={item.title} size={36} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-800 truncate">{item.title}</div>
                          {!!item.subtitle && (
                            <div className="text-xs text-gray-600 truncate">{item.subtitle}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
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

        {/* Conversations */}
        <div className="h-[400px] overflow-y-auto overflow-x-visible custom-scrollbar">
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onClick={() => openConversation(conversation.id, conversation.otherUser.id)}
              />
            ))}

            {conversations.length === 0 && (
              <div className="text-center mt-16 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No conversations yet</h3>
                  <p className="text-gray-600 text-sm max-w-xs mx-auto">
                    Search for someone above to start your first conversation
                  </p>
                </div>
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
      className="md:w-[520px]"
    />
  );
};

export default InboxModal;
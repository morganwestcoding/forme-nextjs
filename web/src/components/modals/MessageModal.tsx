// components/modals/MessageModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import useMessageModal from '@/app/hooks/useMessageModal';
import useInboxModal from '@/app/hooks/useInboxModal';
import { useSSE } from '@/app/hooks/useSSE';
import Modal from './Modal';
import { ArrowLeft01Icon as ArrowLeft, SentIcon as Send } from 'hugeicons-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// Module-level cache so reopening a conversation shows messages instantly
// while the network refresh runs in the background.
const messagesCache = new Map<string, Message[]>();

// Generate avatar colors based on name
const getAvatarColor = (name?: string | null) => {
  if (!name) return 'bg-stone-500';
  
  const colors = [
    'bg-stone-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-stone-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-stone-500'
  ];
  
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const initials = (name?: string | null) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || '';
  const b = parts[1]?.[0] || '';
  return (a + b || a).toUpperCase();
};

const MessageModal: React.FC = () => {
  const messageModal = useMessageModal();
  const inboxModal = useInboxModal();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otherUser, setOtherUser] = useState<{ name: string | null; image: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEmit = useRef(0);
  const emitTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingEmit.current < 2000) return;
    lastTypingEmit.current = now;
    if (messageModal.conversationId) {
      fetch('/api/sse/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: messageModal.conversationId }),
      }).catch(() => {});
    }
  }, [messageModal.conversationId]);

  useEffect(() => {
    if (messageModal.isOpen && messageModal.conversationId) {
      // Hydrate from cache instantly so the convo never flashes empty.
      const cached = messagesCache.get(messageModal.conversationId) || [];
      setMessages(cached);
      setOtherUser(messageModal.otherUserData || null);

      fetchMessages(cached.length === 0);
      if (!messageModal.otherUserData) fetchOtherUser();
    }
  }, [messageModal.isOpen, messageModal.conversationId, messageModal.otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!messageModal.isOpen) {
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  }, [messageModal.isOpen]);

  // Update otherUser when messages load if we don't have user info yet
  useEffect(() => {
    if (messages.length > 0 && !otherUser && messageModal.otherUserId) {
      const otherUserMessage = messages.find((msg: Message) => msg.senderId === messageModal.otherUserId);
      if (otherUserMessage) {
        setOtherUser({
          name: otherUserMessage.sender.name,
          image: otherUserMessage.sender.image
        });
      }
    }
  }, [messages, otherUser, messageModal.otherUserId]);

  // Real-time: receive new messages
  useSSE('MESSAGE_CREATED', (data: any) => {
    if (
      messageModal.isOpen &&
      data.conversationId === messageModal.conversationId &&
      data.senderId !== inboxModal.currentUser?.id
    ) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        const next = [...prev, data];
        if (messageModal.conversationId) messagesCache.set(messageModal.conversationId, next);
        return next;
      });
    }
  });

  // Real-time: typing indicator
  useSSE('TYPING', (data: any) => {
    if (
      messageModal.isOpen &&
      data.conversationId === messageModal.conversationId
    ) {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    }
  });

  useSSE('MESSAGES_READ', (data: any) => {
    if (data.conversationId === messageModal.conversationId) {
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    }
  });

  const fetchMessages = async (showSpinner = true) => {
    const cid = messageModal.conversationId;
    if (!cid) return;
    if (showSpinner) setIsLoading(true);
    try {
      const response = await axios.get(`/api/messages/${cid}`);
      const messagesData: Message[] = response.data;
      messagesCache.set(cid, messagesData);
      setMessages(messagesData);
    } catch {
      if (showSpinner) toast.error('Failed to load messages');
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  const fetchOtherUser = async () => {
    if (!messageModal.otherUserId) {
      return;
    }
    try {
      const response = await axios.get(`/api/users/${messageModal.otherUserId}`);
      setOtherUser({
        name: response.data.name,
        image: response.data.image || response.data.imageSrc
      });
    } catch (error) {
      // silently handled
    }
  };

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !messageModal.conversationId) return;
    try {
      const response = await axios.post(`/api/messages/${messageModal.conversationId}`, {
        content: newMessage,
      });
      setMessages((prev) => {
        const next = [...prev, response.data];
        if (messageModal.conversationId) messagesCache.set(messageModal.conversationId, next);
        return next;
      });
      setNewMessage('');
      
      // Mark as read in inbox
      if (typeof window !== 'undefined' && (window as any).markInboxConversationAsRead) {
        (window as any).markInboxConversationAsRead(messageModal.conversationId);
      }
      
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    } catch {
      toast.error('Failed to send message');
    }
  }, [newMessage, messageModal.conversationId]);

  // FIXED: Only handle Enter key, don't interfere with other keys
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only handle Enter key and only if this input is the actual target
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault();
      sendMessage();
    }
    // Let all other keys (including space) pass through normally
  };

  const handleBackToInbox = () => {
    // Mark conversation as read when going back
    if (typeof window !== 'undefined' && (window as any).markInboxConversationAsRead) {
      (window as any).markInboxConversationAsRead(messageModal.conversationId);
    }
    
    const user = inboxModal.currentUser;
    messageModal.onClose();
    inboxModal.onOpen(user);
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: Record<string, Message[]> = {};
    msgs
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .forEach((m) => {
        const key = new Date(m.createdAt).toDateString();
        (groups[key] ||= []).push(m);
      });
    return groups;
  };

  const isEndOfSenderRun = (arr: Message[], idx: number) =>
    idx === arr.length - 1 || arr[idx].senderId !== arr[idx + 1].senderId;

  const renderDateSeparator = (dateKey: string) => {
    const d = new Date(dateKey);
    const now = new Date();
    const formatted = d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      ...(now.getFullYear() !== d.getFullYear() ? { year: 'numeric' } : {}),
    });

    return (
      <div className="relative flex items-center my-5">
        <div className="flex-grow border-t border-stone-100 dark:border-stone-800" />
        <span className="mx-3 text-stone-400 dark:text-stone-500 font-medium text-[10px] px-2.5 py-0.5 rounded-full bg-stone-50 dark:bg-stone-900">
          {formatted}
        </span>
        <div className="flex-grow border-t border-stone-100 dark:border-stone-800" />
      </div>
    );
  };

  const avatarColor = getAvatarColor(otherUser?.name);

  const bodyContent = (
    <div className="flex flex-col h-[500px] relative">
      {/* Back button */}
      <button
        onClick={handleBackToInbox}
        className="absolute left-4 top-5 p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 transition-colors z-20"
        aria-label="Back to Inbox"
      >
        <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-300" />
      </button>

      {/* Clean Header with user info */}
      <div className="flex items-center justify-center py-4 px-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-sm
                         ${!otherUser?.image ? avatarColor : 'bg-stone-100 dark:bg-stone-800'}`}
            >
              {otherUser?.image ? (
                <Image
                  src={otherUser.image}
                  alt={otherUser.name || 'User'}
                  width={44}
                  height={44}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.currentTarget.parentElement;
                    if (target) {
                      target.className = `w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-sm ${avatarColor}`;
                      target.textContent = '';
                      const span = document.createElement('span');
                      span.textContent = initials(otherUser?.name);
                      target.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span>{initials(otherUser?.name)}</span>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm tracking-tight">
              {otherUser?.name || 'Loading...'}
            </h3>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-[bounce_1s_ease-in-out_infinite]" />
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-[bounce_1s_ease-in-out_0.15s_infinite]" />
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-[bounce_1s_ease-in-out_0.3s_infinite]" />
          </div>
        </div>
      ) : (
        <>
          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto px-4 py-3 space-y-3">
            {Object.entries(groupMessagesByDate(messages)).map(([dateKey, dateMessages]) => (
              <React.Fragment key={dateKey}>
                {renderDateSeparator(dateKey)}
                {dateMessages.map((message, idx) => {
                  const isOther = message.senderId === messageModal.otherUserId;
                  const showTime = isEndOfSenderRun(dateMessages, idx);
                  return (
                    <div key={message.id} className="w-full">
                      <div className={`w-full flex ${isOther ? 'justify-start' : 'justify-end'}`}>
                        <div className={`relative w-full flex ${isOther ? 'flex-row' : 'flex-row-reverse'} items-end gap-2 max-w-[80%]`}>
                          {/* Message Bubble */}
                          <div
                            className={`inline-block w-auto max-w-full rounded-xl px-3.5 py-2.5 ${
                              isOther ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-white'
                            } ${!isOther && showTime ? 'rounded-br-sm' : ''} ${isOther && showTime ? 'rounded-bl-sm' : ''}`}
                            style={!isOther ? { background: '#1c1917' } : undefined}
                          >
                            <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>

                      {showTime && (
                        <div className={`mt-1 flex ${isOther ? 'justify-start' : 'justify-end'} ${isOther ? 'ml-2' : 'mr-2'}`}>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 dark:text-stone-500">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 ml-2 mt-1">
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Message Input */}
          <div className="p-3.5 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div
                className="flex-1 relative border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(to right, rgb(245 245 245) 0%, rgb(241 241 241) 100%)' }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => { setNewMessage(e.target.value); emitTyping(); }}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full pl-4 pr-12 py-2.5 text-[14px] bg-transparent border-none outline-none
                             text-stone-900 dark:text-stone-100 placeholder-stone-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl
                             flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                  style={{ background: newMessage.trim() ? '#1c1917' : 'rgb(229 229 229)' }}
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={messageModal.isOpen}
      onClose={messageModal.onClose}
      onSubmit={() => {}}
      title=""
      body={bodyContent}
      className="md:w-[480px]"
    />
  );
};

export default MessageModal;
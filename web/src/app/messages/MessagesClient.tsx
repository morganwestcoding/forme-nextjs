'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeUser, SafeConversation, SafeMessage } from '@/app/types';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';

const initials = (name?: string | null) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U';
};

const getAvatarColor = (name?: string | null) => {
  if (!name) return 'bg-gray-500';
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
  ];
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const formatRelativeTime = (dateString: string) => {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diff < 1) return 'now';
  if (diff < 60) return `${diff}m`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d`;
  return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Avatar: React.FC<{ src?: string | null; name?: string | null; size?: number }> = ({ src, name, size = 44 }) => {
  const color = getAvatarColor(name);
  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center text-white font-semibold shrink-0 ${!src ? color : 'bg-gray-100'}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={name || 'User'} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>{initials(name)}</span>
      )}
    </div>
  );
};

interface Props {
  currentUser: SafeUser;
}

export default function MessagesClient({ currentUser }: Props) {
  const [conversations, setConversations] = useState<SafeConversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SafeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConvo = conversations.find(c => c.id === activeConvoId);

  // Fetch conversations
  useEffect(() => {
    axios.get('/api/conversations')
      .then(res => setConversations(res.data))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!activeConvoId) return;
    axios.get(`/api/messages/${activeConvoId}`)
      .then(res => setMessages(res.data))
      .catch(() => toast.error('Failed to load messages'));

    // Mark as read
    axios.post('/api/messages/read', { conversationId: activeConvoId }).catch(() => {});
  }, [activeConvoId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !activeConvoId || sendingMessage) return;
    setSendingMessage(true);
    try {
      const res = await axios.post(`/api/messages/${activeConvoId}`, { content: newMessage.trim() });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      // Update last message in conversation list
      setConversations(prev => prev.map(c =>
        c.id === activeConvoId
          ? { ...c, lastMessage: { content: newMessage.trim(), createdAt: new Date().toISOString(), isRead: true }, lastMessageAt: new Date().toISOString() }
          : c
      ));
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }, [newMessage, activeConvoId, sendingMessage]);

  const filteredConversations = searchQuery.trim()
    ? conversations.filter(c => c.otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; messages: SafeMessage[] }[]>((groups, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    const last = groups[groups.length - 1];
    if (last?.date === date) {
      last.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
    return groups;
  }, []);

  return (
    <Container>
      <PageHeader currentUser={currentUser} currentPage="Messages" />
      <div className="mt-8">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-6">Messages</h1>

        <div className="flex border border-stone-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900" style={{ height: 'calc(100vh - 220px)' }}>
          {/* Sidebar — conversation list */}
          <div className={`${activeConvoId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[340px] border-r border-stone-200 dark:border-zinc-700`}>
            {/* Search */}
            <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-[14px] text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-stone-300 transition-all"
              />
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                  <p className="text-[14px] font-medium text-stone-700 mb-1">No conversations yet</p>
                  <p className="text-[13px] text-stone-400">Start a conversation from a user's profile</p>
                </div>
              ) : (
                filteredConversations.map(convo => {
                  const isActive = convo.id === activeConvoId;
                  const hasUnread = convo.lastMessage && !convo.lastMessage.isRead;
                  return (
                    <button
                      key={convo.id}
                      onClick={() => setActiveConvoId(convo.id)}
                      className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                        isActive ? 'bg-stone-100 dark:bg-zinc-800' : 'hover:bg-stone-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <Avatar src={convo.otherUser.image} name={convo.otherUser.name} size={44} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-[14px] truncate ${hasUnread ? 'font-semibold text-stone-900' : 'font-medium text-stone-700'}`}>
                            {convo.otherUser.name}
                          </span>
                          {convo.lastMessage?.createdAt && (
                            <span className="text-[11px] text-stone-400 shrink-0">{formatRelativeTime(convo.lastMessage.createdAt)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className={`text-[13px] truncate ${hasUnread ? 'text-stone-600' : 'text-stone-400'}`}>
                            {convo.lastMessage?.content || <span className="italic">Say hello...</span>}
                          </p>
                          {hasUnread && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Main — message thread */}
          <div className={`${activeConvoId ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
            {activeConvo ? (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 p-4 border-b border-stone-100 dark:border-zinc-800">
                  <button
                    onClick={() => setActiveConvoId(null)}
                    className="md:hidden text-stone-500 hover:text-stone-700 mr-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <Avatar src={activeConvo.otherUser.image} name={activeConvo.otherUser.name} size={36} />
                  <div>
                    <h3 className="text-[14px] font-semibold text-stone-900 dark:text-white">{activeConvo.otherUser.name}</h3>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {groupedMessages.map(group => (
                    <div key={group.date}>
                      <div className="flex justify-center my-4">
                        <span className="text-[11px] text-stone-400 bg-stone-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{group.date}</span>
                      </div>
                      {group.messages.map(msg => {
                        const isOwn = msg.senderId === currentUser.id;
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                              isOwn
                                ? 'bg-stone-900 text-white rounded-br-md'
                                : 'bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-white rounded-bl-md'
                            }`}>
                              {msg.content}
                              <div className={`text-[10px] mt-1 ${isOwn ? 'text-stone-400' : 'text-stone-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-stone-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      className="flex-1 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-[14px] text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-stone-300 transition-all"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-5 py-3 bg-stone-900 text-white rounded-xl text-[14px] font-medium hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </div>
                <p className="text-[15px] font-medium text-stone-700 mb-1">Select a conversation</p>
                <p className="text-[13px] text-stone-400 max-w-xs">Choose a conversation from the sidebar to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

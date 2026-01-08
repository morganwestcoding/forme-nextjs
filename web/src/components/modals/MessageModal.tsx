// components/modals/MessageModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';
import useMessageModal from '@/app/hooks/useMessageModal';
import useInboxModal from '@/app/hooks/useInboxModal';
import Modal from './Modal';

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

  useEffect(() => {
    if (messageModal.isOpen && messageModal.conversationId) {
      console.log('MessageModal opened with:', {
        conversationId: messageModal.conversationId,
        otherUserId: messageModal.otherUserId,
        otherUserData: messageModal.otherUserData
      });

      // If we have user data from the modal, use it immediately
      if (messageModal.otherUserData) {
        setOtherUser(messageModal.otherUserData);
      }

      fetchMessages();
      fetchOtherUser();
    }
  }, [messageModal.isOpen, messageModal.conversationId, messageModal.otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update otherUser when messages load if we don't have user info yet
  useEffect(() => {
    if (messages.length > 0 && !otherUser && messageModal.otherUserId) {
      console.log('Trying to get user from messages, otherUserId:', messageModal.otherUserId);
      const otherUserMessage = messages.find((msg: Message) => msg.senderId === messageModal.otherUserId);
      console.log('Found message from other user:', otherUserMessage);
      if (otherUserMessage) {
        console.log('Setting otherUser from message:', otherUserMessage.sender);
        setOtherUser({
          name: otherUserMessage.sender.name,
          image: otherUserMessage.sender.image
        });
      }
    }
  }, [messages, otherUser, messageModal.otherUserId]);

  const fetchMessages = async () => {
    if (!messageModal.conversationId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/messages/${messageModal.conversationId}`);
      const messagesData = response.data;
      setMessages(messagesData);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOtherUser = async () => {
    if (!messageModal.otherUserId) {
      console.log('No otherUserId available');
      return;
    }
    console.log('Fetching user info for:', messageModal.otherUserId);
    try {
      const response = await axios.get(`/api/users/${messageModal.otherUserId}`);
      console.log('User data received:', response.data);
      setOtherUser({
        name: response.data.name,
        image: response.data.image || response.data.imageSrc
      });
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !messageModal.conversationId) return;
    try {
      const response = await axios.post(`/api/messages/${messageModal.conversationId}`, {
        content: newMessage,
      });
      setMessages((prev) => [...prev, response.data]);
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
        <div className="flex-grow border-t border-gray-100" />
        <span className="mx-3 text-gray-400 font-medium text-[10px] px-2.5 py-0.5 rounded-md bg-gray-50">
          {formatted}
        </span>
        <div className="flex-grow border-t border-gray-100" />
      </div>
    );
  };

  const avatarColor = getAvatarColor(otherUser?.name);

  const bodyContent = (
    <div className="flex flex-col h-[500px] relative">
      {/* Back button */}
      <button
        onClick={handleBackToInbox}
        className="absolute left-4 top-5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-20"
        aria-label="Back to Inbox"
      >
        <ArrowLeft className="w-4 h-4 text-gray-600" />
      </button>

      {/* Clean Header with user info */}
      <div className="flex items-center justify-center py-4 px-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-sm
                         ${!otherUser?.image ? avatarColor : 'bg-gray-100'}`}
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
                      target.innerHTML = `<span>${initials(otherUser?.name)}</span>`;
                    }
                  }}
                />
              ) : (
                <span>{initials(otherUser?.name)}</span>
              )}
            </div>
            {/* Online status */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>

          {/* Name */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm tracking-tight">
              {otherUser?.name || 'Loading...'}
            </h3>
            <p className="text-[10px] text-gray-500 font-medium">Active now</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-gray-500">Loading messages...</p>
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
                          {/* Avatar - only show for other user and at end of message runs */}
                          {isOther && showTime && (
                            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5">
                              <div
                                className={`w-full h-full flex items-center justify-center text-white font-semibold text-[10px]
                                           ${!message.sender.image ? getAvatarColor(message.sender.name) : 'bg-gray-100'}`}
                              >
                                {message.sender.image ? (
                                  <Image
                                    src={message.sender.image}
                                    alt={message.sender.name || 'User'}
                                    width={28}
                                    height={28}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <span>{initials(message.sender.name)}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`inline-block w-auto max-w-full rounded-xl px-3.5 py-2.5 ${
                              isOther
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-blue-500 text-white'
                            } ${!isOther && showTime ? 'rounded-br-sm' : ''} ${isOther && showTime ? 'rounded-bl-sm' : ''}`}
                          >
                            <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>

                      {showTime && (
                        <div className={`mt-1 flex ${isOther ? 'justify-start' : 'justify-end'} ${isOther ? 'ml-10' : 'mr-2'}`}>
                          <span className="text-[11px] text-gray-500">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Message Input */}
          <div className="p-3.5 border-t border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2.5 pr-11 text-sm text-gray-700 placeholder-gray-400 bg-gray-50
                           border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent focus:bg-white transition-all duration-200"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`absolute right-1.5 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-lg
                            flex items-center justify-center transition-all duration-200 ${
                            newMessage.trim()
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
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
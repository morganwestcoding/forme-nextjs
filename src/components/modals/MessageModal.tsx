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
      fetchMessages();
    }
  }, [messageModal.isOpen, messageModal.conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!messageModal.conversationId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/messages/${messageModal.conversationId}`);
      const messagesData = response.data;
      setMessages(messagesData);
      
      // Find the other user's info from the messages
      const otherUserMessage = messagesData.find((msg: Message) => msg.senderId === messageModal.otherUserId);
      if (otherUserMessage) {
        setOtherUser({
          name: otherUserMessage.sender.name,
          image: otherUserMessage.sender.image
        });
      }
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
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
      <div className="relative flex items-center my-6">
        <div className="flex-grow border-t border-gray-200" />
        <span className="mx-4 bg-gray-50 text-gray-600 font-medium text-xs px-3 py-1 rounded-full">
          {formatted}
        </span>
        <div className="flex-grow border-t border-gray-200" />
      </div>
    );
  };

  const avatarColor = getAvatarColor(otherUser?.name);

  const bodyContent = (
    <div className="flex flex-col h-[500px]  relative">
      {/* Back button positioned outside the content flow */}
      <button
        onClick={handleBackToInbox}
        className="absolute -left-3 -top-2.5 p-1 rounded-full hover:bg-gray-200/50 transition-colors z-20"
        aria-label="Back to Inbox"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* Custom Header with user info */}
      <div className="flex items-center justify-center p-4  border-b border-gray-200">
        {/* User Avatar and Name - Centered */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-medium text-sm
                         ${!otherUser?.image ? avatarColor : 'bg-gray-100'}`}
            >
              {otherUser?.image ? (
                <Image
                  src={otherUser.image}
                  alt={otherUser.name || 'User'}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.currentTarget.parentElement;
                    if (target) {
                      target.className = `w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-medium text-sm ${avatarColor}`;
                      target.innerHTML = `<span>${initials(otherUser?.name)}</span>`;
                    }
                  }}
                />
              ) : (
                <span>{initials(otherUser?.name)}</span>
              )}
            </div>
            {/* Online status */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {otherUser?.name || 'Loading...'}
            </h3>
            <p className="text-xs text-green-600 font-medium">Online</p>
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
          <div className="flex-grow overflow-y-auto px-4 py-4 space-y-4">
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
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mb-1">
                              <div
                                className={`w-full h-full flex items-center justify-center text-white font-medium text-xs
                                           ${!message.sender.image ? getAvatarColor(message.sender.name) : 'bg-gray-100'}`}
                              >
                                {message.sender.image ? (
                                  <Image
                                    src={message.sender.image}
                                    alt={message.sender.name || 'User'}
                                    width={32}
                                    height={32}
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
                            className={`inline-block w-auto max-w-full rounded-2xl px-4 py-3 shadow-sm ${
                              isOther
                                ? 'bg-white text-gray-800 border border-gray-200'
                                : 'bg-blue-500 text-white'
                            } ${!isOther && showTime ? 'rounded-br-md' : ''} ${isOther && showTime ? 'rounded-bl-md' : ''}`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
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
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 pr-12 text-sm text-gray-700 placeholder-gray-400 bg-white 
                           border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-all duration-200"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full
                            flex items-center justify-center transition-all duration-200 ${
                            newMessage.trim() 
                              ? 'bg-[#60A5FA] hover:bg-blue-500 text-white shadow-md hover:shadow-lg' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
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
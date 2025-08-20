// components/modals/MessageModal.tsx
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useMessageModal from '@/app/hooks/useMessageModal';
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

const MessageModal: React.FC = () => {
  const messageModal = useMessageModal();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageModal.isOpen && messageModal.conversationId) {
      fetchMessages();
    }
  }, [messageModal.isOpen, messageModal.conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!messageModal.conversationId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/messages/${messageModal.conversationId}`);
      setMessages(response.data);
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
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setTimeout(scrollToBottom, 0);
    } catch (error) {
      toast.error('Failed to send message');
    }
  }, [newMessage, messageModal.conversationId]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Group messages by calendar date (normalized)
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: Record<string, Message[]> = {};
    msgs
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .forEach(m => {
        const key = new Date(m.createdAt).toDateString();
        (groups[key] ||= []).push(m);
      });
    return groups;
  };

  // Sleek date divider; "Aug 19" for this year, "Aug 19, 2023" otherwise
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
        <div className="flex-grow border-t border-neutral-300/40" />
        <span className="mx-4 bg-white/90 text-neutral-700 font-medium text-xs px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
          {formatted}
        </span>
        <div className="flex-grow border-t border-neutral-300/40" />
      </div>
    );
  };

  const bodyContent = (
    <div className="flex flex-col h-[450px]">
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-neutral-400">Loading messages...</p>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto mb-4 px-4 custom-scrollbar">
            <div className="space-y-4 flex flex-col">
              {Object.entries(groupMessagesByDate(messages)).map(([dateKey, dateMessages]) => (
                <React.Fragment key={dateKey}>
                  {renderDateSeparator(dateKey)}
                  {dateMessages.map((message, idx) => {
                    const isOther = message.senderId === messageModal.otherUserId;
                    // show timestamp only on the last message of this day
                    const showTime = idx === dateMessages.length - 1;

                    return (
                      <div key={message.id} className="w-full">
                        <div className={`w-full flex ${isOther ? 'justify-start' : 'justify-end'}`}>
                          {/* IMPORTANT: make the inner row full width so max-w percentages
                             are calculated against the whole row, not content size */}
                          <div
                            className={`relative w-full flex ${
                              isOther ? 'flex-row' : 'flex-row-reverse'
                            } items-start gap-2`}
                          >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                              <Image
                                src={message.sender.image || '/placeholder-avatar.png'}
                                alt={message.sender.name || 'User'}
                                width={36}
                                height={36}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* Bubble: single line until ~70% width, then wrap */}
                            <div
                              className={`inline-block w-auto max-w-[70%] rounded-2xl px-4 py-3 shadow-sm border ${
                                isOther
                                  ? 'bg-white/10 text-white border-white/20'
                                  : 'bg-[#3B82F6] text-white border-transparent'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>

                        {showTime && (
                          <div className="mt-1 px-12 flex justify-end">
                            <span className="text-[11px] text-neutral-500">
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="flex items-center p-3 border-t border-white/10">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-grow px-3 py-3.5 text-sm text-neutral-600 placeholder-neutral-400 bg-white rounded-xl focus:outline-none border border-white/20"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-500 hover:bg-blue-600 transition w-10 h-10 flex items-center justify-center rounded-full shadow-md"
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
              >
                <path d="M11.9 4.8c4.8-1.6 7.2-2.4 8.5-1.1s.6 3.6-1.1 8.5l-1.1 3.3c-1.2 3.7-1.8 5.6-2.8 5.7-.3.1-.6.1-.9 0-1-.3-1.6-2.3-2.7-6.2-.2-.9-.3-1.3-.6-1.6-.1-.1-.2-.2-.3-.3-.3-.3-.7-.4-1.6-.6-3.9-1.1-5.8-1.6-6.2-2.7-.1-.3-.1-.6 0-.9.2-1 2.1-1.6 5.7-2.8l3.2-1.1z" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={messageModal.isOpen}
      onClose={messageModal.onClose}
      onSubmit={sendMessage}
      title="Messages"
      body={bodyContent}
    />
  );
};

export default MessageModal;

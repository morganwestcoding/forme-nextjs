// components/modals/MessageModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
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

const MessageModal: React.FC = () => {
  const messageModal = useMessageModal();
  const inboxModal = useInboxModal(); // ✅ no argument

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    } catch {
      toast.error('Failed to send message');
    }
  }, [newMessage, messageModal.conversationId]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  // ✅ Back to Inbox using the preserved user
  const handleBackToInbox = () => {
    const user = inboxModal.currentUser; // may be null if never set
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
        <div className="flex-grow border-t border-neutral-300/40" />
        <span className="mx-4 bg-white/90 text-neutral-700 font-medium text-xs px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
          {formatted}
        </span>
        <div className="flex-grow border-t border-neutral-300/40" />
      </div>
    );
  };

  const bodyContent = (
    <div className="flex flex-col h-[450px] relative">
      {/* Back to Inbox button next to the X (your X is right-4; this is right-12) */}
      <button
        onClick={handleBackToInbox}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label="Back to Inbox"
        title="Back to Inbox"
        className="absolute top-4 right-12 p-1 rounded-full hover:bg-neutral-100 transition z-20"
      >
        {/* Your SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
          <path d="M11 6H15.5C17.9853 6 20 8.01472 20 10.5C20 12.9853 17.9853 15 15.5 15H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.99998 12C6.99998 12 4.00001 14.2095 4 15C3.99999 15.7906 7 18 7 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

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
                    const showTime = isEndOfSenderRun(dateMessages, idx);

                    return (
                      <div key={message.id} className="w-full">
                        <div className={`w-full flex ${isOther ? 'justify-start' : 'justify-end'}`}>
                          <div className={`relative w-full flex ${isOther ? 'flex-row' : 'flex-row-reverse'} items-start gap-2`}>
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

                            {/* Bubble */}
                            <div
                              className={`inline-block w-auto max-w-[70%] rounded-2xl px-4 py-3 shadow-sm border ${
                                isOther
                                  ? 'bg-white text-neutral-800 border-neutral-200'
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
                          <div className={`mt-1 px-12 flex ${isOther ? 'justify-start' : 'justify-end'}`}>
                            <span className="text-[11px] text-neutral-500">
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-grow px-3 py-3.5 text-sm text-neutral-600 placeholder-neutral-400 bg-white rounded-xl focus:outline-none border border-white/20"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-500 hover:bg-blue-600 transition w-10 h-10 flex items-center justify-center rounded-full shadow-md"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="1.5">
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

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    messages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  const renderDateSeparator = (date: string) => (
    <div className="flex justify-center my-4">
      <span className="bg-white/10 text-neutral-300 text-xs px-3 py-1 rounded-lg shadow">
        {date}
      </span>
    </div>
  );

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
              {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                <React.Fragment key={date}>
                  {renderDateSeparator(date)}
                  {dateMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === messageModal.otherUserId
                          ? 'justify-start'
                          : 'justify-end'
                      }`}
                    >
                      <div className={`flex items-start ${
                        message.senderId === messageModal.otherUserId
                          ? 'flex-row'
                          : 'flex-row-reverse'
                      }`}>
                        <div className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ${
                          message.senderId === messageModal.otherUserId ? 'mr-2' : 'ml-2'
                        }`}>
                          <Image
                            src={message.sender.image || '/placeholder-avatar.png'}
                            alt={message.sender.name || 'User'}
                            width={36}
                            height={36}
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className={`flex flex-col ${
                          message.senderId === messageModal.otherUserId ? 'items-start' : 'items-end'
                        }`}>
                          <div
                            className={`max-w-[70%] px-3 py-2 rounded-2xl shadow-sm text-sm ${
                              message.senderId === messageModal.otherUserId
                                ? 'bg-white/10 text-white'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            <p>{message.content}</p>
                          </div>
                          <p className="text-xs mt-1 text-neutral-400">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
      
          <div className="flex items-center p-3 border-t border-white/10">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-grow px-3 py-2 text-sm text-white bg-white/10 backdrop-blur-md rounded-2xl focus:outline-none border border-white/20"
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-500 hover:bg-blue-600 transition w-10 h-10 flex items-center justify-center rounded-full shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M11.9 4.8c4.8-1.6 7.2-2.4 8.5-1.1s.6 3.6-1.1 8.5l-1.1 3.3c-1.2 3.7-1.8 5.6-2.8 5.7-.3.1-.6.1-.9 0-1-.3-1.6-2.3-2.7-6.2-.2-.9-.3-1.3-.6-1.6-.1-.1-.2-.2-.3-.3-.3-.3-.7-.4-1.6-.6-3.9-1.1-5.8-1.6-6.2-2.7-.1-.3-.1-.6 0-.9.2-1 2.1-1.6 5.7-2.8l3.2-1.1z"/>
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

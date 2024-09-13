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
    } catch (error) {
      console.error('Error fetching messages:', error);
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error sending message:', error.response?.data);
        toast.error(error.response?.data?.error || 'Failed to send message');
      } else {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      }
    }
  }, [newMessage, messageModal.conversationId]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const bodyContent = (
    <div className="flex flex-col h-[475px]">
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <p>Loading messages...</p>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto mb-4 p-4 flex flex-col-reverse">
            <div className="space-y-4 flex flex-col-reverse">
              {[...messages].reverse().map((message) => (
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
                    <div className={`w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ${
                      message.senderId === messageModal.otherUserId ? 'mr-2' : 'ml-2'
                    }`}>
                      <Image
                        src={message.sender.image || '/placeholder-avatar.png'}
                        alt={message.sender.name || 'User'}
                        width={46}
                        height={46}
                      />
                    </div>
                    <div className={`flex flex-col ${
                      message.senderId === messageModal.otherUserId ? 'items-start' : 'items-end'
                    }`}>
                      <div
                        className={`max-w-[100%] p-3 rounded-lg ${
                          message.senderId === messageModal.otherUserId
                            ? 'bg-gray-500 text-white text-sm'
                            : 'bg-blue-500 text-white text-sm'
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                      <p className={`text-xs mt-1 text-gray-400 ${
                        message.senderId === messageModal.otherUserId ? 'self-start' : 'self-end'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
      
          <div className="flex items-center p-4 -mb-8">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-grow p-3 text-sm text-[#a2a2a2] mr-2 bg-white rounded-lg focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-white bg-opacity-25 border border-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 ml-1"
            >
              <div className='-ml-0.5'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="#ffffff" fill="none">
                  <path d="M11.922 4.79004C16.6963 3.16245 19.0834 2.34866 20.3674 3.63261C21.6513 4.91656 20.8375 7.30371 19.21 12.078L18.1016 15.3292C16.8517 18.9958 16.2267 20.8291 15.1964 20.9808C14.9195 21.0216 14.6328 20.9971 14.3587 20.9091C13.3395 20.5819 12.8007 18.6489 11.7231 14.783C11.4841 13.9255 11.3646 13.4967 11.0924 13.1692C11.0134 13.0742 10.9258 12.9866 10.8308 12.9076C10.5033 12.6354 10.0745 12.5159 9.21705 12.2769C5.35111 11.1993 3.41814 10.6605 3.0909 9.64127C3.00292 9.36724 2.97837 9.08053 3.01916 8.80355C3.17088 7.77332 5.00419 7.14834 8.6708 5.89838L11.922 4.79004Z" stroke="currentColor" stroke-width="1.5" />
                </svg>
              </div>
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
      title="Message"
      body={bodyContent}
    />
  );
};

export default MessageModal;
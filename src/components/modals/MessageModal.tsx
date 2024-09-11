'use client';
import React, { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    if (messageModal.isOpen && messageModal.conversationId) {
      fetchMessages();
    }
  }, [messageModal.isOpen, messageModal.conversationId]);

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
    <div className="flex flex-col h-full">
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <p>Loading messages...</p>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.senderId === messageModal.otherUserId
                    ? 'bg-gray-200 self-start'
                    : 'bg-blue-500 text-white self-end'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-2 border rounded-lg"
            />
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
      title="Chat"
      body={bodyContent}
      actionLabel="Send"
    />
  );
};

export default MessageModal;
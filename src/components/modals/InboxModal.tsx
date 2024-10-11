'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeUser, SafeConversation } from "@/app/types";
import useMessageModal from "@/app/hooks/useMessageModal";
import Modal from '../modals/Modal';
import UserSearch from '../UserSearch';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SafeUser | null;
}

const InboxModal: React.FC<InboxModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [conversations, setConversations] = useState<SafeConversation[]>([]);
  const messageModal = useMessageModal();

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchConversations();
    }
  }, [isOpen, currentUser]);

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
      await axios.post('/api/messages/read', { conversationId });
      messageModal.onOpen(conversationId, otherUserId);
      onClose();
    } catch (error) {
      console.error('Error updating message read status:', error);
      toast.error('Failed to update message status');
    }
  };

  const startNewConversation = async (user: SafeUser) => {
    try {
      const response = await axios.post('/api/conversations', { userId: user.id });
      const newConversation = response.data;
      openConversation(newConversation.id, user.id);
    } catch (error) {
      console.error('Error starting new conversation:', error);
      toast.error('Failed to start new conversation');
    }
  };

  const bodyContent = (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <UserSearch onResultClick={startNewConversation} />
      </div>
      <div className="flex-grow overflow-y-auto space-y-4 mb-4">
        {conversations.map((conversation) => (
          <div 
            key={conversation.id}
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded"
            onClick={() => openConversation(conversation.id, conversation.otherUser.id)}
          >
            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
              <div className="w-full h-full relative">
                <Image
                  src={conversation.otherUser.image || '/placeholder-avatar.png'}
                  alt={conversation.otherUser.name || 'User'}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{conversation.otherUser.name}</h3>
              <p className="text-sm text-gray-400 truncate max-w-[200px]">{conversation.lastMessage?.content}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 flex-shrink-0">
                {conversation.lastMessage?.createdAt && new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {conversation.lastMessage && (
                <span className={`text-xs ${conversation.lastMessage.isRead ? 'text-green-500' : 'text-red-500'}`}>
                  {conversation.lastMessage.isRead ? 'Read' : 'Unread'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => {}}
      title="Inbox"
      body={bodyContent}
    />
  );
};

export default InboxModal;
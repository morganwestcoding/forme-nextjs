// src/components/header/InboxModal.tsx

'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeUser, SafeConversation } from "@/app/types";
import useMessageModal from "@/app/hooks/useMessageModal";
import Modal from '../modals/Modal';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SafeUser | null;
}

const InboxModal: React.FC<InboxModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [conversations, setConversations] = useState<SafeConversation[]>([]);
  const [newUserName, setNewUserName] = useState('');
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

  const openConversation = (conversationId: string, otherUserId: string) => {
    messageModal.onOpen(conversationId, otherUserId);
    onClose();
  };

  const startNewConversation = async () => {
    try {
      const response = await axios.post('/api/conversations', { userName: newUserName });
      const newConversation = response.data;
      openConversation(newConversation.id, newConversation.otherUser.id);
      setNewUserName('');
    } catch (error) {
      console.error('Error starting new conversation:', error);
      toast.error('Failed to start new conversation');
    }
  };

  const bodyContent = (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto space-y-4 mb-4">
        {conversations.map((conversation) => (
            <div 
  key={conversation.id}
  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
  onClick={() => openConversation(conversation.id, conversation.otherUser.id)}
>
  <Image
    src={conversation.otherUser.image || '/placeholder-avatar.png'}
    alt={conversation.otherUser.name || 'User'}
    width={40}
    height={40}
    className="rounded-full"
  />
  <div className="flex-1 min-w-0"> {/* Add min-w-0 to allow text truncation */}
    <h3 className="font-semibold text-white truncate">{conversation.otherUser.name}</h3>
    <p className="text-sm text-gray-400 truncate max-w-[200px]">{conversation.lastMessage?.content}</p>
  </div>
  <span className="text-xs text-gray-400 flex-shrink-0"> {/* Add flex-shrink-0 to prevent time from shrinking */}
    {conversation.lastMessage?.createdAt && new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </span>
</div>
        ))}
      </div>
      <div className="mt-4 flex items-center">
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="Enter user name..."
          className="flex-1 p-2 border rounded-l-lg bg-transparent text-white"
        />
        <button
          onClick={startNewConversation}
          className="bg-blue-500 text-white p-2 rounded-r-lg"
        >
          Start Chat
        </button>
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
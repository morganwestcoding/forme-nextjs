// components/modals/InboxModal.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeUser, SafeConversation } from "@/app/types";
import useMessageModal from "@/app/hooks/useMessageModal";
import Modal from './Modal';

import useInboxModal from '@/app/hooks/useInboxModal';
import getCurrentUser from '@/app/actions/getCurrentUser';

const InboxModal = () => {
  const [conversations, setConversations] = useState<SafeConversation[]>([]);
  const messageModal = useMessageModal();
  const inboxModal = useInboxModal();
  const currentUser = inboxModal.currentUser;

  useEffect(() => {
    if (inboxModal.isOpen && currentUser) {
      fetchConversations();
    }
  }, [inboxModal.isOpen, currentUser]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/conversations');
      console.log('Conversations response:', response.data); // Add this for debugging
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
      inboxModal.onClose();
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

  const styles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
    }
  `;

  const bodyContent = (
    <div className="flex flex-col h-[550px] pb-2">
      <div className="mb-4 mt-8">

      </div>
      <div className="h-full overflow-y-auto space-y-4 custom-scrollbar pr-2">
        {conversations.map((conversation) => (
          <div 
            key={conversation.id}
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded transition duration-200"
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
              <h3 className="font-semibold text-black truncate">
                {conversation.otherUser.name}
              </h3>
              <p className="text-sm text-neutral-500 font-light truncate max-w-[200px]">
                {conversation.lastMessage?.content}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className="text-xs text-gray-400 flex-shrink-0">
                {conversation.lastMessage?.createdAt && 
                  new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                }
              </span>
              {conversation.lastMessage && (
                <span 
                  className={`
                    text-xs px-3 py-1 rounded-lg
                    ${conversation.lastMessage.isRead 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-blue-500 text-white'
                    }
                  `}
                >
                  {conversation.lastMessage.isRead ? 'Read' : 'New'}
                </span>
              )}
            </div>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="text-center text-gray-400 mt-4">
            No conversations yet. Start a new one by searching for users above.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <Modal
        isOpen={inboxModal.isOpen}
        onClose={inboxModal.onClose}
        onSubmit={() => {}}
        title="Inbox"
        body={bodyContent}
        className="md:w-[500px]"
      />
    </>
  );
};

export default InboxModal;
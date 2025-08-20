// src/components/CreateChatButton.tsx

'use client'
import useMessageModal from "@/app/hooks/useMessageModal";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeUser } from "@/app/types";

interface CreateChatButtonProps {
  currentUser: SafeUser | null;
  otherUserId: string;
}

const CreateChatButton: React.FC<CreateChatButtonProps> = ({
  currentUser,
  otherUserId
}) => {
  const router = useRouter();
  const messageModal = useMessageModal();

  const onCreateChat = useCallback(async () => {
    if (!currentUser) {
      toast.error('You must be logged in to start a chat');
      return;
    }

    try {
      const response = await axios.post('/api/conversations', { userId: otherUserId });
      const conversationId = response.data.id;
      messageModal.onOpen(conversationId, otherUserId);  
      toast.success('Chat started successfully');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  }, [messageModal, otherUserId, currentUser]);

  return (
    <button 
      onClick={onCreateChat}
      className="group inline-flex items-center justify-center px-24 py-3 rounded-xl text-sm font-medium text-white shadow-sm hover:shadow-md transition-all duration-200 border border-[#60A5FA] hover:bg-blue-600" 
      style={{ backgroundColor: '#60A5FA' }}
    >

      <span>Message</span>
    </button>
  )
}

export default CreateChatButton;

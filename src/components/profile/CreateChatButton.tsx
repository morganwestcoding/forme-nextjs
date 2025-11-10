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
      className="bg-white/15 backdrop-blur-sm hover:bg-blue-400/10 border border-white/40 hover:border-blue-400/60 text-white hover:text-[#60A5FA] py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center hover:shadow-sm"
      type="button"
      aria-label="Send Message"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" className="transition-colors duration-200" fill="none" stroke="currentColor">
        <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export default CreateChatButton;

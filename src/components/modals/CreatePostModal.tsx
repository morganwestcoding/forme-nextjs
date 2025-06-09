'use client';

import { useState, useMemo, useCallback } from 'react';
import Modal from '@/components/modals/Modal';
import Heading from '@/components/Heading';
import CategoryInput from '@/components/inputs/CategoryInput';
import { toast } from 'react-hot-toast';
import useCreatePostModal from '@/app/hooks/useCreatePostModal';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import PostCategoryModal from '@/components/modals/PostCategoryModal';

// currentUser will be fetched inside instead of passed as prop

enum STEPS {
  TYPE = 0,
  CONTENT = 1,
}

const postTypes = [
  {
    label: 'Reel',
    color: 'bg-[#60A5FA]',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
        <path d="M2.50012 7.5H21.5001" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M17.0001 2.5L14.0001 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10.0001 2.5L7.00012 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14.9531 14.8948C14.8016 15.5215 14.0857 15.9644 12.6539 16.8502C11.2697 17.7064 10.5777 18.1346 10.0199 17.9625C9.78934 17.8913 9.57925 17.7562 9.40982 17.57C9 17.1198 9 16.2465 9 14.5C9 12.7535 9 11.8802 9.40982 11.4299C9.57925 11.2438 9.78934 11.1087 10.0199 11.0375C10.5777 10.8654 11.2697 11.2936 12.6539 12.1498C14.0857 13.0356 14.8016 13.4785 14.9531 14.1052C15.0156 14.3639 15.0156 14.6361 14.9531 14.8948Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: 'Text Post',
    color: 'bg-[#10B981]',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
        <path d="M20 18V6M6 20H18M18 4H6M4 6V18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.99901 10C7.70512 8.43128 8.73403 8.05948 11.9564 8M11.9564 8C14.9534 8.06735 16.1887 8.30534 15.9138 10M11.9564 8V16M10.4724 16H13.4405" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 2H19C18.4477 2 18 2.44772 18 3V5C18 5.55228 18.4477 6 19 6H21C21.5523 6 22 5.55228 22 5V3C22 2.44772 21.5523 2 21 2Z" stroke="#000000" strokeWidth="1.5" />
        <path d="M5 2H3C2.44772 2 2 2.44772 2 3V5C2 5.55228 2.44772 6 3 6H5C5.55228 6 6 5.55228 6 5V3C6 2.44772 5.55228 2 5 2Z" stroke="#000000" strokeWidth="1.5" />
        <path d="M21 18H19C18.4477 18 18 18.4477 18 19V21C18 21.5523 18.4477 22 19 22H21C21.5523 22 22 21.5523 22 21V19C22 18.4477 21.5523 18 21 18Z" stroke="#000000" strokeWidth="1.5" />
        <path d="M5 18H3C2.44772 18 2 18.4477 2 19V21C2 21.5523 2.44772 22 3 22H5C5.55228 22 6 21.5523 6 21V19C6 18.4477 5.55228 18 5 18Z" stroke="#000000" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    label: 'Ad',
    color: 'bg-[#F59E0B]',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
        <path d="M5.50586 16.9916L8.03146 10.0288C8.49073 9.06222 9.19305 8.26286 9.99777 10.18C10.7406 11.9497 11.8489 15.1903 12.5031 16.9954M6.65339 14.002H11.3215" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.46447 5.31802C2 6.63604 2 8.75736 2 13C2 17.2426 2 19.364 3.46447 20.682C4.92893 22 7.28596 22 12 22C16.714 22 19.0711 22 20.5355 20.682C22 19.364 22 17.2426 22 13C22 8.75736 22 6.63604 20.5355 5.31802C19.0711 4 16.714 4 12 4C7.28596 4 4.92893 4 3.46447 5.31802Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.4843 9.98682V12.9815M18.4843 12.9815V16.9252M18.4843 12.9815H16.466C16.2263 12.9815 15.9885 13.0261 15.7645 13.113C14.0707 13.7702 14.0707 16.2124 15.7645 16.8696C15.9885 16.9565 16.2263 17.0011 16.466 17.0011H18.4843" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];


const CreatePostModal = () => {
  const modal = useCreatePostModal();
  const [step, setStep] = useState(STEPS.TYPE);
  const [postType, setPostType] = useState('');
  const [content, setContent] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser: SafeUser | null = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('currentUser') || 'null') : null;

  

  const handleClose = () => {
    setPostType('');
    setContent('');
    setStep(STEPS.TYPE);
    modal.onClose();
  };

  const handlePost = async (selectedCategory: string | null) => {
    if (!content.trim()) return toast.error('Please write something');
    try {
      setIsSubmitting(true);
      await axios.post('/api/post', {
        content,
        category: selectedCategory,
        userId: currentUser?.id,
        mediaUrl: null,
        mediaType: null,
        location: null
      });
      toast.success('Post created!');
      handleClose();
    } catch (err) {
      toast.error('Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = () => {
    if (step === STEPS.TYPE) {
      if (!postType) return toast.error('Choose a post type');
      return setStep(STEPS.CONTENT);
    }
    if (!content.trim()) return toast.error('Please write something');
    setCategoryModalOpen(true);
  };

  const bodyContent = useMemo(() => {
    if (step === STEPS.TYPE) {
      return (
        <div className="flex flex-col gap-4">
          <Heading title="What type of post?" subtitle="Choose one to get started" />
          <div className="grid grid-cols-3 gap-3">
            {postTypes.map((type) => (
              <div
                key={type.label}
                onClick={() => setPostType(type.label)}
                className={`
                  rounded-xl p-4 shadow flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                  ${postType === type.label ? `${type.color} text-white` : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}
                `}
              >
                <div className="w-5 h-5">{type.icon}</div>
                <span className="text-xs">{type.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        <Heading title="Write your post" subtitle="Share your thoughts" />
        <div className="relative w-full">
          <textarea
            className="w-full rounded-2xl p-4 shadow-sm text-sm resize-none min-h-[100px] bg-white border border-neutral-200"
            placeholder={`${currentUser?.name || 'User'}, what's on your mind?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            onClick={onSubmit}
            className="absolute bottom-3 right-3 bg-black p-2 rounded-full hover:opacity-80 transition"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="#ffffff" strokeWidth="1.5"></path>
              <path d="M11.5 12.5L15 9" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }, [step, postType, content, currentUser, isSubmitting]);

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        onClose={handleClose}
        title="Create a Post"
        actionLabel={step === STEPS.CONTENT ? 'Submit' : 'Next'}
        onSubmit={onSubmit}
        secondaryAction={step === STEPS.TYPE ? undefined : () => setStep(STEPS.TYPE)}
        secondaryActionLabel={step === STEPS.TYPE ? undefined : 'Back'}
        body={bodyContent}
      />
      <PostCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSubmit={(category) => {
          handlePost(category);
          setCategoryModalOpen(false);
        }}
      />
    </>
  );
};


export default CreatePostModal;

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
    icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M18.9737 15.0215..." /></svg>)
  },
  {
    label: 'Text Post',
    color: 'bg-[#10B981]',
    icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M15 3.5H21..." /></svg>)
  },
  {
    label: 'Ad',
    color: 'bg-[#F59E0B]',
    icon: (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M5.50586 16.9916..." /></svg>)
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

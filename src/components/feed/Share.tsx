'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ContentInput from '../inputs/ContentInput';
import Avatar from '../ui/avatar';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import PostCategorySelect from '../inputs/PostCategorySelect';
import AttachmentModal from '../modals/AttachmentModal';
import useAttachmentModal from '@/app/hooks/useAttachmentModal';
import { categories } from '@/components/Categories';
import { usePostStore } from '@/app/hooks/usePostStore';
import { toast } from 'react-hot-toast';

interface ShareProps {
  currentUser: SafeUser | null;
  categoryLabel: string | undefined;
}

interface PostData {
  imageSrc: string;
  content: string;
  location: { label: string; value: string } | null;
  tag: string;
  category: string;
  categoryId: string;
  userId: string | undefined;
}

const Share: React.FC<ShareProps> = ({ currentUser, categoryLabel }) => {
  const attachmentModal = useAttachmentModal();
  const [imageSrc, setImageSrc] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<{ label: string; value: string } | null>(null);
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addPost = usePostStore((state) => state.addPost);

  const selectedCategory = categories.find(cat => cat.label === categoryLabel);

  const handlePostSubmit = useCallback(async (postData: PostData) => {
    if (!postData.content.trim()) {
      toast.error('Please write something');
      return;
    }

    if (!postData.category) {
      toast.error('Please select a category');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post('/api/post', postData);
      
      // Add the new post to the store
      addPost({
        ...response.data,
        user: currentUser,
      });

      // Reset form
      setImageSrc('');
      setContent('');
      setLocation(null);
      setTag('');
      setCategory('');
      setCategoryId('');
      
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error('Something went wrong while creating your post');
    } finally {
      setIsSubmitting(false);
    }
  }, [addPost, currentUser]);

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;

    const postData = {
      imageSrc,
      content,
      location: location ? location : null,
      tag,
      category,
      categoryId,
      userId: currentUser?.id,
    };
    handlePostSubmit(postData);
  }, [imageSrc, content, location, tag, category, categoryId, currentUser?.id, handlePostSubmit, isSubmitting]);
  
  useEffect(() => {
    if (category && content.trim()) {
      handleSubmit();
    }
  }, [category, content, handleSubmit]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`w-full h-auto rounded-2xl shadow transition-colors duration-250 ${selectedCategory ? selectedCategory.color : 'bg-[#78C3FB]'} p-6`}>
      <div className="flex items-start">
        <Link href={`/profile/${currentUser?.id}`} passHref>
          <div className='drop-shadow-md mt-1 mr-3'>
            <Avatar src={currentUser?.image ?? undefined} />
          </div>
        </Link>
        <div className="flex-grow">
          <ContentInput
            currentUser={currentUser}
            content={content}
            setContent={setContent}
            imageSrc={imageSrc}
            setImageSrc={setImageSrc}
            location={location}
            setLocation={setLocation}
          />
        </div>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center">
          {location && (
            <div className="mr-2 text-sm text-gray-600">
              {location.label}
            </div>
          )}
        </div>
        <div className="flex items-center">
        {imageSrc && (
  <div className="mx-2 w-10 h-10 overflow-hidden">
    <Image 
      src={imageSrc} 
      alt="Uploaded" 
      width={40}
      height={40}
      className="w-full h-full object-cover rounded-md"
    />
  </div>
)}
          <div 
            className='group hover:bg-white hover:bg-opacity-55 rounded-full border bg-black bg-opacity-5 border-white p-3 px-3 mr-2 cursor-pointer'
            onClick={attachmentModal.onOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="#ffffff" fill="none">
              <path d="M9.5 14.5L14.5 9.49995" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M16.8463 14.6095L19.4558 12C21.5147 9.94108 21.5147 6.60298 19.4558 4.54411C17.397 2.48524 14.0589 2.48524 12 4.54411L9.39045 7.15366M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.3969 2.48528 14.0588 4.54416 12L7.1537 9.39041" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <PostCategorySelect
            onCategorySelected={setCategory}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <AttachmentModal
        isOpen={attachmentModal.isOpen}
        onClose={attachmentModal.onClose}
        setImageSrc={setImageSrc}
        setLocation={setLocation}
      />
    </div>
  );
};

export default Share;
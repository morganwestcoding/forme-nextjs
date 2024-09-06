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

interface ShareProps {
  currentUser: SafeUser | null;
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

const Share: React.FC<ShareProps> = ({ currentUser }) => {
  const attachmentModal = useAttachmentModal();
  const [imageSrc, setImageSrc] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<{ label: string; value: string } | null>(null);
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handlePostSubmit = useCallback(async (postData: PostData) => {
    try {
      const response = await axios.post('/api/post', postData);
      console.log("Post submitted successfully:", response.data);
      // Resetting form state
      setImageSrc('');
      setContent('');
      setLocation(null);
      setTag('');
      setCategory('');
      setCategoryId('');
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  }, []);

  const handleSubmit = useCallback(() => {
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
  }, [imageSrc, content, location, tag, category, categoryId, currentUser?.id, handlePostSubmit]);
  
  useEffect(() => {
    if (category) {
      handleSubmit();
    }
  }, [category, handleSubmit]);

  return (
    <div className='w-full h-auto rounded-2xl shadow bg-[#b1dafe] p-6'>
      <div className="flex items-start">
        <Link href={`/profile/${currentUser?.id}`} passHref>
          <div className='drop-shadow mt-1 mr-3'>
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
            className='group hover:bg-white hover:bg-opacity-55 rounded-full border bg-white bg-opacity-30 border-white p-3 px-3 mr-2'
            onClick={attachmentModal.onOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} color={"#ffffff"} fill={"none"}>
              <path d="M12.5 20.5H12C7.28595 20.5 4.92893 20.5 3.46447 19.0355C2 17.5711 2 15.214 2 10.5V7.44427C2 5.6278 2 4.71956 2.38032 4.03806C2.65142 3.55227 3.05227 3.15142 3.53806 2.88032C4.21956 2.5 5.1278 2.5 6.94427 2.5C8.10802 2.5 8.6899 2.5 9.19926 2.69101C10.3622 3.12712 10.8418 4.18358 11.3666 5.23313L12 6.5M7 6.5H16.75C18.8567 6.5 19.91 6.5 20.6667 7.00559C20.9943 7.22447 21.2755 7.50572 21.4944 7.83329C22 8.58996 22 9.39331 22 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M21 15.9615L21 18.4231C21 20.1224 19.6569 21.5 18 21.5C16.3431 21.5 15 20.1224 15 18.4231L15 15.0385C15 14.1888 15.6716 13.5 16.5 13.5C17.3284 13.5 18 14.1888 18 15.0385L18 18.4231" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <PostCategorySelect
            onCategorySelected={setCategory}
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
'use client';
import React, { useState, useEffect } from 'react';
import AddPostImage from '../inputs/AddPostImage';
import AddPostLocation from '../inputs/AddPostLocation';
import AddTagInput from '../inputs/AddTagInput';
import ContentInput from '../inputs/ContentInput';
import Avatar from '../ui/avatar';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { Button } from '../ui/button';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import PostCategorySelect from '../inputs/PostCategorySelect';

interface ShareProps {
  currentUser: SafeUser | null;
}

interface PostData {
  imageSrc: string;
  content: string;
  location: string;
  tag: string;
  category: string;
  categoryId: string;
  userId: string | undefined;
}

const Share: React.FC<ShareProps> = ({ currentUser }) => {
  const [imageSrc, setImageSrc] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (category) {
      handleSubmit();
    }
  }, [category]);

  const handlePostSubmit = async (postData: PostData) => {
    try {
      const response = await axios.post('/api/post', postData);
      console.log("Post submitted successfully:", response.data);
      // Resetting form state
      setImageSrc('');
      setContent('');
      setLocation('');
      setTag('');
      setCategory('');
      setCategoryId('');
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  const handleSubmit = () => {
    const postData = {
      imageSrc,
      content,
      location,
      tag,
      category,
      categoryId,
      userId: currentUser?.id,
    };
    handlePostSubmit(postData);
  };

  return (
    <div className='w-full h-auto rounded-2xl shadow-sm bg-[#ffffff] p-6'>
      <div className="flex items-center">
      <div className='drop-shadow-sm'>
      <Avatar src={currentUser?.image ?? undefined} />
      </div>
        <ContentInput
          currentUser={currentUser}
          content={content}
          setContent={setContent}
          imageSrc={imageSrc}
        />
      </div>
      <div className="mt-4 flex items-center justify-between -mb-1 ">
        <div className="flex items-center p-1 pb-2 px-2 rounded-2xl shadow-sm bg-[#48DBFB] ">
        <div className="flex items-center justify-center bg-[#ffffff] rounded-full p-1 cursor-pointer -mb-1 drop-shadow-sm mr-2">
          <AttachFileRoundedIcon className="w-4 h-4 text-[#48DBFB]" />
          </div>
        {/*  <AddPostImage
            currentUser={currentUser} 
            onImageUpload={setImageSrc} 
          />
          <AddPostLocation
            currentUser={currentUser}
            onLocationSubmit={setLocation}/>
          <AddTagInput
            currentUser={currentUser}
            onTagSubmit={setTag}/>
              */}

        <PostCategorySelect
          onCategorySelected={setCategory}
  /> 
        </div>
      
      </div>
    </div>
  );
};

export default Share;

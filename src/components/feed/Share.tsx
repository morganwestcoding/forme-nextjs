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

import PostCategorySelect from '../inputs/PostCategorySelect';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { IoIosSettings } from "react-icons/io";
import Attachment from '../inputs/Attachment';

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
    <div className='w-full h-auto rounded-2xl shadow bg-[#b1dafe] p-6'>
      <div className="flex items-center">
      <div className='drop-shadow mt-1 '>
      <Avatar src={currentUser?.image ?? undefined} />
      </div>
        <ContentInput
          currentUser={currentUser}
          content={content}
          setContent={setContent}
          imageSrc={imageSrc}
        />
      </div>
      <div className="mt-4 flex items-center justify-between -mb-2 ">

        {/*Submit Button*/}
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

   {/* Wrap Attachment and PostCategorySelect in a new flex container */}
   <div className="flex-grow">
          {/* Placeholder for other components or spacing */}
        </div>
       
        <PostCategorySelect
          onCategorySelected={setCategory}
        />
         <Attachment />
  {/*currentUser={currentUser}
  onImageUpload={setImageSrc}
  onLocationSubmit={setLocation}
            onTagSubmit={setTag}*/}

        </div>
      
      </div>
   
  );
};

export default Share;

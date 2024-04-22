'use client';
import React, { useState, useEffect } from 'react';
import ContentInput from '../inputs/ContentInput';
import Avatar from '../ui/avatar';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import PostCategorySelect from '../inputs/PostCategorySelect';
import AttachmentModal from '../modals/AttachmentModal';
import useAttachmentModal from '@/app/hooks/useAttachmentModal';

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
  const attachmentModal = useAttachmentModal(); 
  const [imageSrc, setImageSrc] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<{ label: string; value: number } | null>(null); 
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
      setLocation(null);
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
      location: location ? location.label : '',
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
          setImageSrc={setImageSrc}
          location={location} // Pass setImageSrc function
          setLocation={setLocation} // Pass setLocation function
        />
      </div>
      <div className="mt-4 flex items-center justify-between -mb-2 ">


   

   {/* Wrap Attachment and PostCategorySelect in a new flex container */}
   <div className="flex-grow">
          {/* Placeholder for other components or spacing */}
        </div>
        <div className='group hover:bg-white hover:bg-opacity-55 rounded-full border bg-white bg-opacity-30 border-white p-2 px-3 mr-2'
        onClick={attachmentModal.onOpen}>
        <AttachFileOutlinedIcon className='group-hover:text-white text-white w-4 h-4'/> 

    </div>
            <PostCategorySelect
          onCategorySelected={setCategory}
        />
       
      

        </div>
        <AttachmentModal
        isOpen={attachmentModal.isOpen} // Pass the modal state to determine visibility
        onClose={attachmentModal.onClose} // Pass the close function to handle modal close
        setImageSrc={setImageSrc}
        setLocation={setLocation}
      />
    </div>
      
     
   
  );
};

export default Share;

'use client';
import AddPostImage from '../inputs/AddPostImage';
import AddPostLocation from '../inputs/AddPostLocation';
import AddTagInput from '../inputs/AddTagInput';
import ContentInput from '../inputs/ContentInput';
import Avatar from '../ui/avatar';
import { Button } from '../ui/button';
import { SafeUser } from '@/app/types';
import { useState } from 'react';

import PostCategorySelect from '../inputs/PostCategorySelect';
import axios from 'axios';



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
    
  const handlePostSubmit = async (postData: PostData) => {
    console.log("Post Data:", postData);

    axios.post('/api/post', postData)
        .then(response => {
            console.log("Post submitted successfully:", response.data);
            setImageSrc('');
            setContent('');
            setLocation('');
            setTag('');
            setCategory('');
            setCategoryId('');
          })
        .catch(error => {
            console.error('Error submitting post:', error);
        });
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

const handleLocationSubmit = (newLocation: string) => {
  setLocation(newLocation);
};

const handleTagSubmit = (newTag: string) => {
  setTag(newTag);
};




  return (
    <div className='w-full h-auto rounded-lg shadow-md bg-[#ffffff] bg-opacity-90 p-6 '>
      <div className="flex items-center">
        <Button variant="outline" size="icon">
        <Avatar src={currentUser?.image} />
        </Button>
      
      <ContentInput
      currentUser={currentUser}
      content={content}
      setContent={setContent}
      />
      </div>


      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center bg-white p-2 rounded-lg drop-shadow-sm">
        <AddPostImage
         currentUser={currentUser} 
         onImageUpload={setImageSrc} 
         />
      
        <AddPostLocation
        currentUser={currentUser}
        onLocationSubmit={handleLocationSubmit}/>

        <AddTagInput
        currentUser={currentUser}
        onTagSubmit={handleTagSubmit}/>
    
        </div>
       
        <div className="relative inline-block">
        <PostCategorySelect
            currentUser={currentUser}
            onPostSubmit={handlePostSubmit}
            imageSrc={imageSrc}
            location={location}
            tag={tag}
            content={content}
        />
          
          </div>
      </div>
      
    </div>
  );
};

export default Share;

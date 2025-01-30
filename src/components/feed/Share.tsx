// components/feed/Share.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ContentInput from '../inputs/ContentInput';
import Avatar from '../ui/avatar';
import { SafeUser, MediaData } from '@/app/types';
import axios from 'axios';
import Link from 'next/link';
import PostCategorySelect from '../inputs/PostCategorySelect';
import AttachmentModal from '../modals/AttachmentModal';
import useAttachmentModal from '@/app/hooks/useAttachmentModal';
import { categories } from '@/components/Categories';
import { usePostStore } from '@/app/hooks/usePostStore';
import { toast } from 'react-hot-toast';

interface ShareProps {
 currentUser: SafeUser | null;
 categoryLabel?: string;
}

interface PostData {
 content: string;
 category: string;
 userId: string | undefined;
 mediaUrl: string | null;
 mediaType: string | null;
 location: string | null;
}

const Share: React.FC<ShareProps> = ({ currentUser, categoryLabel }) => {
 const attachmentModal = useAttachmentModal();
 const [mediaData, setMediaData] = useState<MediaData | null>(null);
 const [content, setContent] = useState('');
 const [location, setLocation] = useState<{ label: string; value: string } | null>(null);
 const [category, setCategory] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const addPost = usePostStore((state) => state.addPost);

 const selectedCategory = categories.find(cat => cat.label === categoryLabel);

 const handlePostSubmit = useCallback(async () => {
   if (!content.trim()) {
     toast.error('Please write something');
     setCategory(''); // Reset category if no content
     return;
   }

   try {
     setIsSubmitting(true);

     const postData = {
       content: content.trim(),
       category,
       userId: currentUser?.id,
       mediaUrl: mediaData?.url || null,
       mediaType: mediaData?.type || null,
       location: location?.value || null
     };

     const response = await axios.post('/api/post', postData);
     
     addPost({
       ...response.data,
       user: currentUser,
     });

     // Reset form
     setContent('');
     setMediaData(null);
     setLocation(null);
     setCategory('');
     
     toast.success('Post created successfully!');
   } catch (error) {
     console.error('Error submitting post:', error);
     if (axios.isAxiosError(error) && error.response) {
       toast.error(error.response.data || 'Something went wrong while creating your post');
     } else {
       toast.error('Something went wrong while creating your post');
     }
   } finally {
     setIsSubmitting(false);
   }
 }, [content, mediaData, location, category, currentUser, addPost]);

 useEffect(() => {
   if (category && content.trim()) {
     handlePostSubmit();
     setCategory(''); // Reset category after submission
   }
 }, [category]); // Only watch for category changes

 if (!currentUser) {
   return null;
 }

 return (
   <div className={`w-full h-auto rounded-lg shadow-sm transition-colors duration-250 ${selectedCategory ? selectedCategory.color : 'bg-[#F9AE8B]'} p-6`}>
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
           location={location}
           setLocation={setLocation}
         />
       </div>
     </div>
     
     <div className="mt-2 flex items-center justify-between">
       <div className="flex items-center" />
       <div className="flex items-center">
         <div 
           className={`
             group 
             hover:bg-white 
             hover:bg-opacity-55 
             rounded-full 
             border 
             ${mediaData || location ? 'bg-green-500' : 'bg-slate-100'} 
             border-white
            bg-slate-50
            bg-opacity-20
             p-3
             px-3 
             mr-2 
             cursor-pointer
             transition-colors
             duration-500
             ease-in-out
             
           `}
           onClick={attachmentModal.onOpen}
         >
           {(mediaData || location) ? (
             <svg 
               xmlns="http://www.w3.org/2000/svg" 
               viewBox="0 0 24 24" 
               width="19" 
               height="19" 
               color="#ffffff" 
               fill="none"
               className="transition-opacity duration-800 ease-in-out"
             >
    <path d="M5 14.5C5 14.5 6.5 14.5 8.5 18C8.5 18 14.0588 8.83333 19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

             </svg>
           ) : (
             <svg 
               xmlns="http://www.w3.org/2000/svg" 
               viewBox="0 0 24 24" 
               width="19" 
               height="19" 
               color="#ffffff" 
               fill="none"
               className="transition-opacity duration-800 ease-in-out"

               
             >
               <path 
                 d="M9.5 14.5L14.5 9.49995" 
                 stroke="currentColor" 
                 strokeWidth="1.5" 
                 strokeLinecap="round" 
               />
               <path 
                 d="M16.8463 14.6095L19.4558 12C21.5147 9.94108 21.5147 6.60298 19.4558 4.54411C17.397 2.48524 14.0589 2.48524 12 4.54411L9.39045 7.15366M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.3969 2.48528 14.0588 4.54416 12L7.1537 9.39041" 
                 stroke="currentColor" 
                 strokeWidth="1.5" 
                 strokeLinecap="round" 
               />
             </svg>
           )}
         </div>
         <PostCategorySelect
           onCategorySelected={setCategory}
         />
       </div>
     </div>

     <AttachmentModal
       isOpen={attachmentModal.isOpen}
       onClose={attachmentModal.onClose}
       setMediaData={setMediaData}
       setLocation={setLocation}
     />
   </div>
 );
};

export default Share;
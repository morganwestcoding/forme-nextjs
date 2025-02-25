// components/feed/Share.tsx (with location button and fixed posting behavior)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ContentInput from '../inputs/ContentInput';
import Avatar from '../ui/avatar';
import { SafeUser, MediaData } from '@/app/types';
import axios from 'axios';
import Link from 'next/link';
import FuturisticCategory from './FuturisticCategory';
import AttachmentModal from '../modals/AttachmentModal';
import LocationModal from '../modals/LocationModal'; // You'll need to create this
import useAttachmentModal from '@/app/hooks/useAttachmentModal';
import { categories } from '@/components/Categories';
import { usePostStore } from '@/app/hooks/usePostStore';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
 const [locationModalOpen, setLocationModalOpen] = useState(false);
 const [mediaData, setMediaData] = useState<MediaData | null>(null);
 const [content, setContent] = useState('');
 const [location, setLocation] = useState<{ label: string; value: string } | null>(null);
 const [category, setCategory] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [hoverState, setHoverState] = useState<string | null>(null);
 const addPost = usePostStore((state) => state.addPost);
 const params = useSearchParams();

 // Get accent color based on selected category
 const getAccentColor = useCallback(() => {
   // First check if a specific category is selected through URL
   const categoryParam = params?.get('category');
   if (categoryParam) {
     const categoryData = categories.find(cat => cat.label === categoryParam);
     if (categoryData) {
       return categoryData.color.replace('bg-[', '').replace(']', '');
     }
   }
   
   // If not, check if a category is selected in the component
   if (categoryLabel) {
     const categoryData = categories.find(cat => cat.label === categoryLabel);
     if (categoryData) {
       return categoryData.color.replace('bg-[', '').replace(']', '');
     }
   }
   
   // Default color
   return '#0CD498';
 }, [params, categoryLabel]);

 const accentColor = getAccentColor();
 const selectedCategory = categories.find(cat => cat.label === categoryLabel);

 const handlePostSubmit = useCallback(async () => {
   if (!content.trim()) {
     toast.error('Please write something');
     return;
   }

   try {
     setIsSubmitting(true);

     const postData = {
       content: content.trim(),
       category: category || (selectedCategory?.label || 'All'),
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
 }, [content, mediaData, location, category, currentUser, addPost, selectedCategory]);

 // Button effect variants
 const buttonVariants = {
   idle: { scale: 1 },
   hover: { scale: 1.05 },
   tap: { scale: 0.98 }
 };

 const hasAttachments = mediaData !== null;
 const hasLocation = location !== null;

 return (
   <div 
     className={`w-full h-auto rounded-lg shadow-sm transition-colors duration-250 ${selectedCategory ? selectedCategory.color : 'bg-gray-200'} p-6`}
     style={{ 
       background: selectedCategory ? undefined : `linear-gradient(45deg, ${accentColor}15, ${accentColor}30)`
     }}
   >
     <div className="flex items-start">
       <Link href={`/profile/${currentUser?.id}`} passHref>
         <div className='drop-shadow mt-1 mr-3 border border-white rounded-full'>
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
     
     {/* Advanced Button Bar */}
     <div className="mt-4 flex items-center justify-between -mb-2">
       {/* Left side - Category Button */}
       <div className="flex items-center">
         <FuturisticCategory 
           initialCategory={selectedCategory?.label || "All"}
           onCategoryChange={(newCategory) => setCategory(newCategory)}
         />
       </div>

       {/* Right side - Action Buttons */}
       <div className="flex items-center space-x-2 relative">
         {/* Location Button */}
         <motion.div 
           className="relative"
           variants={buttonVariants}
           initial="idle"
           whileHover="hover"
           whileTap="tap"
           onMouseEnter={() => setHoverState('location')}
           onMouseLeave={() => setHoverState(null)}
         >
           <motion.div
             className={`
               flex items-center justify-center
               rounded-full 
               p-3
               cursor-pointer
               transition-colors
               duration-300
               ease-in-out
               ${hasLocation ? '' : 'hover:bg-white hover:bg-opacity-15'}
             `}
             style={{ 
               backgroundColor: hasLocation ? accentColor : 'white',
               boxShadow: '0 1px 8px rgba(0,0,0,0.08)'
             }}
             onClick={() => setLocationModalOpen(true)}
           >
             <svg 
               xmlns="http://www.w3.org/2000/svg" 
               viewBox="0 0 24 24" 
               width="19" 
               height="19" 
               style={{ color: hasLocation ? 'white' : (hoverState === 'location' ? accentColor : '#71717A') }}
               fill="none"
             >
               <path 
                 d="M12 12.5C13.6569 12.5 15 11.1569 15 9.5C15 7.84315 13.6569 6.5 12 6.5C10.3431 6.5 9 7.84315 9 9.5C9 11.1569 10.3431 12.5 12 12.5Z" 
                 stroke="currentColor" 
                 strokeWidth="1.5" 
                 strokeLinecap="round" 
                 strokeLinejoin="round"
               />
               <path 
                 d="M12 22C14 19 20 16.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16.4183 10 19 12 22Z" 
                 stroke="currentColor" 
                 strokeWidth="1.5" 
                 strokeLinecap="round" 
                 strokeLinejoin="round"
               />
             </svg>
           </motion.div>
           
           {/* Tooltip */}
           <AnimatePresence>
             {hoverState === 'location' && (
               <motion.div
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 5 }}
                 transition={{ duration: 0.2 }}
                 className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded px-2 py-1 z-10"
               >
                 {hasLocation ? 'Change location' : 'Add location'}
               </motion.div>
             )}
           </AnimatePresence>
         </motion.div>

         {/* Attachment Button */}
         <motion.div 
           className="relative"
           variants={buttonVariants}
           initial="idle"
           whileHover="hover"
           whileTap="tap"
           onMouseEnter={() => setHoverState('attachment')}
           onMouseLeave={() => setHoverState(null)}
         >
           <motion.div
             className={`
               flex items-center justify-center
               rounded-full 
               p-3
               cursor-pointer
               transition-colors
               duration-300
               ease-in-out
               ${hasAttachments ? '' : 'hover:bg-white hover:bg-opacity-15'}
             `}
             style={{ 
               backgroundColor: hasAttachments ? accentColor : 'white',
               boxShadow: '0 1px 8px rgba(0,0,0,0.08)'
             }}
             onClick={attachmentModal.onOpen}
           >
             {hasAttachments ? (
               <svg 
                 xmlns="http://www.w3.org/2000/svg" 
                 viewBox="0 0 24 24" 
                 width="19" 
                 height="19" 
                 color="#ffffff" 
                 fill="none"
               >
                 <path d="M5 14.5C5 14.5 6.5 14.5 8.5 18C8.5 18 14.0588 8.83333 19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             ) : (
               <svg 
                 xmlns="http://www.w3.org/2000/svg" 
                 viewBox="0 0 24 24" 
                 width="19" 
                 height="19" 
                 style={{ color: hoverState === 'attachment' ? accentColor : '#71717A' }}
                 fill="none"
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
           </motion.div>
           
           {/* Tooltip */}
           <AnimatePresence>
             {hoverState === 'attachment' && (
               <motion.div
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 5 }}
                 transition={{ duration: 0.2 }}
                 className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded px-2 py-1 z-10"
               >
                 {hasAttachments ? 'Change attachment' : 'Add attachment'}
               </motion.div>
             )}
           </AnimatePresence>
         </motion.div>

         {/* Post Button */}
         {content.trim() && (
           <motion.button
             className="flex items-center justify-center rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-colors duration-300"
             style={{ backgroundColor: accentColor }}
             variants={buttonVariants}
             initial="idle"
             whileHover="hover"
             whileTap="tap"
             onClick={() => handlePostSubmit()}
             disabled={isSubmitting}
           >
             {isSubmitting ? (
               // Simple loading indicator instead of text
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
             ) : 'Post'}
           </motion.button>
         )}
       </div>
     </div>

     {/* Modals */}
     <AttachmentModal
       isOpen={attachmentModal.isOpen}
       onClose={attachmentModal.onClose}
       setMediaData={setMediaData}
       setLocation={setLocation}
     />
     
     {/* Location Modal */}
     <LocationModal
       isOpen={locationModalOpen}
       onClose={() => setLocationModalOpen(false)}
       onLocationSelected={(location) => {
         setLocation(location);
         setLocationModalOpen(false);
       }}
     />
   </div>
 );
};

export default Share;
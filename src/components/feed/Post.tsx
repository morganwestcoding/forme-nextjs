'use client'
import React from 'react';
import Avatar from '../ui/avatar'; // Adjust the import based on your project structure
import { SafeUser, SafeUserImage, SafeProfile } from '@/app/types';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { categories } from "../Categories";
import TextsmsOutlinedIcon from '@mui/icons-material/TextsmsOutlined';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

interface PostData {
  
  user: SafeUserImage; // Use SafeUserImage here
  createdAt: string;
  content: string;
  
  imageSrc: string | null; 
  category: string;
  location?: string | null;
}

interface PostProps {
  post: PostData;
  currentUser: SafeUser | null; 
  categories: typeof categories;
}


const Post: React.FC<PostProps> = ({ post, currentUser,  categories }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    const formatCreatedAt = (createdAt: string) => {
      const postDate = new Date(createdAt);
      const now = new Date();
      const differenceInSeconds = (now.getTime() - postDate.getTime()) / 1000;

      if (differenceInSeconds < 60) {
        return `${differenceInSeconds} seconds ago`;
      } else if (differenceInSeconds < 3600) {
        return `${Math.floor(differenceInSeconds / 60)} minutes ago`;
      } else if (differenceInSeconds < 86400) {
        return `${Math.floor(differenceInSeconds / 3600)} hours ago`;
      } else {
        // Format date to "Month Day"
        return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    };

    setFormattedDate(formatCreatedAt(post.createdAt));
  }, [post.createdAt]);

  const getColorByCategory = (categoryName: string) => {
    const category = categories.find(cat => cat.label === categoryName);
    if (!category) return { bgColorClass: 'bg-gray-200', textColorClass: 'text-gray-200', borderColorClass: 'border-gray-200' };

    switch (category.color) {
        case 'bg-yellow-200':
            return { bgColorClass: 'bg-yellow-200', textColorClass: 'text-yellow-200', borderColorClass: 'border-yellow-200' };
        case 'bg-rose-200':
            return { bgColorClass: 'bg-rose-200', textColorClass: 'text-rose-200', borderColorClass: 'border-rose-200' };
        case 'bg-orange-300':
            return { bgColorClass: 'bg-orange-300', textColorClass: 'text-orange-300', borderColorClass: 'border-orange-300' };
        case 'bg-teal-500':
            return { bgColorClass: 'bg-teal-500', textColorClass: 'text-teal-500', borderColorClass: 'border-teal-500' };
        case 'bg-emerald-600':
            return { bgColorClass: 'bg-emerald-600', textColorClass: 'text-emerald-600', borderColorClass: 'border-emerald-600' };
        case 'bg-cyan-600':
            return { bgColorClass: 'bg-cyan-600', textColorClass: 'text-cyan-600', borderColorClass: 'border-cyan-600' };
        case 'bg-blue-800':
            return { bgColorClass: 'bg-blue-800', textColorClass: 'text-blue-800', borderColorClass: 'border-blue-800' };
        case 'bg-indigo-800':
            return { bgColorClass: 'bg-indigo-800', textColorClass: 'text-indigo-800', borderColorClass: 'border-indigo-800' };
        default:
            return { bgColorClass: 'bg-gray-200', textColorClass: 'text-gray-200', borderColorClass: 'border-gray-200' };
    }
  };




const categoryColors = getColorByCategory(post.category);


  return (
    <div className='w-full h-auto rounded-2xl drop-shadow-sm bg-[#ffffff] p-6 mr-8 my-6 '>
      
      
      {/* Heart Button Placeholder at the top right corner */}
      <div className="absolute top-7 right-6">
        {/* Placeholder for the heart button, replace with actual HeartButton component or icon */}
        <div 
     
      className="
        relative
        hover:opacity-80
        transition
        cursor-pointer
      "
    >
         <MoreHorizRoundedIcon className="w-7 h-7 hover:text-[#48DBFB] text-[#8d8d8d] mr-2"/>
      {/*<div className={`text-xs drop-shadow-sm  border ${categoryColors.bgColorClass} ${categoryColors.borderColorClass} p-4 rounded-full text-white`}>      
      </div>*/}
    </div>
      </div>

      <div className="flex items-center">
        <div className='drop-shadow'>
          <Avatar src={post.user.image} />
          </div>
        <div className="ml-3 flex flex-col">
          <div className="flex items-center">
            <div className="font-medium pr-1 text-sm text-[#484848]">{post.user.name} &middot;</div>
            <div className="text-sm text-[#717171]">{formattedDate || 'Loading time...'}</div>
          </div>
          <div className={`flex text-sm items-center ${post.location ? 'text-gray-600' : '-ml-2'}`}>
          {post.location && (
              <span>{post.location}</span>
            )}
        {/* Ensure category label is rendered inline with location */}
        <span className={`ml-2 p-1 rounded text-white drop-shadow-sm px-2 py-1 mx-auto my-1  text-xs ${categoryColors.bgColorClass}`}>
          {post.category}
        </span>
      </div>
      </div>
      </div>

      {/*Image*/}
      <div className="mt-3 relative">
                <p className='text-sm text-[#000000] mb-3'>{post.content}</p>
                {post.imageSrc && (
                    <div className="rounded-lg overflow-hidden relative">
                        <Image src={post.imageSrc} alt="Post Image" layout='responsive' objectFit="cover" width={500} height={300} />
                        {/* Centering interaction buttons */}
                        
                    </div>
                )}

                <div className="bottom-0 left-0 flex space-x-4 p-2 -ml-2 -mb-3 mt-1">
                            <div className="flex items-center justify-center bg-[#ffffff]  rounded-full p-3 cursor-pointer shadow-sm border  ">
                                <TextsmsOutlinedIcon className='w-4 h-4 text-[#a2a2a2]'/>
                            </div>
                            <div className="flex items-center justify-center bg-[#ffffff]  rounded-full p-3 cursor-pointer shadow-sm border  ">
                                <FavoriteBorderRoundedIcon className='w-4 h-4 text-[#a2a2a2]'/>
                            </div>
                            <div className="flex items-center justify-center bg-[#ffffff]  rounded-full p-3 cursor-pointer shadow-sm border  ">
                                <BookmarkBorderRoundedIcon className='w-4 h-4 text-[#a2a2a2]'/>
                            </div>
                        </div>

        </div>
      </div>
   
  );
};

export default Post;

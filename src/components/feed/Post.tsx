'use client'
import React from 'react';
import Avatar from '../ui/avatar'; // Adjust the import based on your project structure
import { SafeUser, SafeUserImage } from '@/app/types';
import { Button } from '../ui/button';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { categories } from "../Categories";
import { GoBookmark,GoBookmarkFill } from 'react-icons/go';


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
    <div className='w-full h-auto rounded-lg drop-shadow bg-[#ffffff] bg-opacity-90 p-6 mr-8 my-6 '>
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
      <GoBookmark
        size={32}
        className="
        drop-shadow-sm
          fill-white
          absolute
          -top-[2px]
          -right-[2px]
        "
      />
      <GoBookmarkFill
        size={28}
        className='fill-neutral-500/70'
        
      />
    </div>
      </div>

      <div className="flex items-center">
        <Button variant="outline" size="icon" className='bg-white drop-shadow bg-opacity-100'>
          <Avatar src={post.user.image} />
        </Button>
        <div className="ml-3 flex flex-col">
          <div className="flex items-center">
            <div className="font-semibold pr-1 text-sm">{post.user.name}</div>
            <div className="text-sm text-gray-500">{formattedDate || 'Loading time...'}</div>
          </div>
          <div className="text-sm text-gray-500">{post.location}</div>
          
        </div>
      </div>

      {/*Image*/}
      <div className=" pl-1 mt-3">
        <p className='text-sm'>{post.content}</p>
        {post.imageSrc && (
          <div className="mt-3 mb-4 rounded-md drop-shadow " style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}>
          <Image src={post.imageSrc} alt="Post Image" layout='responsive' objectFit="contain" width={500} height={300} />
        </div>
        )}

        {/* Bottom */}
        <div className="flex justify-start items-center"> {/* Adjusted class here for left alignment */}
          <div className="flex items-center bg-white p-2 rounded-lg drop-shadow-sm">
            <Image src="/icons/arrow-up-3.svg" alt="camera" width={26} height={26} className='mr-2 drop-shadow-sm'/>
            <Image src="/icons/arrow-down-1.svg" alt="camera" width={26} height={26} className=' drop-shadow-sm'/>
          </div>
          <div className="absolute bottom-7 right-6"> {/* Added margin left for spacing */}
          <div className={`text-sm drop-shadow-sm bg-white border ${categoryColors.borderColorClass} p-3 py-1 rounded-xl ${categoryColors.textColorClass}`}>
                {post.category}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;

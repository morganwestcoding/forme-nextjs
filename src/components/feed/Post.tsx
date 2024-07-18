'use client'
import React, { useState, useCallback } from 'react';
import Avatar from '../ui/avatar'; // Adjust the import based on your project structure
import { SafeUser } from '@/app/types';
import Image from 'next/image';
import { useEffect} from 'react';
import { categories } from "../Categories";
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';


interface PostData {
  id: string;
  user: SafeUser; 
  createdAt: string;
  content: string;
  imageSrc: string | null; 
  category: string;
  location?: string | null;
  likes: string[];
}

interface PostProps {
  post: PostData;
  currentUser: SafeUser | null; 
  categories: typeof categories;
}


const Post: React.FC<PostProps> = ({ post, currentUser,  categories }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [likes, setLikes] = useState(post.likes);

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

const handleLike = useCallback(async () => {
  if (!currentUser) {
    toast.error('You must be logged in to like a post');
    return;
  }

  try {
    const response = await axios.post(`/api/postActions/${post.id}/like`);
    setLikes(response.data.likes);
  } catch (error) {
    toast.error('Something went wrong');
  }
}, [currentUser, post.id]);

const isLiked = currentUser ? likes.includes(currentUser.id) : false;



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
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={"#a2a2a2"} fill={"none"}>
    <path d="M15.5 6.5C15.5 8.433 13.933 10 12 10C10.067 10 8.5 8.433 8.5 6.5C8.5 4.567 10.067 3 12 3C13.933 3 15.5 4.567 15.5 6.5Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M22 17.5C22 19.433 20.433 21 18.5 21C16.567 21 15 19.433 15 17.5C15 15.567 16.567 14 18.5 14C20.433 14 22 15.567 22 17.5Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 17.5C9 19.433 7.433 21 5.5 21C3.567 21 2 19.433 2 17.5C2 15.567 3.567 14 5.5 14C7.433 14 9 15.567 9 17.5Z" stroke="currentColor" strokeWidth="1.5" />
</svg>

    </div>
      </div>

      <div className="flex items-center">
      <Link href={`/profile/${post.user.id}`} passHref>
        <div className='drop-shadow'>
          <Avatar src={post.user.image ?? undefined} />
          </div>
      </Link>
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
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#a2a2a2"} fill={"none"}>
                              <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6.09881 19C4.7987 18.8721 3.82475 18.4816 3.17157 17.8284C2 16.6569 2 14.7712 2 11V10.5C2 6.72876 2 4.84315 3.17157 3.67157C4.34315 2.5 6.22876 2.5 10 2.5H14C17.7712 2.5 19.6569 2.5 20.8284 3.67157C22 4.84315 22 6.72876 22 10.5V11C22 14.7712 22 16.6569 20.8284 17.8284C19.6569 19 17.7712 19 14 19C13.4395 19.0125 12.9931 19.0551 12.5546 19.155C11.3562 19.4309 10.2465 20.0441 9.14987 20.5789C7.58729 21.3408 6.806 21.7218 6.31569 21.3651C5.37769 20.6665 6.29454 18.5019 6.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                            <div 
                            onClick={handleLike}
                            className="flex items-center justify-center bg-[#ffffff]  rounded-full p-3 cursor-pointer shadow-sm border relative">
                            <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            width={16} 
                            height={16} 
                            color={isLiked ? "red" : "#a2a2a2"} 
                            fill={isLiked ? "red" : "none"}
                            >
                              <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            {likes.length > 0 && (
    <div className="absolute -top-1 -right-2 bg-white border border rounded-full w-5 h-5 flex items-center justify-center text-xs text-[#a2a2a2] font-light shadow-sm">
      {likes.length}
    </div>
  )}
                            </div>
                            <div className="flex items-center justify-center bg-[#ffffff]  rounded-full p-3 cursor-pointer shadow-sm border  ">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#a2a2a2"} fill={"none"}>
    <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>

                            </div>
                        </div>

        </div>
      </div>
   
  );
};

export default Post;

'use client'
import React, { useState, useCallback, useEffect } from 'react';
import Avatar from '../ui/avatar';
import { SafeUser } from '@/app/types';
import Image from 'next/image';
import { categories } from "../Categories";
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface PostData {
  id: string;
  user: SafeUser; 
  createdAt: string;
  content: string;
  imageSrc: string | null; 
  category: string;
  location?: string | null;
  likes: string[];
  bookmarks: string[];
  
}

interface PostProps {
  post: PostData;
  currentUser: SafeUser | null; 
  categories: typeof categories;
}

const Post: React.FC<PostProps> = ({ post, currentUser, categories }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [likes, setLikes] = useState(post.likes);
  const [bookmarks, setBookmarks] = useState(post.bookmarks);
  const [isHidden, setIsHidden] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const formatCreatedAt = (createdAt: string) => {
      const postDate = new Date(createdAt);
      const now = new Date();
      const differenceInSeconds = (now.getTime() - postDate.getTime()) / 1000;

      if (differenceInSeconds < 60) {
        return `${Math.round(differenceInSeconds)} seconds ago`;
      } else if (differenceInSeconds < 3600) {
        return `${Math.floor(differenceInSeconds / 60)} minutes ago`;
      } else if (differenceInSeconds < 86400) {
        return `${Math.floor(differenceInSeconds / 3600)} hours ago`;
      } else {
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

  const handleBookmark = useCallback(async () => {
    if (!currentUser) {
      toast.error('You must be logged in to bookmark a post');
      return;
    }

    try {
      const response = await axios.post(`/api/postActions/${post.id}/bookmark`);
      setBookmarks(response.data.bookmarks);
    } catch (error) {
      toast.error('Something went wrong');
    }
  }, [currentUser, post.id]);

  const isBookmarked = currentUser ? bookmarks.includes(currentUser.id) : false;

  const handleDelete = async () => {
    if (!currentUser || currentUser.id !== post.user.id) {
      toast.error('You are not authorized to delete this post');
      return;
    }

    try {
      await axios.delete(`/api/posts/${post.id}`);
      toast.success('Post deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleNotInterested = useCallback(async () => {
    if (!currentUser) {
      toast.error('You must be logged in to hide posts');
      return;
    }

    try {
      // Here you would typically make an API call to update the user's preferences
      // For now, we'll just update the local state
      setIsHidden(true);
      toast.success('Post hidden from your feed');
      // You might want to trigger a refresh of the feed here
    } catch (error) {
      toast.error('Failed to hide post');
    }
  }, [currentUser]);

  if (isHidden) {
    return null; // Don't render the post if it's hidden
  }

  return (
    <div className='w-full h-auto rounded-2xl drop-shadow-sm bg-[#ffffff] p-6 mr-8 my-4 relative'
    >
     
      <div className="absolute top-7 right-6" >
        <DropdownMenu>
          <DropdownMenuTrigger>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#a2a2a2">
              <path d="M13.5 4.5C13.5 3.67157 12.8284 3 12 3C11.1716 3 10.5 3.67157 10.5 4.5C10.5 5.32843 11.1716 6 12 6C12.8284 6 13.5 5.32843 13.5 4.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
              <path d="M13 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
              <path d="M13.5 19.5C13.5 18.6716 12.8284 18 12 18C11.1716 18 10.5 18.6716 10.5 19.5C10.5 20.3284 11.1716 21 12 21C12.8284 21 13.5 20.3284 13.5 19.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {currentUser && currentUser.id === post.user.id ? (
              <DropdownMenuItem onClick={handleDelete} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                Delete Post
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={handleNotInterested} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                Not Interested
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
            <span className={`ml-2 p-1 rounded text-white drop-shadow-sm px-2 py-1 mx-auto my-1  text-xs ${categoryColors.bgColorClass}`}>
              {post.category}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 relative">
        <p className='text-sm text-[#000000] mb-3'>{post.content}</p>
        {post.imageSrc && (
          <div className="rounded-lg overflow-hidden relative">
            <Image src={post.imageSrc} alt="Post Image" layout='responsive' objectFit="cover" width={500} height={300} />
          </div>
        )}

        <div className="bottom-0 left-0 flex space-x-3 p-2 -ml-2 -mb-4 mt-1.5">
          <div className="flex items-center justify-center bg-[#ffffff] rounded-full p-3 cursor-pointer shadow-sm border">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#a2a2a2"} fill={"none"}>
              <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.09881 19C4.7987 18.8721 3.82475 18.4816 3.17157 17.8284C2 16.6569 2 14.7712 2 11V10.5C2 6.72876 2 4.84315 3.17157 3.67157C4.34315 2.5 6.22876 2.5 10 2.5H14C17.7712 2.5 19.6569 2.5 20.8284 3.67157C22 4.84315 22 6.72876 22 10.5V11C22 14.7712 22 16.6569 20.8284 17.8284C19.6569 19 17.7712 19 14 19C13.4395 19.0125 12.9931 19.0551 12.5546 19.155C11.3562 19.4309 10.2465 20.0441 9.14987 20.5789C7.58729 21.3408 6.806 21.7218 6.31569 21.3651C5.37769 20.6665 6.29454 18.5019 6.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div 
            onClick={handleLike}
            className="flex items-center justify-center bg-[#ffffff] rounded-full p-3 cursor-pointer shadow-sm border relative">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width={16} 
              height={16} 
              color={isLiked ? "#b1dafe" : "#a2a2a2"} 
              fill={isLiked ? "#b1dafe" : "none"}
            >
              <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {likes.length > 0 && (
              <div className="absolute -top-1 -right-2 bg-white border rounded-full w-5 h-5 flex items-center justify-center text-xs text-[#a2a2a2] font-thin shadow-sm">
                {likes.length}
              </div>
            )}
          </div>
          <div
            onClick={handleBookmark}
            className="flex items-center justify-center bg-[#ffffff] rounded-full p-3 cursor-pointer shadow-sm border relative">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width={16} 
              height={16} 
              color={isBookmarked ? "#b1dafe" : "#a2a2a2"} 
              fill={isBookmarked ? "#b1dafe" : "none"}
            >
              <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {bookmarks.length > 0 && (
              <div className="absolute -top-1 -right-2 bg-white border rounded-full w-5 h-5 flex items-center justify-center text-xs font-thing text-[#a2a2a2] shadow-sm">
                {bookmarks.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
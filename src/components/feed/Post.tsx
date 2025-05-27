'use client'
import { useSearchParams } from 'next/navigation';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Avatar from '../ui/avatar';
import { SafeUser, SafeComment, MediaType } from '@/app/types';
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
import usePostModal from '@/app/hooks/usePostModal';
import getComments from '@/app/actions/getComments';

interface PostData {
  id: string;
  user: SafeUser; 
  createdAt: string;
  content: string;
  imageSrc: string | null;
  mediaUrl?: string | null; 
  mediaType?: MediaType | null;
  category: string;
  location?: string | null;
  likes: string[];
  bookmarks: string[];
  hiddenBy: string[]; 
}

interface PostProps {
  post: PostData;
  currentUser: SafeUser | null; 
  categories: typeof categories;
}

// Helper component for the gradient SVG definitions
const GradientDefinitions = ({ accentColor, uniqueId }: { accentColor: string, uniqueId: string }) => {
  // Generate lighter versions of colors for gradients
  const lightenColor = (hex: string, percent: number) => {
    try {
      // Convert hex to RGB
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      // Calculate lighter versions (moving toward white)
      const lighterR = Math.min(255, Math.floor(r + (255 - r) * percent));
      const lighterG = Math.min(255, Math.floor(g + (255 - g) * percent));
      const lighterB = Math.min(255, Math.floor(b + (255 - b) * percent));
      
      // Convert back to hex
      return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
    } catch (e) {
      // Fallback if any issues with color processing
      return hex;
    }
  };

  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {/* Color gradient for base color */}
        <linearGradient id={`colorGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={lightenColor(accentColor, 0.2)} />
          <stop offset="50%" stopColor={accentColor} />
          <stop offset="100%" stopColor={lightenColor(accentColor, 0.1)} />
        </linearGradient>
        
        {/* Shine overlay - diagonal white gradient for sheen effect */}
        <linearGradient id={`shineGradient-${uniqueId}`} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="25%" stopColor="white" stopOpacity="0.1" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const Post: React.FC<PostProps> = ({ post, currentUser, categories }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [likes, setLikes] = useState(post.likes);
  const [bookmarks, setBookmarks] = useState(post.bookmarks);
  const [isHidden, setIsHidden] = useState(false);
  const router = useRouter();
  const postModal = usePostModal();

  // Generate unique IDs for SVG gradients to prevent conflicts
  const uniqueId = useMemo(() => Math.random().toString(36).substring(2, 9), []);

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

  const categoryColor = categories.find(cat => cat.label === post.category)?.color || 'bg-[#60A5FA]';
  const badgeColor = categoryColor.replace('bg-[', '').replace(']', '') || '#60A5FA';

  const params = useSearchParams();

  const getAccentColor = () => {
    // Check if a category is selected in the URL
    const categoryParam = params?.get('category');
    
    if (categoryParam) {
      // If this post matches the selected category, use its color
      if (categoryParam === post.category) {
        const categoryData = categories.find(cat => cat.label === post.category);
        if (categoryData) {
          return categoryData.color.replace('bg-[', '').replace(']', '');
        }
      } else {
        // If any category is selected (even if not this post's category), 
        // still use the selected category color
        const categoryData = categories.find(cat => cat.label === categoryParam);
        if (categoryData) {
          return categoryData.color.replace('bg-[', '').replace(']', '');
        }
      }
    }
    
    // Default color when no category is selected or "All" is selected
    return '#60A5FA';
  };
  
  const accentColor = getAccentColor();

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser || currentUser.id !== post.user.id) {
      toast.error('You are not authorized to delete this post');
      return;
    }
  
    try {
      await axios.delete(`/api/post/${post.id}`);
      toast.success('Post deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      if (axios.isAxiosError(error)) {
        toast.error(`Failed to delete post: ${error.response?.status}`);
      }
    }
  };

  const handleNotInterested = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      toast.error('You must be logged in to hide posts');
      return;
    }
  
    try {
      const response = await axios.post(`/api/postActions/${post.id}/hide`);
      setIsHidden(true);
      toast.success('Post hidden from your feed');
    } catch (error) {
      console.error('Error hiding post:', error);
      toast.error('Failed to hide post');
    }
  }, [currentUser, post.id]);

  const openPostModal = useCallback(async () => {
    // First, set all the data
    postModal.setPost({
      ...post,
      likes,
      bookmarks,
    });
    postModal.setCurrentUser(currentUser);
    
    // Then fetch comments
    try {
      const comments = await getComments(post.id);
      postModal.setComments(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      postModal.setComments([]);
    }
    
    // Finally, open the modal
    postModal.onOpen();
  }, [post, likes, bookmarks, currentUser, postModal]);

  const getStateAcronym = (state: string) => {
    const stateMap: {[key: string]: string} = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
      'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
      'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
      'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
      'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
      'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
      'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return stateMap[state] || state;
  };

  const [city, state] = post.location?.split(',').map(s => s.trim()) || [];
  const stateAcronym = state ? getStateAcronym(state) : '';

  const renderMedia = () => {
    if (post.imageSrc) {
      return (
        <div className="rounded-lg overflow-hidden relative aspect-square w-full mb-3">
          <Image 
            src={post.imageSrc} 
            alt="Post Image"
            width={250}
            height={250}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </div>
      );
    }

    if (post.mediaUrl) {
      switch (post.mediaType) {
        case 'video':
          return (
            <div className="rounded-lg overflow-hidden relative aspect-square w-full mb-3">
              <video 
                src={post.mediaUrl}
                controls
                className="w-full h-full object-cover"
                preload="metadata"
              />
            </div>
          );
        case 'gif':
        case 'image':
          return (
            <div className="rounded-lg overflow-hidden relative aspect-square w-full mb-3">
              <Image 
                src={post.mediaUrl} 
                alt="Post Media"
                width={250}
                height={250}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
          );
      }
    }

    return null;
  };

  // Render the heart icon with gradient when liked
  const renderHeartIcon = () => {
    if (isLiked) {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width={20} 
          height={20}
          fill={`url(#colorGradient-${uniqueId})`}
          stroke="none"
        >
          <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" />
          
          {/* Shine overlay */}
          <path 
            d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" 
            fill={`url(#shineGradient-${uniqueId})`}
            style={{ mixBlendMode: 'soft-light', opacity: 0.7 }}
          />
        </svg>
      );
    } else {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width={20} 
          height={20}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-neutral-600"
        >
          <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }
  };

  // Render the bookmark icon with gradient when bookmarked
  const renderBookmarkIcon = () => {
    if (isBookmarked) {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width={20} 
          height={20}
          fill={`url(#colorGradient-${uniqueId})`}
          stroke="none"
        >
          <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" />
          
          {/* Shine overlay */}
          <path 
            d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" 
            fill={`url(#shineGradient-${uniqueId})`}
            style={{ mixBlendMode: 'soft-light', opacity: 0.7 }}
          />
        </svg>
      );
    } else {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width={20} 
          height={20}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-neutral-600"
        >
          <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 7H20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    }
  };

  return (
    <>
      {!isHidden && (
        <div className='w-full h-auto rounded-2xl shadow-sm bg-white duration-600 transition-all hover:bg-gray-100 hover:shadow-md z-1 p-6   md:mr-6 my-4 relative cursor-pointer' onClick={openPostModal}>
          {/* Add the SVG gradient definitions */}
          <GradientDefinitions accentColor={accentColor} uniqueId={uniqueId} />
          
          <div className="absolute top-4 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#71717A" fill="none" className='rotate-90'>
                  <path d="M11.9959 12H12.0049" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17.9998 12H18.0088" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.99981 12H6.00879" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
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
            <Avatar src={post.user.image ?? undefined} />      
            <div className="ml-3 flex flex-col">
              <div className="flex items-center pb-1">
                <span className="font-medium pr-1 text-sm text-[#484848] flex items-center">
                  {post.user.name}
                  {post.user.isSubscribed && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      width="21" 
                      height="21" 
                      className="inline-block ml-1 relative"
                      style={{ color: accentColor }}
                      fill="none"
                    >
                      <path 
                        d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" 
                        stroke="currentColor" 
                        strokeWidth="1.5"
                      />
                      <path 
                        d="M9 12.8929C9 12.8929 10.2 13.5447 10.8 14.5C10.8 14.5 12.6 10.75 15 9.5" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-neutral-500">&middot; {formattedDate || 'Loading time...'}</span>
              </div>
              <div className={`flex text-sm items-center ${post.location ? 'text-gray-600' : '-ml-2'}`}>
                {post.location && (
                  <span>{city}, {stateAcronym}</span>
                )}
                <span 
                  className="ml-2 p-2.5  w-20 rounded-lg text-white flex items-center justify-center text-xs"
                  style={{ backgroundColor: badgeColor }}
                >
                  {post.category}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 relative">
            <p className='text-sm text-[#000000] mb-3'>{post.content}</p>
            
            {renderMedia()}

            <div className="bottom-0 left-0 flex gap-4 p-2 -ml-2 -mb-4 mt-1.5">
              {/* Comment Button */}
              <div className="flex items-center justify-center p-3 rounded-full cursor-pointer transition-all duration-300
                bg-white shadow-sm
                hover:shadow-[0_0_12px_rgba(0,0,0,0.05)]">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width={20} 
                  height={20} 
                  className="text-neutral-600"
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6.09881 19C4.7987 18.8721 3.82475 18.4816 3.17157 17.8284C2 16.6569 2 14.7712 2 11V10.5C2 6.72876 2 4.84315 3.17157 3.67157C4.34315 2.5 6.22876 2.5 10 2.5H14C17.7712 2.5 19.6569 2.5 20.8284 3.67157C22 4.84315 22 6.72876 22 10.5V11C22 14.7712 22 16.6569 20.8284 17.8284C19.6569 19 17.7712 19 14 19C13.4395 19.0125 12.9931 19.0551 12.5546 19.155C11.3562 19.4309 10.2465 20.0441 9.14987 20.5789C7.58729 21.3408 6.806 21.7218 6.31569 21.3651C5.37769 20.6665 6.29454 18.5019 6.5 17.5"/>
                  <path d="M8 13.5H16M8 8.5H12" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Like Button - With Gradient Effect */}
              <div 
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                className="flex items-center justify-center p-3 rounded-full cursor-pointer transition-all duration-300 relative 
                  bg-white shadow-sm  hover:shadow-[0_0_12px_rgba(0,0,0,0.05)]"
              >
                {renderHeartIcon()}
                {likes.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[11px] font-medium text-white shadow-sm"
                    style={{ backgroundColor: accentColor }}
                  >
                    {likes.length}
                  </span>
                )}
              </div>

              {/* Bookmark Button - With Gradient Effect */}
              <div
                onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
                className="flex items-center justify-center p-3 rounded-full cursor-pointer transition-all duration-300 relative
                  bg-white shadow-sm  hover:shadow-[0_0_12px_rgba(0,0,0,0.05)]"
              >
                {renderBookmarkIcon()}
                {bookmarks.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[11px] font-medium text-white shadow-sm"
                    style={{ backgroundColor: accentColor }}
                  >
                    {bookmarks.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Post;
                  

                  
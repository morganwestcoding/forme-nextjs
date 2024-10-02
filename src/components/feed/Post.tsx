'use client'
import React, { useState, useCallback, useEffect } from 'react';
import Avatar from '../ui/avatar';
import { SafeUser, SafeComment } from '@/app/types';
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
import PostModal from '../modals/PostModal';
import getComments from '@/app/actions/getComments';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comments, setComments] = useState<SafeComment[]>([]);
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
      setIsHidden(true);
      toast.success('Post hidden from your feed');
    } catch (error) {
      toast.error('Failed to hide post');
    }
  }, [currentUser]);

  const fetchComments = useCallback(async () => {
    try {
      const fetchedComments = await getComments(post.id);
      console.log('Fetched comments:', fetchedComments);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  }, [post.id]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    fetchComments();
  }, [fetchComments]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCommentAdded = useCallback((newComment: SafeComment) => {
    setComments(prevComments => {
      const updatedComments = [newComment, ...prevComments];
      console.log('Updated comments:', updatedComments);
      return updatedComments;
    });
  }, []);

  // Function to get state acronym
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

  // Split location into city and state, and convert state to acronym
  const [city, state] = post.location?.split(',').map(s => s.trim()) || [];
  const stateAcronym = state ? getStateAcronym(state) : '';

  return (
    <>
      <div 
        className='w-full h-auto rounded-2xl drop-shadow-sm bg-[#ffffff] p-6 mr-8 my-4 relative cursor-pointer'
        onClick={openModal}
      >
        <div className="absolute top-4 right-6" >
          <DropdownMenu>
            <DropdownMenuTrigger>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#a2a2a2" fill="none">
                <path d="M11.9959 12H12.0049" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17.9998 12H18.0088" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.99981 12H6.00879" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
            <div className="flex items-center pb-1">
              <div className="font-medium pr-1 text-sm text-[#484848]">{post.user.name} &middot;</div>
              <div className="text-sm text-[#717171]">{formattedDate || 'Loading time...'}</div>
            </div>
            <div className={`flex text-sm items-center ${post.location ? 'text-gray-600' : '-ml-2'}`}>
              {post.location && (
                <span>{city}, {stateAcronym}</span>
              )}
              <span className={`ml-2 w-8 h-5 rounded text-white drop-shadow-sm shadow-sm flex items-center justify-center text-xs ${categoryColors.bgColorClass}`}>
                {post.category.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 relative">
          <p className='text-sm text-[#000000] mb-3'>{post.content}</p>
          {post.imageSrc && (
  <div className="rounded-lg overflow-hidden relative w-full h-64 mb-3">
    <Image 
      src={post.imageSrc} 
      alt="Post Image" 
      layout='fill'
      objectFit="cover"
      className="transition-transform duration-300 ease-in-out hover:scale-105"
    />
  </div>
)}

          <div className="bottom-0 left-0 flex space-x-3 p-2 -ml-2 -mb-4 mt-1.5">
            <div className="flex items-center justify-center bg-white bg-opacity-15 rounded-full p-3 cursor-pointer shadow-sm border">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={17} height={17} color={"#a2a2a2"} fill={"none"}>
                <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.09881 19C4.7987 18.8721 3.82475 18.4816 3.17157 17.8284C2 16.6569 2 14.7712 2 11V10.5C2 6.72876 2 4.84315 3.17157 3.67157C4.34315 2.5 6.22876 2.5 10 2.5H14C17.7712 2.5 19.6569 2.5 20.8284 3.67157C22 4.84315 22 6.72876 22 10.5V11C22 14.7712 22 16.6569 20.8284 17.8284C19.6569 19 17.7712 19 14 19C13.4395 19.0125 12.9931 19.0551 12.5546 19.155C11.3562 19.4309 10.2465 20.0441 9.14987 20.5789C7.58729 21.3408 6.806 21.7218 6.31569 21.3651C5.37769 20.6665 6.29454 18.5019 6.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div 
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className="flex items-center justify-center bg-[#ffffff] rounded-full p-3 cursor-pointer shadow-sm border relative">
        <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width={17} 
                height={17} 
                color={isLiked ? "#a2a2a2" : "#a2a2a2"} 
                fill={isLiked ? "#b1dafe" : "none"}
              >
                <path d="M2 12.5C2 11.3954 2.89543 10.5 4 10.5C5.65685 10.5 7 11.8431 7 13.5V17.5C7 19.1569 5.65685 20.5 4 20.5C2.89543 20.5 2 19.6046 2 18.5V12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.4787 7.80626L15.2124 8.66634C14.9942 9.37111 14.8851 9.72349 14.969 10.0018C15.0369 10.2269 15.1859 10.421 15.389 10.5487C15.64 10.7065 16.0197 10.7065 16.7791 10.7065H17.1831C19.7532 10.7065 21.0382 10.7065 21.6452 11.4673C21.7145 11.5542 21.7762 11.6467 21.8296 11.7437C22.2965 12.5921 21.7657 13.7351 20.704 16.0211C19.7297 18.1189 19.2425 19.1678 18.338 19.7852C18.2505 19.8449 18.1605 19.9013 18.0683 19.9541C17.116 20.5 15.9362 20.5 13.5764 20.5H13.0646C10.2057 20.5 8.77628 20.5 7.88814 19.6395C7 18.7789 7 17.3939 7 14.6239V13.6503C7 12.1946 7 11.4668 7.25834 10.8006C7.51668 10.1344 8.01135 9.58664 9.00069 8.49112L13.0921 3.96056C13.1947 3.84694 13.246 3.79012 13.2913 3.75075C13.7135 3.38328 14.3652 3.42464 14.7344 3.84235C14.774 3.8871 14.8172 3.94991 14.9036 4.07554C15.0388 4.27205 15.1064 4.37031 15.1654 4.46765C15.6928 5.33913 15.8524 6.37436 15.6108 7.35715C15.5838 7.46692 15.5488 7.5801 15.4787 7.80626Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {likes.length > 0 && (
                <div className="absolute -top-1 -right-2 bg-white border rounded-full w-5 h-5 flex items-center justify-center text-xs text-[#a2a2a2] font-thin shadow-sm">
                  {likes.length}
                </div>
              )}
            </div>
            <div
              onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
              className="flex items-center justify-center bg-[#ffffff] rounded-full p-3 cursor-pointer shadow-sm border relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width={17} 
                height={17} 
                color={isBookmarked ? "#b1dafe" : "#a2a2a2"} 
                fill={isBookmarked ? "#b1dafe" : "none"}
              >
                <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
      <PostModal
        isOpen={isModalOpen}
        onClose={closeModal}
        post={{
          ...post,
          likes,
          bookmarks,
          location: post.location ? `${city}, ${stateAcronym}` : undefined
        }}
        currentUser={currentUser}
        onLike={handleLike}
        onBookmark={handleBookmark}
        comments={comments}
        onCommentAdded={handleCommentAdded}
        refreshComments={fetchComments}
      />
    </>
  );
};

export default Post;
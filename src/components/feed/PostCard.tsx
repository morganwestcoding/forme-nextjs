'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Play,
  MoreHorizontal,
  MapPin,
  Tag,
  Eye
} from 'lucide-react';

import { SafePost, SafeUser } from '@/app/types';
import { categories } from '@/components/Categories';
import { Button } from '../ui/button';
import HeartButton from '@/components/HeartButton';

interface PostCardProps {
  post: SafePost;
  currentUser?: SafeUser | null;
  categories: any[];
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  categories
}) => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Find category for styling
  const category = categories.find(cat => cat.label === post.category);
  const categoryColor = category?.color || 'bg-blue-500';

  // Format date
  const formattedDate = format(new Date(post.createdAt), 'MMM dd');

  // Determine if post has media
  const hasImage = post.imageSrc || post.mediaUrl;
  const isVideo = post.mediaType === 'video';
  const isGif = post.mediaType === 'gif';

  const handleClick = () => {
    router.push(`/post/${post.id}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${post.user.id}`);
  };

  const handleInteraction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    console.log(`${action} clicked for post ${post.id}`);
  };

  return (
    <>
      <div 
        ref={cardRef}
        className="bg-white rounded-3xl shadow overflow-hidden max-w-xl cursor-pointer hover:shadow-lg transition-all duration-300 group relative"
        onClick={handleClick}
        onMouseEnter={() => setShowStats(true)}
        onMouseLeave={() => setShowStats(false)}
      >
        {/* Media Header Section with Overlay Content */}
        <div className="relative h-[400px] overflow-hidden">
          {hasImage ? (
            <>
              <Image
                src={post.imageSrc || post.mediaUrl || ''}
                alt={`Post by ${post.user.name}`}
                fill
                className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </>
          ) : (
            // Text-only posts - clean background with centered content
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center p-6">
              <p className="text-gray-800 text-sm font-medium text-center leading-relaxed">
                {post.content.length > 350 ? post.content.substring(0, 350) + '...' : post.content}
              </p>
            </div>
          )}

          {/* Video/GIF Play Overlay */}
          {(isVideo || isGif) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-4 shadow-lg">
                <Play className="w-8 h-8 text-gray-700" />
              </div>
            </div>
          )}

          {/* Category Tag */}
          {post.category && (
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-black/40 border border-white backdrop-blur-sm rounded-lg text-center justify-center w-20 py-1.5 text-white">
                <span className="text-xs text-center">{post.category}</span>
              </div>
            </div>
          )}

          {/* More Options */}
          <button 
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            onClick={(e) => handleInteraction(e, 'more')}
          >
            <MoreHorizontal className="w-4 h-4 text-white" />
          </button>

          {/* Bottom Overlay - User Info Only */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={post.user.image || '/images/placeholder.jpg'}
                    alt={post.user.name || 'User'}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div 
                  className="cursor-pointer hover:opacity-80 flex-1"
                  onClick={handleUserClick}
                >
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-black text-sm">
                      {post.user.name || 'Anonymous'}
                    </p>
                    {/* Verification Badge */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" color="#519872" fill="#519872" className="flex-shrink-0">
                      <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="#519872" strokeWidth="1.5" />
                      <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="#519872" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-xs">
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Stats Bar - Portal Style */}
      {showStats && (
        <div 
          className="fixed z-50 pointer-events-auto"
          style={{
            left: cardRef.current ? cardRef.current.getBoundingClientRect().right + 16 : 0,
            top: cardRef.current ? cardRef.current.getBoundingClientRect().top + 16 : 0,
          }}
          onMouseEnter={() => setShowStats(true)}
          onMouseLeave={() => setShowStats(false)}
        >
          <div className="bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 flex flex-col gap-4 min-w-[80px] animate-in fade-in-0 slide-in-from-left-2 duration-200">
            <button 
              className="flex flex-col items-center gap-2 hover:bg-gray-50 rounded-xl p-3 transition-colors cursor-pointer"
              onClick={(e) => handleInteraction(e, 'like')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ef4444" fill="none">
                <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">{post.likes?.length || 0}</span>
              <span className="text-xs text-gray-500 font-medium">Likes</span>
            </button>
            
            <button 
              className="flex flex-col items-center gap-2 hover:bg-gray-50 rounded-xl p-3 transition-colors cursor-pointer"
              onClick={(e) => handleInteraction(e, 'share')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#3b82f6" fill="none">
                <path d="M21 6.5C21 8.15685 19.6569 9.5 18 9.5C16.3431 9.5 15 8.15685 15 6.5C15 4.84315 16.3431 3.5 18 3.5C19.6569 3.5 21 4.84315 21 6.5Z" stroke="currentColor" strokeWidth="2" />
                <path d="M9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12Z" stroke="currentColor" strokeWidth="2" />
                <path d="M21 17.5C21 19.1569 19.6569 20.5 18 20.5C16.3431 20.5 15 19.1569 15 17.5C15 15.8431 16.3431 14.5 18 14.5C19.6569 14.5 21 15.8431 21 17.5Z" stroke="currentColor" strokeWidth="2" />
                <path d="M8.72852 10.7495L15.2285 7.75M8.72852 13.25L15.2285 16.2495" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">24</span>
              <span className="text-xs text-gray-500 font-medium">Shares</span>
            </button>
            
            <button 
              className="flex flex-col items-center gap-2 hover:bg-gray-50 rounded-xl p-3 transition-colors cursor-pointer"
              onClick={(e) => handleInteraction(e, 'save')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#f59e0b" fill="none">
                <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.07682 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">{post.bookmarks?.length || 0}</span>
              <span className="text-xs text-gray-500 font-medium">Saves</span>
            </button>
            
            <button 
              className="flex flex-col items-center gap-2 hover:bg-gray-50 rounded-xl p-3 transition-colors cursor-pointer"
              onClick={(e) => handleInteraction(e, 'view')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#6b7280" fill="none">
                <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="2" />
                <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">1.2k</span>
              <span className="text-xs text-gray-500 font-medium">Views</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
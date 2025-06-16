'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Play, MoreHorizontal } from 'lucide-react';
import { SafePost, SafeUser } from '@/app/types';
import { categories } from '@/components/Categories';
import usePostModal from '@/app/hooks/usePostModal';
import { usePostStore } from '@/app/hooks/usePostStore';

interface PostCardProps {
  post: SafePost;
  currentUser?: SafeUser | null;
  categories: any[];
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, currentUser, categories }) => {
  const postModal = usePostModal();
  const router = useRouter();
  
  // Get updated post data from store
  const { posts } = usePostStore();
  const post = posts.find(p => p.id === initialPost.id) || initialPost;
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [statsPosition, setStatsPosition] = useState({ left: 0, top: 0, height: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const category = categories.find(cat => cat.label === post.category);
  const formattedDate = format(new Date(post.createdAt), 'MMM dd');
  const isReel = post.tag === 'Reel' || post.postType === 'reel';

  const handleClick = async () => {
    if (!currentUser) return;

    try {
      // Always fetch fresh data when opening modal using your correct endpoint
      const res = await axios.get(`/api/post/${post.id}`);
      const freshPost = res.data;
      postModal.onOpen(freshPost, currentUser);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      // Fallback to current post data if API fails
      postModal.onOpen(post, currentUser);
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${post.user.id}`);
  };

  const handleInteraction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    console.log(`${action} clicked`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowStats(true);
    setTimeout(() => setStatsVisible(true), 100);
    
    // Auto-play video for reels
    if (isReel && videoRef.current && post.mediaType === 'video') {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowStats(false);
    setTimeout(() => setStatsVisible(false), 300);
    
    // Pause video for reels
    if (isReel && videoRef.current && post.mediaType === 'video') {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Lock stats bar to card
  useEffect(() => {
    let animationFrameId: number;

    const updateStatsPosition = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setStatsPosition({
          left: rect.right + 16,
          top: rect.top,
          height: rect.height
        });
        animationFrameId = requestAnimationFrame(updateStatsPosition);
      }
    };

    if (showStats) {
      animationFrameId = requestAnimationFrame(updateStatsPosition);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [showStats]);

  const renderMedia = () => {
    if (isReel) {
      // For reels, media takes up entire card
      if (post.mediaType === 'video' && (post.mediaUrl || post.imageSrc)) {
        return (
          <video
            ref={videoRef}
            src={post.mediaUrl || post.imageSrc || ''}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        );
      } else if (post.mediaUrl || post.imageSrc) {
        return (
          <Image
            src={post.mediaUrl || post.imageSrc || ''}
            alt={`Reel by ${post.user.name}`}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
        );
      }
    } else {
      // Regular posts
      if (post.imageSrc) {
        return (
          <>
            <Image
              src={post.imageSrc}
              alt={`Post by ${post.user.name}`}
              fill
              className={`object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </>
        );
      } else {
        return (
          <div className="absolute inset-0 -mt-6 flex items-center justify-center p-6">
            <p className="text-gray-800 text-sm font-medium text-center leading-relaxed">
              {post.content.length > 350 ? post.content.substring(0, 350) + '...' : post.content}
            </p>
          </div>
        );
      }
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className="bg-white rounded-3xl shadow overflow-hidden max-w-xl cursor-pointer hover:shadow-lg transition-all duration-300 group relative"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative h-[400px] overflow-hidden">
          {renderMedia()}

          {/* Category badge */}
          {post.category && (
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-neutral-100 text-neutral-600 border rounded-lg text-center w-20 py-1.5">
                <span className="text-xs">{post.category}</span>
              </div>
            </div>
          )}

          {/* More options button */}
          <button
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            onClick={(e) => handleInteraction(e, 'more')}
          >
            <MoreHorizontal className="w-4 h-4 text-white" />
          </button>

          {/* User info overlay - transparent for reels, opaque for regular posts */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className={`${isReel ? 'bg-transparent' : 'bg-neutral-100 backdrop-blur-md border'} rounded-2xl p-4`}>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Image
                    src={post.user.image || '/images/placeholder.jpg'}
                    alt={post.user.name || 'User'}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div onClick={handleUserClick} className="cursor-pointer flex-1 hover:opacity-80">
                  <div className="flex items-center gap-1">
                    <p className={`font-semibold text-sm ${isReel ? 'text-white' : 'text-black'}`}>
                      {post.user.name || 'Anonymous'}
                    </p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#60A5FA">
                      <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="#ffffff" strokeWidth="1.5" />
                      <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className={`text-xs ${isReel ? 'text-white/80' : 'text-gray-600'}`}>
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add gradient overlay for reels to ensure text readability */}
          {isReel && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* Stats sidebar 
      {statsPosition.left !== 0 && statsPosition.top !== 0 && (
        <div
          className={`fixed z-50 pointer-events-auto w-[80px] bg-white backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 flex flex-col justify-between transition-opacity duration-500 ${statsVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{
            left: statsPosition.left,
            top: statsPosition.top,
            height: statsPosition.height
          }}
          onMouseEnter={() => {
            setShowStats(true);
            setStatsVisible(true);
          }}
          onMouseLeave={() => {
            setShowStats(false);
            setTimeout(() => setStatsVisible(false), 300);
          }}
        >
          <div className="flex flex-col items-center gap-4 text-gray-500 text-sm font-semibold">
            
            {/* Comments - Updated to show current count 
            <div className="flex flex-col items-center gap-1 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M6.09881 19C4.7987 18.8721 3.82475 18.4816 3.17157 17.8284C2 16.6569 2 14.7712 2 11V10.5C2 6.72876 2 4.84315 3.17157 3.67157C4.34315 2.5 6.22876 2.5 10 2.5H14C17.7712 2.5 19.6569 2.5 20.8284 3.67157C22 4.84315 22 6.72876 22 10.5V11C22 14.7712 22 16.6569 20.8284 17.8284C19.6569 19 17.7712 19 14 19C13.4395 19.0125 12.9931 19.0551 12.5546 19.155C11.3562 19.4309 10.2465 20.0441 9.14987 20.5789C7.58729 21.3408 6.806 21.7218 6.31569 21.3651C5.37769 20.6665 6.29454 18.5019 6.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
              </svg>
              <span>{post.comments?.length || 0}</span>
            </div>

            {/* Likes - Updated to show current count 
            <div className="flex flex-col items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{post.likes?.length || 0}</span>
            </div>

            {/* Bookmarks - NEW: Added bookmark display 
            <div className="flex flex-col items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{post.bookmarks?.length || 0}</span>
            </div>

            {/* Shares *
            <div className="flex flex-col items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>24</span>
            </div>
          </div>

          {/* Bottom SVG *
          <div className="mt-auto flex justify-center pt-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
              <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11.992 12H12.001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.9959 12H16.0049" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.9959 12H8.00488" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}*/}
    </>
  );
};

export default PostCard;
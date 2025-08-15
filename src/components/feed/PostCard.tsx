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
  
  // Get updated post data from store and all posts for carousel
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
      // Find the index of the current post in the posts array
      const postIndex = posts.findIndex(p => p.id === post.id);
      
      // Always fetch fresh data when opening modal using your correct endpoint
      const res = await axios.get(`/api/post/${post.id}`);
      const freshPost = res.data;
      
      // Open modal with all posts and starting index for carousel functionality
      postModal.onOpen(
        freshPost,    // Current post (fresh data)
        currentUser,  // Current user
        undefined,    // onUpdate callback (optional)
        posts,        // Array of all posts for carousel
        postIndex >= 0 ? postIndex : 0 // Starting index (fallback to 0 if not found)
      );
    } catch (err) {
      console.error('Failed to fetch post:', err);
      
      // Fallback to current post data if API fails
      const postIndex = posts.findIndex(p => p.id === post.id);
      postModal.onOpen(
        post,         // Current post (cached data)
        currentUser,  // Current user
        undefined,    // onUpdate callback (optional)
        posts,        // Array of all posts for carousel
        postIndex >= 0 ? postIndex : 0 // Starting index (fallback to 0 if not found)
      );
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
        className="bg-white rounded-2xl shadow overflow-hidden max-w-xl cursor-pointer hover:shadow-lg transition-all duration-300 group relative"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative h-[400px] overflow-hidden">
          {renderMedia()}

          {/* Category badge */}
          {post.category && (
            <div className="bg-white/90 top-4 left-4 absolute backdrop-blur-md border border-white/30 rounded-xl text-center w-24 py-2 shadow hover:bg-white/30 transition-all duration-300">
              <div className="flex items-center justify-center gap-1.5">
        
                <span className="text-xs font-normal text-black tracking-wide">{post.category}</span>
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
    </>
  );
};

export default PostCard;
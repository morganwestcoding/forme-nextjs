// components/posts/PostCard.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format, differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { SafePost, SafeUser } from '@/app/types';
import usePostModal from '@/app/hooks/usePostModal';
import { usePostStore } from '@/app/hooks/usePostStore';

interface PostCardProps {
  post: SafePost;
  currentUser?: SafeUser | null;
  categories: any[];
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, currentUser }) => {
  const postModal = usePostModal();
  const router = useRouter();

  const { posts } = usePostStore();
  const post = posts.find((p) => p.id === initialPost.id) || initialPost;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [statsPosition, setStatsPosition] = useState({ left: 0, top: 0, height: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isReel = post.tag === 'Reel' || post.postType === 'reel';
  const isTextPost = !post.imageSrc && !post.mediaUrl;

  /** ---------- Helpers ---------- */
  const formatViews = (n: number | undefined | null) => {
    const v = typeof n === 'number' ? n : 0;
    if (v < 1000) return `${v}`;
    if (v < 1_000_000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  };

  // Show minutes/hours/days until the post is 1 month old; then switch to M.d.yy (e.g., 6.11.25)
  const getPrettyTime = (iso: string) => {
    const created = new Date(iso);
    const now = new Date();
    if (differenceInMonths(now, created) >= 1) {
      return format(created, 'M.d.yy');
    }
    const mins = differenceInMinutes(now, created);
    if (mins < 60) return `${mins}m`;
    const hrs = differenceInHours(now, created);
    if (hrs < 24) return `${hrs}h`;
    const days = differenceInDays(now, created);
    return `${days}d`;
  };

  const prettyTime = getPrettyTime(post.createdAt);
  const viewsLabel = `${formatViews((post as any).views) || '0'} views`;

  /** ---------- Handlers ---------- */
  const handleCardClick = async () => {
    if (!currentUser) return;
    try {
      const postIndex = posts.findIndex((p) => p.id === post.id);
      const res = await axios.get(`/api/post/${post.id}`);
      const freshPost = res.data;
      postModal.onOpen(freshPost, currentUser, undefined, posts, postIndex >= 0 ? postIndex : 0);
    } catch (err) {
      const postIndex = posts.findIndex((p) => p.id === post.id);
      postModal.onOpen(post, currentUser, undefined, posts, postIndex >= 0 ? postIndex : 0);
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${post.user.id}`);
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    // open your more menu here
  };

  const handleMouseEnter = () => {
    setShowStats(true);
    setTimeout(() => setStatsVisible(true), 100);
    if (isReel && videoRef.current && post.mediaType === 'video') {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleMouseLeave = () => {
    setShowStats(false);
    setTimeout(() => setStatsVisible(false), 300);
    if (isReel && videoRef.current && post.mediaType === 'video') {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    let id: number;
    const update = () => {
      if (cardRef.current) {
        const r = cardRef.current.getBoundingClientRect();
        setStatsPosition({ left: r.right + 16, top: r.top, height: r.height });
        id = requestAnimationFrame(update);
      }
    };
    if (showStats) id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, [showStats]);

  const renderMedia = () => {
    if (isReel) {
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
      }
      if (post.mediaUrl || post.imageSrc) {
        return (
          <Image
            src={post.mediaUrl || post.imageSrc || ''}
            alt={`Reel by ${post.user.name}`}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
        );
      }
    } else if (post.imageSrc) {
      return (
        <>
          <Image
            src={post.imageSrc}
            alt={`Post by ${post.user.name}`}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
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
  };

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl max-w-[250px]"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Match ListingCard height */}
      <div className="relative h-[350px]">
        {renderMedia()}

        {/* More button */}
        <button
          className={`absolute right-4 top-4 rounded-full p-2 backdrop-blur-sm transition-colors ${
            isTextPost 
              ? 'bg-gray-200/80 hover:bg-gray-300/80' 
              : 'bg-white/20 hover:bg-white/30'
          }`}
          onClick={handleMore}
        >
          <MoreHorizontal className={`h-4 w-4 ${isTextPost ? 'text-gray-600' : 'text-white'}`} />
        </button>

        {/* User bar at bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`backdrop-blur-md rounded-xl p-3 shadow-sm ${
            isTextPost 
              ? 'bg-gray-50 border border-gray-200' 
              : 'bg-white/10 border border-white/30'
          }`}>
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className={`relative h-9 w-9 overflow-hidden rounded-full ${
                isTextPost ? 'border border-gray-300' : 'border border-white/50'
              }`}>
                <Image
                  src={post.user.image || '/images/placeholder.jpg'}
                  alt={post.user.name || 'User'}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Name + time */}
              <div onClick={handleUserClick} className="cursor-pointer flex flex-col">
                <div className={`flex items-center gap-1 ${
                  isTextPost ? 'text-gray-700' : 'text-white'
                }`}>
                  <p className="text-xs">
                    {post.user.name || 'Anonymous'}
                  </p>
                  {/* Verified Badge SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="#60A5FA"
                    className="shrink-0"
                  >
                    <path
                      d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9 12.8929L10.8 14.5L15 9.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className={`text-xs leading-tight ${
                  isTextPost ? 'text-gray-500' : 'text-white/80'
                }`}>
                  {prettyTime} • {viewsLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-2" />
    </div>
  );
};

export default PostCard;
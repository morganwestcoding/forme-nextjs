// components/posts/PostCard.tsx
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format, differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths } from 'date-fns';
import { SafePost, SafeUser } from '@/app/types';
import usePostModal from '@/app/hooks/usePostModal';
import { usePostStore } from '@/app/hooks/usePostStore';
import HeartButton from '../HeartButton';

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
  const videoRef = useRef<HTMLVideoElement>(null);

  const isTextPost = !post.imageSrc && !post.mediaUrl;
  const isVideo = post.mediaType === 'video';

  /** ---------- Helpers ---------- */
  const formatViews = (n: number | undefined | null) => {
    const v = typeof n === 'number' ? n : 0;
    if (v < 1000) return `${v}`;
    if (v < 1_000_000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  };

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

  const handleMouseEnter = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const handleMouseLeave = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const renderBackground = () => {
    if (isTextPost) {
      // Text post - create a gradient background
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="text-white text-sm font-medium text-center leading-relaxed drop-shadow-lg">
              {post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}
            </p>
          </div>
        </div>
      );
    }

    // Media post (image/video)
    if (isVideo) {
      return (
        <video
          ref={videoRef}
          src={post.mediaUrl || post.imageSrc || ''}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          muted
          loop
          playsInline
        />
      );
    }

    return (
      <Image
        src={post.mediaUrl || post.imageSrc || ''}
        alt={`Post by ${post.user.name}`}
        fill
        className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        sizes="(max-width:768px) 100vw, 33vw"
        priority={false}
      />
    );
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="
        group cursor-pointer relative overflow-hidden
        rounded-xl bg-white shadow-lg transition-all duration-300
        hover:shadow-xl
        max-w-[250px]"
    >
      {/* Background media/content */}
      <div className="absolute inset-0 z-0">
        {renderBackground()}
        
        {/* Gradient overlay - same as ListingCard */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top,' +
              'rgba(0,0,0,0.98) 0%,' +
              'rgba(0,0,0,0.96) 12%,' +
              'rgba(0,0,0,0.90) 26%,' +
              'rgba(0,0,0,0.70) 42%,' +
              'rgba(0,0,0,0.45) 56%,' +
              'rgba(0,0,0,0.20) 70%,' +
              'rgba(0,0,0,0.06) 82%,' +
              'rgba(0,0,0,0.00) 90%,' +
              'rgba(0,0,0,0.00) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>

      <div className="relative z-10">
        <div className="relative h-[350px]">
          {/* Heart Button - top right */}
          <div className="absolute top-4 right-4 z-20">
            <HeartButton
              listingId={post.id}
              currentUser={currentUser}
              variant="default"
            />
          </div>

          {/* Bottom info - user details only */}
          <div className="absolute bottom-5 left-5 right-5 z-20">
            {/* User info with improved layout - avatar spans both name and time rows */}
            <div className="flex items-start gap-2.5">
              <div 
                className="relative h-10 w-10 overflow-hidden rounded-full border border-white/50 cursor-pointer flex-shrink-0"
                onClick={handleUserClick}
              >
                <Image
                  src={post.user.image || '/images/placeholder.jpg'}
                  alt={post.user.name || 'User'}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              
              <div className="flex flex-col justify-center min-h-[40px]">
                {/* Name with verification badge */}
                <h1 className="text-white text-sm leading-5 font-semibold drop-shadow flex items-center">
                  <span 
                    className="cursor-pointer hover:text-white/80"
                    onClick={handleUserClick}
                  >
                    {post.user.name || 'Anonymous'}
                  </span>
                  <span className="inline-flex items-center ml-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      className="text-white/90 shrink-0"
                      aria-label="Verified"
                    >
                      <path
                        d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="#60A5FA"
                      />
                      <path
                        d="M9 12.8929L10.8 14.5L15 9.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Time and views */}
                <div className="text-white/90 text-[11px] leading-4 opacity-90 font-light">
                  {prettyTime} • {viewsLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-2" />
      </div>
    </div>
  );
};

export default PostCard;
// components/posts/PostCard.tsx
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { SafePost, SafeUser, MediaOverlay } from '@/app/types';
import usePostModal from '@/app/hooks/usePostModal';
import { usePostStore } from '@/app/hooks/usePostStore';
import HeartButton from '../HeartButton';
import VerificationBadge from '../VerificationBadge';

interface PostCardProps {
  post: SafePost;
  currentUser?: SafeUser | null;
  categories: any[];
  variant?: 'default' | 'listing';
  hideUserInfo?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, currentUser, variant = 'default', hideUserInfo = false }) => {
  const postModal = usePostModal();
  const router = useRouter();

  const { posts } = usePostStore();
  const post = posts.find((p) => p.id === initialPost.id) || initialPost;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isTextPost = !post.imageSrc && !post.mediaUrl;
  const isVideo = post.mediaType === 'video';
  const hasThumbnail = isVideo && post.thumbnailUrl;

  /** ---------- Handlers ---------- */
  const handleCardClick = async () => {
    try {
      const postIndex = posts.findIndex((p) => p.id === post.id);
      const res = await axios.get(`/api/post/${post.id}`);
      const freshPost = res.data;
      postModal.onOpen(freshPost, currentUser, undefined, posts, postIndex >= 0 ? postIndex : 0);

      // Increment view count (fire and forget)
      axios.post(`/api/post/${post.id}/view`).catch(() => {});
    } catch (err) {
      const postIndex = posts.findIndex((p) => p.id === post.id);
      postModal.onOpen(post, currentUser, undefined, posts, postIndex >= 0 ? postIndex : 0);

      // Still increment view even on error
      axios.post(`/api/post/${post.id}/view`).catch(() => {});
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${post.user.id}`);
  };

  const handleMouseEnter = () => {
    if (isVideo && videoRef.current) {
      // Only reset to beginning on first play, otherwise continue from where we left off
      if (!hasPlayed) {
        videoRef.current.currentTime = 0;
      }
      videoRef.current.play().catch(console.error);

      // Mark as played so thumbnail fades out (and stays hidden)
      if (hasThumbnail && !hasPlayed) {
        if (videoReady) {
          setHasPlayed(true);
        } else {
          // Wait for video to be ready before fading
          const checkReady = () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              setVideoReady(true);
              setHasPlayed(true);
            } else {
              requestAnimationFrame(checkReady);
            }
          };
          checkReady();
        }
      }
    }
  };

  const handleMouseLeave = () => {
    // Just pause - don't fade back to thumbnail, leave video on current frame
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
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
        <>
          {/* Video element - fades in once played, stays visible after */}
          <video
            ref={videoRef}
            src={post.mediaUrl || post.imageSrc || ''}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: hasThumbnail ? (hasPlayed ? 1 : 0) : 1,
              transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setVideoReady(true)}
          />
          {/* Thumbnail overlay - fades out once video plays, stays hidden */}
          {hasThumbnail && (
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                opacity: hasPlayed ? 0 : 1,
                transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Image
                src={post.thumbnailUrl!}
                alt={`Thumbnail for post by ${post.user.name}`}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 33vw"
                priority
              />
            </div>
          )}
        </>
      );
    }

    return (
      <Image
        src={post.mediaUrl || post.imageSrc || ''}
        alt={`Post by ${post.user.name}`}
        fill
        className={`object-cover ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        sizes="(max-width:768px) 100vw, 33vw"
        priority={false}
      />
    );
  };

  const isListingVariant = variant === 'listing';

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        group cursor-pointer relative overflow-hidden
        ${isListingVariant
          ? 'rounded-2xl border border-gray-100 dark:border-neutral-800'
          : 'rounded-xl bg-white dark:bg-neutral-950'}
        transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isListingVariant ? 'hover:shadow-md' : 'hover:-translate-y-0.5 hover:shadow-sm'}
        ${isListingVariant || hideUserInfo ? '' : 'max-w-[250px]'}`}
      style={isListingVariant ? { aspectRatio: '1 / 1' } : undefined}
    >
      {/* Background media/content */}
      <div className={`absolute inset-0 z-0 overflow-hidden ${isListingVariant ? 'rounded-2xl' : 'rounded-xl'}`}>
        {renderBackground()}

        {/* Text Overlay - rendered via CSS to match preview */}
        {post.mediaOverlay && (post.mediaOverlay as MediaOverlay).text && (
          <div
            className="pointer-events-none absolute inset-0 flex p-4 z-10"
            style={{
              justifyContent:
                (post.mediaOverlay as MediaOverlay).pos.endsWith('left') ? 'flex-start' :
                (post.mediaOverlay as MediaOverlay).pos.endsWith('right') ? 'flex-end' :
                'center',
              alignItems:
                (post.mediaOverlay as MediaOverlay).pos.startsWith('top') ? 'flex-start' :
                (post.mediaOverlay as MediaOverlay).pos.startsWith('bottom') ? 'flex-end' :
                'center',
            }}
          >
            <div
              style={{
                fontSize: `${Math.max(12, (post.mediaOverlay as MediaOverlay).size * 0.4)}px`,
                color: (post.mediaOverlay as MediaOverlay).color === 'ffffff' ? '#fff' : '#000',
                textShadow: (post.mediaOverlay as MediaOverlay).color === 'ffffff'
                  ? '1px 1px 3px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)'
                  : '1px 1px 3px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.5)',
                lineHeight: 1.2,
                fontWeight: 700,
                maxWidth: '90%',
                wordBreak: 'break-word',
                textAlign:
                  (post.mediaOverlay as MediaOverlay).pos.endsWith('left') ? 'left' :
                  (post.mediaOverlay as MediaOverlay).pos.endsWith('right') ? 'right' :
                  'center',
              }}
            >
              {(post.mediaOverlay as MediaOverlay).text}
            </div>
          </div>
        )}

        {/* Subtle gradient overlay - lighter feel */}
        {!isListingVariant && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top,' +
                'rgba(0,0,0,0.55) 0%,' +
                'rgba(0,0,0,0.35) 15%,' +
                'rgba(0,0,0,0.15) 35%,' +
                'rgba(0,0,0,0.00) 55%)',
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/0 transition-colors" />
      </div>

      {/* Card content layer */}
      <div className="relative z-10">
        <div className={isListingVariant ? 'relative w-full h-full' : hideUserInfo ? 'relative h-[180px]' : 'relative h-[280px]'}>
          {/* Heart button - top right */}
          {!isListingVariant && (
            <div className="absolute top-3 right-3 z-20">
              <HeartButton
                listingId={post.id}
                currentUser={currentUser}
                variant="default"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hover reveal info bar */}
      {!isListingVariant && !hideUserInfo && (
        <div
          className="absolute -bottom-px left-0 right-0 z-30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <div className="bg-white dark:bg-neutral-900 px-3.5 py-3 rounded-b-xl">
            {/* User row */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group/user"
              onClick={handleUserClick}
            >
              <div className="relative h-7 w-7 overflow-hidden rounded-full flex-shrink-0">
                <Image
                  src={post.user.image || '/images/placeholder.jpg'}
                  alt={post.user.name || 'User'}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
              <span className="text-neutral-900 dark:text-white text-[13px] font-medium truncate transition-opacity duration-300 ease-out group-hover/user:opacity-60">
                {post.user.name || 'Anonymous'}
                {(post.user.verificationStatus === 'verified' || post.user.isSubscribed) && (
                  <span className="inline-flex items-center align-middle ml-1">
                    <VerificationBadge size={12} />
                  </span>
                )}
              </span>
            </div>

            {/* Caption row */}
            {post.content && (
              <div className="mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
                <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed line-clamp-2">
                  {post.content}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
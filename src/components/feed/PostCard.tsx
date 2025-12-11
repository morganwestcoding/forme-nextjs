// components/posts/PostCard.tsx
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format, differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths } from 'date-fns';
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
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, currentUser, variant = 'default' }) => {
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
  const viewsLabel = `${formatViews(post.viewedBy?.length ?? 0)} views`;

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
      videoRef.current.play().catch(console.error);
    }
  };

  const handleMouseLeave = () => {
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
        ${isListingVariant ? 'rounded-2xl border border-gray-100 dark:border-neutral-800' : 'rounded-xl bg-white dark:bg-neutral-950'}
        transition-all duration-300 ease-out
        ${isListingVariant ? 'hover:shadow-md' : 'hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10'}
        ${isListingVariant ? '' : 'max-w-[250px]'}`}
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

        {/* Gradient overlay - matching ListingCard/ShopCard style */}
        {!isListingVariant && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top,' +
                'rgba(0,0,0,0.72) 0%,' +
                'rgba(0,0,0,0.55) 18%,' +
                'rgba(0,0,0,0.32) 38%,' +
                'rgba(0,0,0,0.12) 55%,' +
                'rgba(0,0,0,0.00) 70%)',
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/0 transition-colors" />
      </div>

      <div className="relative z-10">
        <div className={isListingVariant ? 'relative w-full h-full' : 'relative h-[280px]'}>
          {/* Heart Button - top right - only show for default variant */}
          {!isListingVariant && (
            <div className="absolute top-4 right-4 z-20">
              <HeartButton
                listingId={post.id}
                currentUser={currentUser}
                variant="default"
              />
            </div>
          )}

          {/* Bottom info - user details - only show for default variant */}
          {!isListingVariant && (
            <div className="absolute bottom-4 left-4 right-4 z-20">
              {/* User info */}
              <div className="flex items-center gap-2">
                <div
                  className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white/30 cursor-pointer flex-shrink-0"
                  onClick={handleUserClick}
                >
                  <Image
                    src={post.user.image || '/images/placeholder.jpg'}
                    alt={post.user.name || 'User'}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center min-w-0 flex-1 -mt-2">
                  {/* Name with verification badge */}
                  <div>
                    <h1 className="text-white text-xs leading-tight font-semibold drop-shadow">
                      {(() => {
                        const name = post.user.name || 'Anonymous';
                        const words = name.split(' ');
                        const isVerified = post.user.verificationStatus === 'verified' || post.user.isSubscribed;
                        const firstWords = words.slice(0, -1).join(' ');
                        const lastWord = words[words.length - 1];

                        return (
                          <span className="cursor-pointer hover:text-white/80" onClick={handleUserClick}>
                            {firstWords && <>{firstWords} </>}
                            <span className="whitespace-nowrap">
                              {lastWord}
                              {isVerified && (
                                <span className="inline-flex items-center align-middle ml-1" aria-label="Verified">
                                  <VerificationBadge size={16} />
                                </span>
                              )}
                            </span>
                          </span>
                        );
                      })()}
                    </h1>
                  </div>

                  {/* Time and views */}
                  <div className="text-white/90 text-[10px] leading-none mt-0.5">
                    <span className="line-clamp-1">{prettyTime} · {viewsLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pb-2" />
      </div>
    </div>
  );
};

export default PostCard;
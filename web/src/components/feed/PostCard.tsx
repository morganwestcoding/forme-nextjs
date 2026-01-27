// components/feed/PostCard.tsx
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { SafePost, SafeUser } from '@/app/types';
import usePostModal from '@/app/hooks/usePostModal';
import { usePostStore } from '@/app/hooks/usePostStore';
import HeartButton from '../HeartButton';

interface PostCardProps {
  post: SafePost;
  currentUser?: SafeUser | null;
  categories?: any[];
  variant?: string;
  hideUserInfo?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, currentUser }) => {
  const postModal = usePostModal();
  const { posts } = usePostStore();
  const post = posts.find((p) => p.id === initialPost.id) || initialPost;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isTextPost = !post.imageSrc && !post.mediaUrl;
  const isVideo = post.mediaType === 'video';
  const hasThumbnail = isVideo && post.thumbnailUrl;
  const hasBeforeAfter = Boolean(post.beforeImageSrc) && !isVideo;

  // Debug logging - always log for first few posts
  console.log('[PostCard] Rendering:', {
    id: post.id,
    hasBeforeAfter,
    beforeImageSrc: post.beforeImageSrc || 'NOT SET',
    imageSrc: post.imageSrc ? 'SET' : 'NOT SET',
    isVideo
  });

  const handleCardClick = async () => {
    try {
      const postIndex = posts.findIndex((p) => p.id === post.id);
      const res = await axios.get(`/api/post/${post.id}`);
      postModal.onOpen(res.data, currentUser, undefined, posts, postIndex >= 0 ? postIndex : 0);
      axios.post(`/api/post/${post.id}/view`).catch(() => {});
    } catch {
      const postIndex = posts.findIndex((p) => p.id === post.id);
      postModal.onOpen(post, currentUser, undefined, posts, postIndex >= 0 ? postIndex : 0);
      axios.post(`/api/post/${post.id}/view`).catch(() => {});
    }
  };

  const handleMouseEnter = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
      if (!hasPlayed && (!hasThumbnail || videoReady)) setHasPlayed(true);
    }
    if (hasBeforeAfter) {
      setShowBefore(true);
    }
  };

  const handleMouseLeave = () => {
    if (isVideo && videoRef.current) videoRef.current.pause();
    if (hasBeforeAfter) {
      setShowBefore(false);
    }
  };

  // Format date
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer rounded-xl border border-stone-300/90 p-3 transition-all duration-300 hover:border-stone-400 hover:shadow-sm w-full"
      style={{
        background: 'linear-gradient(to bottom, #FAFAF9, #F7F7F6)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
      }}
    >
      {/* Media container */}
      <div
        className="relative overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900"
        style={{ aspectRatio: '1' }}
      >
      {/* Text post */}
      {isTextPost ? (
        <>
          {/* White background */}
          <div className="absolute inset-0 bg-white" />

          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.3]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #a8a29e 0.5px, transparent 0)`,
              backgroundSize: '16px 16px',
            }}
          />

          {/* Text content */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="text-neutral-800 text-[13px] leading-relaxed font-medium text-center line-clamp-6 break-words whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Quote mark accent */}
          <div className="absolute top-3 left-3 text-stone-300 text-3xl font-serif leading-none select-none">
            "
          </div>

          {/* Closing quote mark */}
          <div className="absolute bottom-2 right-3 text-stone-300 text-3xl font-serif leading-none select-none rotate-180">
            "
          </div>
        </>
      ) : isVideo ? (
        <>
          <video
            ref={videoRef}
            src={post.mediaUrl || post.imageSrc || ''}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ opacity: hasThumbnail ? (hasPlayed ? 1 : 0) : 1, transition: 'opacity 400ms' }}
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => { setVideoReady(true); if (!hasPlayed) setHasPlayed(true); }}
          />
          {hasThumbnail && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-400"
              style={{ opacity: hasPlayed ? 0 : 1 }}
            >
              <Image src={post.thumbnailUrl!} alt="" fill className="object-cover" sizes="300px" priority />
            </div>
          )}
          {/* Video indicator - subtle */}
          <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </>
      ) : hasBeforeAfter ? (
        <>
          {/* Before image (underneath) */}
          <Image
            src={post.beforeImageSrc || ''}
            alt=""
            fill
            className="object-cover"
            sizes="300px"
          />
          {/* After image with clip reveal */}
          <div
            className="absolute inset-0 transition-[clip-path] duration-500 ease-out"
            style={{
              clipPath: showBefore
                ? 'inset(0 100% 0 0)'
                : 'inset(0 0% 0 0)',
            }}
          >
            <Image
              src={post.mediaUrl || post.imageSrc || ''}
              alt=""
              fill
              className="object-cover"
              onLoad={() => setImageLoaded(true)}
              sizes="300px"
            />
          </div>
          {/* Slider line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-500 ease-out z-10"
            style={{
              left: showBefore ? '0%' : '100%',
              opacity: showBefore ? 1 : 0,
            }}
          />
          {/* Centered labels with crossfade */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
            <div className="relative w-[52px] h-[26px]">
              {/* Before label */}
              <span
                className={`
                  absolute inset-0 flex items-center justify-center
                  rounded-md text-[11px] font-medium
                  bg-white/95 text-neutral-900 backdrop-blur-md
                  transition-all duration-500 ease-out
                  ${showBefore ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}
                `}
              >
                Before
              </span>
              {/* After label */}
              <span
                className={`
                  absolute inset-0 flex items-center justify-center
                  rounded-md text-[11px] font-medium
                  bg-white/95 text-neutral-900 backdrop-blur-md
                  transition-all duration-500 ease-out
                  ${showBefore ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'}
                `}
              >
                After
              </span>
            </div>
          </div>
        </>
      ) : (
        <Image
          src={post.mediaUrl || post.imageSrc || ''}
          alt=""
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-[1.02] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          sizes="300px"
        />
      )}
      </div>

      {/* Info section */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {post.user && (
            <div className="flex items-center gap-1.5">
              {post.user.image && (
                <div className="w-5 h-5 rounded-full overflow-hidden relative flex-shrink-0">
                  <Image
                    src={post.user.image}
                    alt={post.user.name || ''}
                    fill
                    className="object-cover"
                    sizes="20px"
                  />
                </div>
              )}
              <span className="text-neutral-900 text-xs font-medium truncate">
                {post.user.name}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            <span>{(post as any).viewCount ?? 0} views</span>
            {post.createdAt && (
              <span>{formatDate(post.createdAt)}</span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 mt-0.5">
          <HeartButton
            listingId={post.id}
            currentUser={currentUser}
            variant="listingHead"
          />
        </div>
      </div>
    </div>
  );
};

export default PostCard;

// ============================================
// PREVIEW COMPONENT - 3 placeholder Work Gallery cards
// ============================================
export const PostCardPreview: React.FC = () => {
  const placeholderPosts = [
    {
      id: 'preview-1',
      imageSrc: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop',
      content: 'Fresh fade for the summer',
      user: { name: 'Marcus Johnson' },
    },
    {
      id: 'preview-2',
      imageSrc: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop',
      content: 'Before & After transformation',
      user: { name: 'Aaliyah Brown' },
      hasBeforeAfter: true,
    },
    {
      id: 'preview-3',
      imageSrc: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop',
      content: 'Summer nails ready',
      user: { name: 'Jordan Lee' },
    },
  ];

  return (
    <div className="p-8 bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">Work Gallery</h2>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8">Clean portfolio cards - tap to expand</p>

      <div className="grid grid-cols-3 gap-3 max-w-[600px]">
        {placeholderPosts.map((post) => (
          <div
            key={post.id}
            className="group cursor-pointer relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 ease-out"
            style={{ aspectRatio: '1' }}
          >
            <img
              src={post.imageSrc}
              alt={post.content}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {/* Before/After indicator - only if applicable */}
            {post.hasBeforeAfter && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <span className="w-[52px] h-[26px] flex items-center justify-center rounded-md text-[11px] font-medium backdrop-blur-md bg-white/95 text-neutral-900">
                  After
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expanded state preview */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Expanded View (on tap)</h3>
        <div className="max-w-[400px] bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl">
          {/* Image */}
          <div className="relative aspect-square">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Creator info */}
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-900 dark:text-white text-sm">Marcus Johnson</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" className="text-violet-500">
                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs">Barber at Fresh Cuts</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xs font-medium">4.9</span>
              </div>
            </div>

            {/* Caption */}
            <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-4">
              Fresh fade for the summer. Book now while slots are available!
            </p>

            {/* Book CTA */}
            <button className="w-full py-3 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Book This Look • $45
            </button>

            {/* Engagement - secondary */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button className="flex items-center gap-1.5 text-neutral-500 hover:text-red-500 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="text-xs">24</span>
              </button>
              <button className="flex items-center gap-1.5 text-neutral-500 hover:text-blue-500 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span className="text-xs">3</span>
              </button>
              <button className="flex items-center gap-1.5 text-neutral-500 hover:text-amber-500 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
              <div className="flex-1" />
              <button className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
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

  const formattedDate = format(new Date(post.createdAt), 'MMM dd');
  const isReel = post.tag === 'Reel' || post.postType === 'reel';

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
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow transition-all duration-300 hover:shadow-lg"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Keep rows tidy */}
      <div className="relative h-[400px]">
        {renderMedia()}

        {/* Category badge */}
        {post.category && (
          <div className="absolute left-4 top-4 w-24 rounded-xl border border-white/30 bg-white/90 py-2 text-center shadow backdrop-blur-md transition-all duration-300 hover:bg-white">
            <span className="text-xs font-normal tracking-wide text-black">{post.category}</span>
          </div>
        )}

        {/* More button */}
        <button
          className="absolute right-4 top-4 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
          onClick={handleMore}
        >
          <MoreHorizontal className="h-4 w-4 text-white" />
        </button>

        {/* ✅ Restored in-card user info with your exact styling */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full">
                <Image
                  src={post.user.image || '/images/placeholder.jpg'}
                  alt={post.user.name || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
              <div onClick={handleUserClick} className="cursor-pointer">
                <p className="text-sm font-semibold text-white">{post.user.name || 'Anonymous'}</p>
                <p className="text-xs text-white/80 leading-tight">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Readability overlay for reels */}
        {isReel && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default PostCard;

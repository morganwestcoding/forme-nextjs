'use client';

const styles = `
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .ultra-smooth {
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }
  
  .video-controls {
    backdrop-filter: blur(20px);
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import axios from 'axios';
import { X } from 'lucide-react';

import usePostModal from '@/app/hooks/usePostModal';
import Avatar from '@/components/ui/avatar';
import ListingCard from '@/components/listings/ListingCard';
import ShopCard from '@/components/shop/ShopCard';
import { SafeListing, SafeShop, SafeComment, SafePost } from '@/app/types';
import { usePostStore } from '@/app/hooks/usePostStore';

const PostModal = () => {
  const postModal = usePostModal();
  const post = postModal.post;
  const currentUser = postModal.currentUser;
  const posts = postModal.posts || [];
  const initialIndex = postModal.initialIndex || 0;
  
  const { updatePost } = usePostStore();

  const [currentPostIndex, setCurrentPostIndex] = useState(initialIndex);
  const [isScrolling, setIsScrolling] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchVelocityRef = useRef(0);
  const lastTouchY = useRef(0);
  const lastTouchTime = useRef(0);

  const currentPost = posts[currentPostIndex] || post;

  const [likes, setLikes] = useState<string[]>([]);
  const [liked, setLiked] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<SafeComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);

  // Simplified video state management
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [videoStates, setVideoStates] = useState<Map<string, {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isMuted: boolean;
  }>>(new Map());

  const userId = useMemo(() => currentUser?.id, [currentUser]);

  // Ultra-smooth navigation
  const navigateToPost = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= posts.length || targetIndex === currentPostIndex) {
      return;
    }

    setIsScrolling(true);
    setCurrentPostIndex(targetIndex);

    if (posts[targetIndex]) {
      postModal.setPost?.(posts[targetIndex]);
    }

    setTimeout(() => {
      setIsScrolling(false);
    }, 250);
  }, [currentPostIndex, posts, postModal]);

  // Enhanced wheel handling
  useEffect(() => {
    if (!containerRef.current || posts.length <= 1) return;

    let wheelAccumulator = 0;
    let wheelTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (isScrolling) return;

      wheelAccumulator += e.deltaY;
      clearTimeout(wheelTimeout);

      wheelTimeout = setTimeout(() => {
        if (Math.abs(wheelAccumulator) > 15) {
          if (wheelAccumulator > 0) {
            navigateToPost(currentPostIndex + 1);
          } else {
            navigateToPost(currentPostIndex - 1);
          }
        }
        wheelAccumulator = 0;
      }, 30);
    };

    const container = containerRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimeout);
    };
  }, [currentPostIndex, isScrolling, navigateToPost, posts.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateToPost(currentPostIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateToPost(currentPostIndex + 1);
          break;
        case ' ':
          e.preventDefault();
          const currentPostId = currentPost?.id;
          if (currentPostId) {
            handlePlayPause(currentPostId);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPostIndex, isScrolling, navigateToPost, currentPost?.id]);

  // Touch handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (posts.length <= 1) return;

    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchStartTime(Date.now());
    setIsDragging(true);
    setDragOffset(0);
    
    lastTouchY.current = touch.clientY;
    lastTouchTime.current = Date.now();
    touchVelocityRef.current = 0;
  }, [posts.length]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || posts.length <= 1) return;

    const touch = e.touches[0];
    const currentTime = Date.now();
    const deltaY = touch.clientY - lastTouchY.current;
    const deltaTime = currentTime - lastTouchTime.current;

    if (deltaTime > 0) {
      touchVelocityRef.current = deltaY / deltaTime;
    }

    const rawOffset = touch.clientY - touchStartY;
    let offset = rawOffset;

    if ((currentPostIndex === 0 && offset > 0) || 
        (currentPostIndex === posts.length - 1 && offset < 0)) {
      offset = rawOffset * 0.25;
    }

    setDragOffset(offset);
    
    lastTouchY.current = touch.clientY;
    lastTouchTime.current = currentTime;
  }, [isDragging, touchStartY, currentPostIndex, posts.length]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    const velocity = touchVelocityRef.current;
    const offset = dragOffset;
    const duration = Date.now() - touchStartTime;

    const velocityThreshold = 0.5;
    const distanceThreshold = window.innerHeight * 0.15;
    const quickSwipeTime = 150;

    let shouldNavigate = false;
    let direction = 0;

    if (Math.abs(velocity) > velocityThreshold) {
      shouldNavigate = true;
      direction = velocity < 0 ? 1 : -1;
    }
    else if (Math.abs(offset) > distanceThreshold) {
      shouldNavigate = true;
      direction = offset < 0 ? 1 : -1;
    }
    else if (duration < quickSwipeTime && Math.abs(offset) > 30) {
      shouldNavigate = true;
      direction = offset < 0 ? 1 : -1;
    }

    if (shouldNavigate && !isScrolling) {
      const targetIndex = currentPostIndex + direction;
      navigateToPost(targetIndex);
    }

    setDragOffset(0);
  }, [isDragging, dragOffset, touchStartTime, currentPostIndex, isScrolling, navigateToPost]);

  // Simplified video functions
  const getVideoState = (postId: string) => {
    return videoStates.get(postId) || {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isMuted: true
    };
  };

  const updateVideoState = (postId: string, updates: Partial<typeof getVideoState>) => {
    setVideoStates(prev => new Map(prev.set(postId, { ...getVideoState(postId), ...updates })));
  };

  // Fixed video ref callback - no infinite loop
  const createVideoRefCallback = (postId: string) => {
    return (video: HTMLVideoElement | null) => {
      if (video && !videoRefs.current.has(postId)) {
        videoRefs.current.set(postId, video);
        
        const handleTimeUpdate = () => updateVideoState(postId, { currentTime: video.currentTime });
        const handleLoadedMetadata = () => updateVideoState(postId, { duration: video.duration });
        const handlePlay = () => updateVideoState(postId, { isPlaying: true });
        const handlePause = () => updateVideoState(postId, { isPlaying: false });

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        // Cleanup function stored on the element
        (video as any)._cleanup = () => {
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
        };
      } else if (!video && videoRefs.current.has(postId)) {
        const oldVideo = videoRefs.current.get(postId);
        if (oldVideo && (oldVideo as any)._cleanup) {
          (oldVideo as any)._cleanup();
        }
        videoRefs.current.delete(postId);
      }
    };
  };

  const handlePlayPause = (postId: string) => {
    const video = videoRefs.current.get(postId);
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const handleProgressClick = (postId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRefs.current.get(postId);
    const state = getVideoState(postId);
    
    if (video && state.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * state.duration;
      video.currentTime = newTime;
    }
  };

  const handleMuteToggle = (postId: string) => {
    const video = videoRefs.current.get(postId);
    if (video) {
      video.muted = !video.muted;
      updateVideoState(postId, { isMuted: video.muted });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update post when index changes
  useEffect(() => {
    if (posts[currentPostIndex]) {
      postModal.setPost?.(posts[currentPostIndex]);
    }
  }, [currentPostIndex, posts]);

  const isReel = currentPost?.tag === 'reel' || currentPost?.postType === 'reel';
  const isAd = currentPost?.postType === 'ad';

  useEffect(() => {
    if (currentPost && userId) {
      setLikes(currentPost.likes || []);
      setLiked(currentPost.likes.includes(userId));
      setBookmarks(currentPost.bookmarks || []);
      setBookmarked(currentPost.bookmarks.includes(userId));
      setComments(currentPost.comments || []);
    }

    setShowComments(false);
    setShowFullCaption(false);

    if (currentPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [currentPost?.id, userId, currentPost?.likes, currentPost?.bookmarks, currentPost?.comments, currentPost]);

  const handleClose = () => {
    postModal.onClose();
  };

  const handleLike = async () => {
    if (!currentPost || !userId) return;

    const hasLiked = likes.includes(userId);
    const updatedLikes = hasLiked
      ? likes.filter(id => id !== userId)
      : [...likes, userId];

    try {
      setLikes(updatedLikes);
      setLiked(!hasLiked);

      updatePost(currentPost.id, {
        likes: updatedLikes,
        bookmarks: bookmarks,
        comments: comments
      });

      const updatedPost = { ...currentPost, likes: updatedLikes };
      postModal.setPost?.(updatedPost);

      await axios.post(`/api/postActions/${currentPost.id}/like`);
      
    } catch (error) {
      console.error('Failed to toggle like:', error);
      
      const originalLikes = currentPost.likes || [];
      setLikes(originalLikes);
      setLiked(originalLikes.includes(userId));
      
      updatePost(currentPost.id, {
        likes: originalLikes,
        bookmarks: bookmarks,
        comments: comments
      });
      
      postModal.setPost?.({ ...currentPost, likes: originalLikes });
    }
  };

  const handleBookmark = async () => {
    if (!currentPost || !userId) return;

    const hasBookmarked = bookmarks.includes(userId);
    const updatedBookmarks = hasBookmarked
      ? bookmarks.filter(id => id !== userId)
      : [...bookmarks, userId];

    try {
      setBookmarks(updatedBookmarks);
      setBookmarked(!hasBookmarked);

      updatePost(currentPost.id, {
        likes: likes,
        bookmarks: updatedBookmarks,
        comments: comments
      });

      const updatedPost = { ...currentPost, bookmarks: updatedBookmarks };
      postModal.setPost?.(updatedPost);

      await axios.post(`/api/postActions/${currentPost.id}/bookmark`);
      
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      
      const originalBookmarks = currentPost.bookmarks || [];
      setBookmarks(originalBookmarks);
      setBookmarked(originalBookmarks.includes(userId));
      
      updatePost(currentPost.id, {
        likes: likes,
        bookmarks: originalBookmarks,
        comments: comments
      });
      
      postModal.setPost?.({ ...currentPost, bookmarks: originalBookmarks });
    }
  };

  const handleShare = async () => {
    if (!currentPost) return;

    try {
      const postUrl = `${window.location.origin}/post/${currentPost.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${currentPost.user.name}`,
          text: currentPost.content.length > 100 ? currentPost.content.substring(0, 100) + '...' : currentPost.content,
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Failed to share:', error);
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${currentPost.id}`);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 2000);
      } catch (clipboardError) {
        console.error('Clipboard failed too:', clipboardError);
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim() || !currentUser || !currentPost) return;
    
    setIsSubmitting(true);

    try {
      const optimisticComment: SafeComment = {
        id: `temp-${Date.now()}`,
        content: comment.trim(),
        createdAt: new Date().toISOString(),
        userId: currentUser.id,
        postId: currentPost.id,
        user: {
          id: currentUser.id,
          name: currentUser.name || 'You',
          image: currentUser.image
        }
      };

      const updatedComments = [...comments, optimisticComment];
      setComments(updatedComments);
      setComment('');

      await axios.post(`/api/postActions/${currentPost.id}/comment`, {
        content: comment.trim()
      });
      
      const res = await axios.get(`/api/post/${currentPost.id}`);
      const updatedPost = res.data;
      
      setComments(updatedPost.comments || []);
      setLikes(updatedPost.likes || []);
      setBookmarks(updatedPost.bookmarks || []);
      
      postModal.setPost?.(updatedPost);
      
      updatePost(currentPost.id, {
        likes: updatedPost.likes,
        bookmarks: updatedPost.bookmarks,
        comments: updatedPost.comments
      });
      
    } catch (error) {
      console.error('Failed to submit comment:', error);
      setComments(comments);
      setComment(comment.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTruncatedCaption = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (!currentPost) return null;

  const listingAd = currentPost.listing as SafeListing | undefined;
  const shopAd = currentPost.shop as SafeShop | undefined;

  if (isAd) {
    return (
      <>
        <style jsx>{styles}</style>
        <div className="fixed inset-0 z-40 bg-black/90" onClick={handleClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full">
            <button
              onClick={handleClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
            {listingAd ? (
              <ListingCard data={listingAd} currentUser={currentPost.user} />
            ) : shopAd ? (
              <ShopCard data={shopAd} currentUser={currentPost.user} />
            ) : null}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx>{styles}</style>
      
      <div className="fixed inset-0 z-40 bg-black" onClick={handleClose} />
      
      <div 
        ref={containerRef}
        className="fixed inset-0 z-50 overflow-hidden ultra-smooth"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          touchAction: 'pan-y pinch-zoom',
          overscrollBehavior: 'none'
        }}
      >
        <div 
          className="relative w-full ultra-smooth"
          style={{ 
            height: `${posts.length * 100}vh`,
            transform: `translate3d(0, ${(-currentPostIndex * 100) + (isDragging ? (dragOffset / window.innerHeight) * 100 : 0)}vh, 0)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            willChange: 'transform'
          }}
        >
          {posts.map((postData, index) => {
            const formattedDate = format(new Date(postData.createdAt), 'PPP');
            const isReelPost = postData?.tag === 'reel' || postData?.postType === 'reel';
            const videoState = getVideoState(postData.id);

            return (
              <div 
                key={postData.id}
                className="absolute top-0 left-0 w-full h-screen ultra-smooth"
                style={{ 
                  transform: `translate3d(0, ${index * 100}vh, 0)`,
                  willChange: 'transform'
                }}
              >
                {isReelPost ? (
                  <div className="w-full h-full relative">
                    {postData.mediaUrl ? (
                      postData.mediaType === 'video' ? (
                        <video
                          ref={createVideoRefCallback(postData.id)}
                          src={postData.mediaUrl}
                          autoPlay={index === currentPostIndex}
                          muted={videoState.isMuted}
                          loop
                          className="w-full h-full object-cover"
                          controls={false}
                          playsInline
                        />
                      ) : (
                        <Image
                          src={postData.mediaUrl}
                          alt="Reel media"
                          fill
                          className="object-cover"
                          priority={index === currentPostIndex}
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                        <p className="text-white text-2xl text-center px-8 max-w-2xl leading-relaxed">{postData.content}</p>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <div className="video-controls p-6 rounded-2xl max-w-lg shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={postData.user.image || '/images/placeholder.jpg'}
                              alt={postData.user.name || 'User'}
                              fill
                              className="rounded-full object-cover border-2 border-white/30"
                            />
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <h3 className="font-semibold text-white text-base drop-shadow-lg">
                              {postData.user.name || 'Anonymous'}
                            </h3>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-white/80 text-sm drop-shadow-lg font-medium">{formattedDate}</p>
                        </div>

                        {postData.content && (
                          <div className="mb-4">
                            <p className="text-white text-sm leading-relaxed drop-shadow-lg">
                              {postData.content}
                            </p>
                          </div>
                        )}
                        
                        {postData.mediaType === 'video' && (
                          <div className="space-y-3">
                            <div 
                              className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors"
                              onClick={(e) => handleProgressClick(postData.id, e)}
                            >
                              <div 
                                className="h-full bg-white rounded-full transition-all duration-150 shadow-sm"
                                style={{ width: `${videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0}%` }}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between text-white text-sm">
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handlePlayPause(postData.id)}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105"
                                >
                                  {videoState.isPlaying ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <rect x="6" y="4" width="4" height="16" rx="1" />
                                      <rect x="14" y="4" width="4" height="16" rx="1" />
                                    </svg>
                                  ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                  )}
                                </button>
                                
                                <span className="font-mono text-white/80 font-medium">
                                  {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
                                </span>
                              </div>
                              
                              <button 
                                onClick={() => handleMuteToggle(postData.id)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105"
                              >
                                {videoState.isMuted ? (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                                    <line x1="23" y1="9" x2="17" y2="15" />
                                    <line x1="17" y1="9" x2="23" y2="15" />
                                  </svg>
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative overflow-hidden w-full max-w-md mx-auto h-[700px] flex flex-col rounded-2xl">
                      {postData.mediaUrl ? (
                        postData.mediaType === 'video' ? (
                          <>
                            <video 
                              ref={createVideoRefCallback(postData.id)}
                              src={postData.mediaUrl} 
                              className="w-full flex-1 object-cover"
                              controls={false}
                              autoPlay={index === currentPostIndex}
                              muted={videoState.isMuted}
                              loop
                              playsInline
                            />
                            
                            <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                              <div className="video-controls rounded-2xl p-6 text-white shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="relative w-10 h-10">
                                    <Image
                                      src={postData.user.image || '/images/placeholder.jpg'}
                                      alt={postData.user.name || 'User'}
                                      fill
                                      className="rounded-full object-cover border-2 border-white/20"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">{postData.user.name || 'Anonymous'}</p>
                                    <p className="text-xs text-white/70">{formattedDate}</p>
                                  </div>
                                </div>
                                
                                {postData.content && (
                                  <div className="mb-4">
                                    <p className="text-sm leading-relaxed text-white/90">
                                      {postData.content}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="space-y-3">
                                  <div 
                                    className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all duration-200"
                                    onClick={(e) => handleProgressClick(postData.id, e)}
                                  >
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300 shadow-lg"
                                      style={{ width: `${videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0}%` }}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-white text-sm">
<div className="flex items-center gap-3">
                                      <button 
                                        onClick={() => handlePlayPause(postData.id)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105"
                                      >
                                        {videoState.isPlaying ? (
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <rect x="6" y="4" width="4" height="16" rx="1" />
                                            <rect x="14" y="4" width="4" height="16" rx="1" />
                                          </svg>
                                        ) : (
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                            <polygon points="5,3 19,12 5,21" />
                                          </svg>
                                        )}
                                      </button>
                                      
                                      <span className="font-mono text-white/80 font-medium">
                                        {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
                                      </span>
                                    </div>
                                    
                                    <button 
                                      onClick={() => handleMuteToggle(postData.id)}
                                      className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105"
                                    >
                                      {videoState.isMuted ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                                          <line x1="23" y1="9" x2="17" y2="15" />
                                          <line x1="17" y1="9" x2="23" y2="15" />
                                        </svg>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="relative flex-1">
                            <Image src={postData.mediaUrl} alt="Post media" fill className="object-cover" />
                            
                            <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                              <div className="video-controls rounded-2xl p-6 text-white shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="relative w-10 h-10">
                                    <Image
                                      src={postData.user.image || '/images/placeholder.jpg'}
                                      alt={postData.user.name || 'User'}
                                      fill
                                      className="rounded-full object-cover border-2 border-white/20"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">{postData.user.name || 'Anonymous'}</p>
                                    <p className="text-xs text-white/70">{formattedDate}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-start gap-2">
                                  <p className={`text-sm leading-relaxed text-white/90 flex-1 ${showFullCaption ? '' : 'line-clamp-1'}`}>
                                    {postData.content}
                                  </p>
                                  {postData.content && postData.content.length > 80 && (
                                    <button
                                      onClick={() => setShowFullCaption(!showFullCaption)}
                                      className="text-white/70 text-xs font-semibold hover:text-white transition-colors flex-shrink-0 drop-shadow-lg px-2 py-1 rounded-full hover:bg-white/10"
                                    >
                                      {showFullCaption ? 'less' : 'more'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="flex-1 bg-white flex items-center justify-center p-8 relative">
                          <p className="text-gray-900 text-lg text-center leading-relaxed">{postData.content}</p>
                          
                          <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                            <div className="video-controls rounded-2xl p-6 text-white shadow-2xl">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="relative w-10 h-10">
                                  <Image
                                    src={postData.user.image || '/images/placeholder.jpg'}
                                    alt={postData.user.name || 'User'}
                                    fill
                                    className="rounded-full object-cover border-2 border-white/20"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{postData.user.name || 'Anonymous'}</p>
                                  <p className="text-xs text-white/70">{formattedDate}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <p className={`text-sm leading-relaxed text-white/90 flex-1 ${showFullCaption ? '' : 'line-clamp-1'}`}>
                                  {postData.content}
                                </p>
                                {postData.content && postData.content.length > 80 && (
                                  <button
                                    onClick={() => setShowFullCaption(!showFullCaption)}
                                    className="text-white/70 text-xs font-semibold hover:text-white transition-colors flex-shrink-0 drop-shadow-lg px-2 py-1 rounded-full hover:bg-white/10"
                                  >
                                    {showFullCaption ? 'less' : 'more'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className={`fixed top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-6 text-white z-30 ${
          currentPost?.tag === 'reel' || currentPost?.postType === 'reel' ? 'right-6' : 'left-1/2 ml-[calc(192px+60px)]'
        }`}>
          <div className="flex flex-col items-center gap-2">
            <button onClick={handleClose} className="hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" />
              </svg>
            </button>
            <span className="text-xs">Close</span>
          </div>

          <div className="border border-white rounded-full">
            <Avatar src={currentPost.user.image ?? undefined} />
          </div>

          <div className="flex flex-col items-center gap-2">
            <button onClick={handleLike} className="hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#f87171' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" />
              </svg>
            </button>
            <span className="text-xs">{likes.length}</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowComments(!showComments)} 
              className="hover:scale-110 transition-transform duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 17.5C6.29454 18.5019 5.37769 20.6665 6.31569 21.3651C6.806 21.7218 7.58729 21.3408 9.14987 20.5789C10.2465 20.0441 11.3562 19.4309 12.5546 19.155C12.9931 19.0551 13.4395 19.0125 14 19C17.7712 19 19.6569 19 20.8284 17.8284C22 16.6569 22 14.7712 22 11V10.5C22 6.72876 22 4.84315 20.8284 3.67157C19.6569 2.5 17.7712 2.5 14 2.5H10C6.22876 2.5 4.34315 2.5 3.17157 3.67157C2 4.84315 2 6.72876 2 10.5V11C2 14.7712 2 16.6569 3.17157 17.8284C3.82475 18.4816 4.7987 18.8721 6.09881 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-xs">{comments.length}</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button onClick={handleBookmark} className="hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={bookmarked ? '#fbbf24' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" />
              </svg>
            </button>
            <span className="text-xs">{bookmarks.length}</span>
          </div>

          <div className="flex flex-col items-center gap-2 relative">
            <button onClick={handleShare} className="hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
                <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
              </svg>
            </button>
            <span className="text-xs">Share</span>
            
            {showShareSuccess && (
              <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                Link copied!
              </div>
            )}
          </div>
        </div>

        <div className={`
          fixed top-0 right-0 h-full w-[375px] z-50 bg-white/95 backdrop-blur-xl border-l border-gray-200
          transform transition-all duration-500 ease-out
          ${showComments ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-medium text-gray-900">Comments</h3>
              <span className="text-gray-500 text-sm">({comments.length})</span>
            </div>
            <button 
              onClick={() => setShowComments(false)} 
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
                    <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M6.09881 19C4.7987 18.8721 3.82475 18.4816 3.17157 17.8284C2 16.6569 2 14.7712 2 11V10.5C2 6.72876 2 4.84315 3.17157 3.67157C4.34315 2.5 6.22876 2.5 10 2.5H14C17.7712 2.5 19.6569 2.5 20.8284 3.67157C22 4.84315 22 6.72876 22 10.5V11C2 14.7712 2 16.6569 3.17157 17.8284C19.6569 19 17.7712 19 14 19C13.4395 19.0125 12.9931 19.0551 12.5546 19.155C11.3562 19.4309 10.2465 20.0441 9.14987 20.5789C7.58729 21.3408 6.806 21.7218 6.31569 21.3651C5.37769 20.6665 6.29454 18.5019 6.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                  </svg>
                </div>
                <p className="text-gray-900 font-medium text-lg mb-2">The conversation starts here</p>
                <p className="text-gray-500 text-sm leading-relaxed">Share your perspective and connect<br />with the community</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <div key={comment.id} className="group relative">
                    <div className="flex gap-4">
                      <div className="relative">
                        <Avatar src={comment.user.image ?? undefined} />
                        {index !== comments.length - 1 && (
                          <div className="absolute left-1/2 top-12 w-px h-8 bg-gradient-to-b from-gray-300 to-transparent -translate-x-px"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                          <span className="font-medium text-gray-900 text-sm">{comment.user.name || 'Anonymous'}</span>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>
                            {(() => {
                              const commentDate = new Date(comment.createdAt);
                              const now = new Date();
                              const diffInHours = (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60);
                              
                              if (diffInHours < 24) {
                                return format(commentDate, 'h:mm a');
                              } else {
                                return format(commentDate, 'MMM d');
                              }
                            })()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-6">
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <div className="relative">
                  <textarea 
                    placeholder="Share your thoughts..." 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && comment.trim()) {
                        e.preventDefault();
                        handleCommentSubmit();
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 pr-16 pb-14 text-sm text-gray-900 placeholder-gray-500 resize-none outline-none focus:border-gray-300 focus:bg-white transition-all duration-300"
                    rows={4}
                    disabled={isSubmitting}
                    style={{
                      minHeight: '100px',
                      maxHeight: '100px'
                    }}
                  />
                  <button 
                    onClick={handleCommentSubmit} 
                    disabled={isSubmitting || !comment.trim()} 
                    className="absolute right-4 bottom-4 w-10 h-10 bg-[#60A5FA] text-white rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostModal;
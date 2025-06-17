'use client';

// Add this CSS for line-clamp support
const styles = `
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

import React, { useState, useEffect, useMemo } from 'react';
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
  const posts = postModal.posts || []; // Array of all posts
  const initialIndex = postModal.initialIndex || 0; // Starting index
  
  // Add store access for updating posts
  const { updatePost } = usePostStore();

  // Current post index state
  const [currentPostIndex, setCurrentPostIndex] = useState(initialIndex);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0); // For smooth transitions

  // Get current post from the posts array
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

  // Video control states
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Touch handling states
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const userId = useMemo(() => currentUser?.id, [currentUser]);

  // Navigation functions with smooth transitions
  const goToNextPost = () => {
    if (currentPostIndex < posts.length - 1 && !isScrolling) {
      setIsScrolling(true);
      setScrollOffset(-100); // Slide to next post
      setTimeout(() => {
        setCurrentPostIndex((prev: number) => prev + 1);
        setScrollOffset(0);
        setIsScrolling(false);
      }, 500); // Much longer delay to see the in-between state
    }
  };

  const goToPrevPost = () => {
    if (currentPostIndex > 0 && !isScrolling) {
      setIsScrolling(true);
      setScrollOffset(100); // Slide to previous post
      setTimeout(() => {
        setCurrentPostIndex((prev: number) => prev - 1);
        setScrollOffset(0);
        setIsScrolling(false);
      }, 500); // Much longer delay to see the in-between state
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevPost();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextPost();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPostIndex, isScrolling]);

  // Add wheel event listener
  useEffect(() => {
    if (!currentPost) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling || posts.length <= 1) return;

      if (e.deltaY > 0) {
        goToNextPost();
      } else {
        goToPrevPost();
      }
    };

    // Attach to window instead of modal element for better reliability
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentPostIndex, isScrolling, posts.length]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      goToNextPost(); // Swipe up
    } else {
      goToPrevPost(); // Swipe down
    }
  };

  // Update post modal when current post changes
  useEffect(() => {
    if (posts[currentPostIndex]) {
      postModal.setPost?.(posts[currentPostIndex]);
    }
  }, [currentPostIndex, posts]); // Removed postModal from dependencies to prevent infinite loop

  // Determine post type
  const isReel = currentPost?.tag === 'reel' || currentPost?.postType === 'reel';
  const isAd = currentPost?.postType === 'ad';
  const isText = currentPost?.postType === 'text';

  useEffect(() => {
    if (currentPost && userId) {
      setLikes(currentPost.likes || []);
      setLiked(currentPost.likes.includes(userId));
      setBookmarks(currentPost.bookmarks || []);
      setBookmarked(currentPost.bookmarks.includes(userId));
      setComments(currentPost.comments || []);
    }

    // Reset video states when post changes
    setShowComments(false);
    setShowFullCaption(false);
    setCurrentTime(0);
    setIsPlaying(false);

    // Prevent body scrolling when modal is open
    if (currentPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [currentPost?.id, userId, currentPost?.likes, currentPost?.bookmarks, currentPost?.comments, currentPost]);

  // Video event handlers
  const handleVideoTimeUpdate = () => {
    if (videoRef) {
      setCurrentTime(videoRef.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef) {
      setDuration(videoRef.duration);
    }
  };

  const handlePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef) {
      videoRef.muted = !videoRef.muted;
      setIsMuted(videoRef.muted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Add wheel event listener
  useEffect(() => {
    if (!currentPost) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling || posts.length <= 1) return;

      if (e.deltaY > 0) {
        goToNextPost();
      } else {
        goToPrevPost();
      }
    };

    // Attach to window instead of modal element for better reliability
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentPostIndex, isScrolling, posts.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevPost();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextPost();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPostIndex, isScrolling]);

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

  // Render a single post
  const renderSinglePost = (postData: SafePost, index: number) => {
    const formattedDate = format(new Date(postData.createdAt), 'PPP');
    const isReel = postData?.tag === 'reel' || postData?.postType === 'reel';
    const isAd = postData?.postType === 'ad';
    const isText = postData?.postType === 'text';

    if (isReel) {
      return (
        <div key={postData.id} className="w-full h-full relative">
          {/* Reel: Full screen media with overlay content */}
          {postData.mediaUrl ? (
            postData.mediaType === 'video' ? (
              <>
                <video
                  src={postData.mediaUrl}
                  autoPlay
                  muted={isMuted}
                  loop
                  className="w-full h-full object-cover"
                  controls={false}
                />
              </>
            ) : (
              <Image
                src={postData.mediaUrl}
                alt="Reel media"
                fill
                className="object-cover"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
              <p className="text-white text-2xl text-center px-8 max-w-2xl leading-relaxed">{postData.content}</p>
            </div>
          )}

          {/* Bottom overlay with structured layout */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl max-w-lg shadow-2xl">
              {/* Row 1: Avatar + Username + Verification Badge */}
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#60A5FA" className="flex-shrink-0">
                    <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="#ffffff" strokeWidth="1.5" />
                    <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Row 2: Date */}
              <div className="mb-4">
                <p className="text-white/80 text-sm drop-shadow-lg font-medium">{formattedDate}</p>
              </div>

              {/* Row 3: Caption with more/less functionality */}
              {postData.content && (
                <div className="mb-4">
                  <div className="flex items-start gap-2">
                    <p className={`text-white text-sm leading-relaxed flex-1 drop-shadow-lg ${showFullCaption ? '' : 'line-clamp-1'}`}>
                      {showFullCaption ? postData.content : getTruncatedCaption(postData.content)}
                    </p>
                    {postData.content.length > 100 && (
                      <button
                        onClick={() => setShowFullCaption(!showFullCaption)}
                        className="text-white/70 text-xs font-semibold hover:text-white transition-colors flex-shrink-0 drop-shadow-lg px-2 py-1 rounded-full hover:bg-white/10"
                      >
                        {showFullCaption ? 'less' : 'more'}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Row 4: Progress Bar (videos only) */}
              {postData.mediaType === 'video' && (
                <div className="mb-4">
                  <div 
                    className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors"
                    onClick={handleProgressClick}
                  >
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-150 shadow-sm"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      /* Regular post or text post: centered container */
      return (
        <div key={postData.id} className="w-full h-full flex items-center justify-center">
          <div className="relative overflow-hidden w-full max-w-md mx-auto h-[600px] flex flex-col rounded-2xl">
            {postData.mediaUrl ? (
              postData.mediaType === 'video' ? (
                <>
                  <video 
                    src={postData.mediaUrl} 
                    className="w-full flex-1 object-cover"
                    controls={false}
                  />
                  
                  {/* Combined User Info and Video Controls */}
                  <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                    <div className="bg-black/70 backdrop-blur-md rounded-2xl p-6 text-white shadow-2xl">
                      {/* User Info Section */}
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
                      
                      {/* Caption with more/less functionality */}
                      <div className="mb-4">
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
                      
                      {/* Modern Progress Bar */}
                      <div 
                        className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 hover:h-2 transition-all duration-200 shadow-inner"
                        onClick={handleProgressClick}
                      >
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300 shadow-lg relative overflow-hidden"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Controls Row */}
                      <div className="flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handlePlayPause}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105"
                          >
                            {isPlaying ? (
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
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>
                        
                        <button 
                          onClick={handleMuteToggle}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105"
                        >
                          {isMuted ? (
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
                </>
              ) : (
                <div className="relative flex-1">
                  <Image src={postData.mediaUrl} alt="Post media" fill className="object-cover" />
                  
                  {/* User Info Overlay for Images */}
                  <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                    <div className="bg-black/70 backdrop-blur-md rounded-2xl p-6 text-white shadow-2xl">
                      {/* User Info Section */}
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
                      
                      {/* Caption with more/less functionality */}
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
              /* Text only post */
              <div className="flex-1 bg-white flex items-center justify-center p-8 relative">
                <p className="text-gray-900 text-lg text-center leading-relaxed">{postData.content}</p>
                
                {/* User Info Overlay for Text Posts */}
                <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                  <div className="bg-black/70 backdrop-blur-md rounded-2xl p-6 text-white shadow-2xl">
                    {/* User Info Section */}
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
                    
                    {/* Caption with more/less functionality */}
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
      );
    }
  };

  if (!currentPost) return null;

  const formattedDate = format(new Date(currentPost.createdAt), 'PPP');
  const listingAd = currentPost.listing as SafeListing | undefined;
  const shopAd = currentPost.shop as SafeShop | undefined;

  // For ads, render the existing card components in a centered modal
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

  // For reels and regular posts, render full viewport
  return (
    <>
      <style jsx>{styles}</style>
      
      {/* Full viewport backdrop */}
      <div className="fixed inset-0 z-40 bg-black" onClick={handleClose} />
      
      {/* Main content area */}
      <div 
        className="fixed inset-0 z-50 flex post-modal-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Post content area - TikTok style smooth scroll container */}
        <div className="flex-1 relative overflow-hidden">
          {/* Smooth scrolling container */}
          <div 
            className="w-full transition-transform duration-1000 ease-out"
            style={{ 
              height: `${posts.length * 100}vh`,
              transform: `translateY(${(-currentPostIndex * 100) + scrollOffset}vh)`
            }}
          >
            {posts.map((postData, index) => (
              <div 
                key={postData.id}
                className="w-full h-screen absolute top-0 left-0"
                style={{ transform: `translateY(${index * 100}vh)` }}
              >
                {renderSinglePost(postData, index)}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons sidebar - positioned right side */}
        <div className="fixed top-1/2 right-6 transform -translate-y-1/2 flex flex-col items-center gap-6 text-white z-30">
          {/* Close button */}
          <div className="flex flex-col items-center gap-2">
            <button onClick={handleClose} className="hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200">
                <path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" />
              </svg>
            </button>
            <span className="text-xs">Close</span>
          </div>

          {/* User avatar */}
          <div className="border border-white rounded-full">
            <Avatar src={currentPost.user.image ?? undefined} />
          </div>

          {/* Like button */}
          <div className="flex flex-col items-center gap-2">
            <button onClick={handleLike} className="hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#f87171' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200">
                <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" />
              </svg>
            </button>
            <span className="text-xs">{likes.length}</span>
          </div>

          {/* Comment toggle */}
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={() => setShowComments(!showComments)} 
              className="hover:scale-110 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 17.5C6.29454 18.5019 5.37769 20.6665 6.31569 21.3651C6.806 21.7218 7.58729 21.3408 9.14987 20.5789C10.2465 20.0441 11.3562 19.4309 12.5546 19.155C12.9931 19.0551 13.4395 19.0125 14 19C17.7712 19 19.6569 19 20.8284 17.8284C22 16.6569 22 14.7712 22 11V10.5C22 6.72876 22 4.84315 20.8284 3.67157C19.6569 2.5 17.7712 2.5 14 2.5H10C6.22876 2.5 4.34315 2.5 3.17157 3.67157C2 4.84315 2 6.72876 2 10.5V11C2 14.7712 2 16.6569 3.17157 17.8284C3.82475 18.4816 4.7987 18.8721 6.09881 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-xs">{comments.length}</span>
          </div>

          {/* Bookmark button */}
          <div className="flex flex-col items-center gap-2">
            <button onClick={handleBookmark} className="hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={bookmarked ? '#fbbf24' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200">
                <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" />
              </svg>
            </button>
            <span className="text-xs">{bookmarks.length}</span>
          </div>

          {/* Share button */}
          <div className="flex flex-col items-center gap-2 relative">
            <button onClick={handleShare} className="hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-200">
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

        {/* Comments slide-out panel */}
        <div className={`
          fixed top-0 right-0 h-full w-[375px] z-50 bg-white/95 backdrop-blur-xl border-l border-gray-200
          transform transition-all duration-500 ease-out
          ${showComments ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {/* Comments header */}
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
          
          {/* Comments list */}
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
          
          {/* Comment input */}
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
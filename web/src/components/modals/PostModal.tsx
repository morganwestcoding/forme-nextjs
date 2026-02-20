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
    background: transparent;
  }

  @keyframes crossfadeMorph {
    0% {
      opacity: 0;
      filter: blur(4px);
    }
    100% {
      opacity: 1;
      filter: blur(0px);
    }
  }

  .avatar-container {
    position: relative;
    border-radius: 50%;
  }

  .avatar-image-morph {
    animation: crossfadeMorph 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
`;

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import axios from 'axios';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import usePostModal from '@/app/hooks/usePostModal';
import Avatar from '@/components/ui/avatar';
import ListingCard from '@/components/listings/ListingCard';
import ShopCard from '@/components/shop/ShopCard';
import { SafeListing, SafeShop, SafeComment, SafePost, MediaOverlay } from '@/app/types';
import { usePostStore } from '@/app/hooks/usePostStore';

const PostModal = () => {
  const router = useRouter();
  const postModal = usePostModal();
  const post = postModal.post;
  const currentUser = postModal.currentUser;
  const posts = postModal.posts || [];
  const initialIndex = postModal.initialIndex || 0;

  const { updatePost } = usePostStore();

  // Global effect to manage body overflow based on modal state
  useEffect(() => {
    if (postModal.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [postModal.isOpen]);

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
  
  // Simple scroll handling - completely ignore scroll strength
  const canScrollRef = useRef(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedDelta = useRef(0);

  const [localPost, setLocalPost] = useState<SafePost | null>(post);

  // Ensure we always have posts to render - fallback to localPost if posts array is empty
  const postsToRender = posts.length > 0 ? posts : (localPost ? [localPost] : []);
  const currentPost = postsToRender[currentPostIndex] || localPost;

  // Reset state when a different post is clicked - use post.id to detect changes
  useEffect(() => {
    if (post) {
      setLocalPost(post);
      setCurrentPostIndex(initialIndex);
      // Reset UI state for new post
      setShowComments(false);
      setShowFullCaption(false);
      setShowMenu(false);
    }
  }, [post?.id, initialIndex]);

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
  const [avatarKey, setAvatarKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [tagResults, setTagResults] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [isTagSearching, setIsTagSearching] = useState(false);

  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [videoStates, setVideoStates] = useState<Map<string, {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isMuted: boolean;
  }>>(new Map());

  const userId = useMemo(() => currentUser?.id, [currentUser]);

  // TikTok-style continuous navigation - simple and reliable
  const navigateToPost = useCallback((direction: 1 | -1) => {
    const targetIndex = currentPostIndex + direction;

    // Check bounds and if scroll is allowed
    if (targetIndex < 0 || targetIndex >= postsToRender.length || !canScrollRef.current) {
      return;
    }

    // Immediately block further scrolling
    canScrollRef.current = false;

    setIsScrolling(true);
    setCurrentPostIndex(targetIndex);

    if (postsToRender[targetIndex]) {
      postModal.setPost?.(postsToRender[targetIndex]);
    }

    // Re-enable scrolling after transition completes
    setTimeout(() => {
      setIsScrolling(false);
      canScrollRef.current = true;
    }, 600); // Match the 600ms transition exactly
  }, [currentPostIndex, postsToRender.length, postModal]);

  // TikTok-style wheel handling - each scroll gesture = one post
  useEffect(() => {
    if (!containerRef.current || postsToRender.length <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      // During cooldown, completely ignore scroll but allow new gestures after cooldown
      if (!canScrollRef.current) {
        return;
      }

      // Accumulate scroll delta to detect intentional scroll
      accumulatedDelta.current += e.deltaY;

      // Clear any pending scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce: wait for user to stop scrolling this gesture
      scrollTimeoutRef.current = setTimeout(() => {
        const threshold = 25; // Lower threshold for quicker response

        // Check if this scroll gesture was strong enough
        if (Math.abs(accumulatedDelta.current) >= threshold) {
          const direction = accumulatedDelta.current > 0 ? 1 : -1;

          // Reset for next gesture
          accumulatedDelta.current = 0;

          // Navigate one post
          navigateToPost(direction);
        } else {
          // Too weak, ignore this gesture
          accumulatedDelta.current = 0;
        }
      }, 20); // Faster debounce for quicker response
    };

    const container = containerRef.current;

    container.addEventListener('wheel', handleWheel, {
      passive: false,
      capture: true
    });

    return () => {
      container.removeEventListener('wheel', handleWheel, true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [navigateToPost, postsToRender.length]);

// Replace your keyboard navigation useEffect with this fixed version:

useEffect(() => {
  let keyDebounceTimeout: NodeJS.Timeout | null = null;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!canScrollRef.current) return;

    // ✅ CHECK if user is typing in an input field
    const target = e.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.contentEditable === 'true' ||
                        target.isContentEditable;

    // Clear existing timeout
    if (keyDebounceTimeout) {
      clearTimeout(keyDebounceTimeout);
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        keyDebounceTimeout = setTimeout(() => navigateToPost(-1), 50);
        break;
      case 'ArrowDown':
        e.preventDefault();
        keyDebounceTimeout = setTimeout(() => navigateToPost(1), 50);
        break;
      case ' ':
        // ✅ ONLY prevent default if NOT typing in an input field
        if (!isInputField) {
          e.preventDefault();
          const currentPostId = currentPost?.id;
          if (currentPostId) {
            handlePlayPause(currentPostId);
          }
        }
        // ✅ If user IS typing in an input, let the space go through normally
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    if (keyDebounceTimeout) {
      clearTimeout(keyDebounceTimeout);
    }
  };
}, [navigateToPost, currentPost?.id]);

  // Touch handling for continuous scroll
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (postsToRender.length <= 1 || !canScrollRef.current) return;

    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchStartTime(Date.now());
    setIsDragging(true);
    setDragOffset(0);
    
    lastTouchY.current = touch.clientY;
    lastTouchTime.current = Date.now();
    touchVelocityRef.current = 0;
  }, [postsToRender.length]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || postsToRender.length <= 1 || !canScrollRef.current) return;

    const touch = e.touches[0];
    const currentTime = Date.now();
    const deltaY = touch.clientY - lastTouchY.current;
    const deltaTime = currentTime - lastTouchTime.current;

    if (deltaTime > 0) {
      touchVelocityRef.current = deltaY / deltaTime;
    }

    const rawOffset = touch.clientY - touchStartY;
    let offset = rawOffset;

    // Light resistance at boundaries for smoother feel
    if ((currentPostIndex === 0 && offset > 0) ||
        (currentPostIndex === postsToRender.length - 1 && offset < 0)) {
      offset = rawOffset * 0.3;
    }

    setDragOffset(offset);
    
    lastTouchY.current = touch.clientY;
    lastTouchTime.current = currentTime;
  }, [isDragging, touchStartY, currentPostIndex, postsToRender.length]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !canScrollRef.current) return;

    setIsDragging(false);

    const velocity = touchVelocityRef.current;
    const offset = dragOffset;
    const duration = Date.now() - touchStartTime;

    // TikTok-like thresholds - more sensitive to swipes
    const velocityThreshold = 0.5; // Higher velocity needed for quick swipes
    const distanceThreshold = window.innerHeight * 0.15; // 15% of screen height
    const quickSwipeTime = 150;

    let shouldNavigate = false;
    let direction: 1 | -1 = 1;

    // Velocity-based navigation (quick flicks)
    if (Math.abs(velocity) > velocityThreshold) {
      shouldNavigate = true;
      direction = velocity < 0 ? 1 : -1;
    }
    // Distance-based navigation (slow drags)
    else if (Math.abs(offset) > distanceThreshold) {
      shouldNavigate = true;
      direction = offset < 0 ? 1 : -1;
    }
    // Quick swipe detection
    else if (duration < quickSwipeTime && Math.abs(offset) > 30) {
      shouldNavigate = true;
      direction = offset < 0 ? 1 : -1;
    }

    if (shouldNavigate && canScrollRef.current) {
      navigateToPost(direction);
    } else {
      // Snap back to current position with smooth animation
      setDragOffset(0);
    }

    // Clear drag offset after navigation starts
    setTimeout(() => setDragOffset(0), 50);
  }, [isDragging, dragOffset, touchStartTime, navigateToPost]);

  // Video functions
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

  const isReel = currentPost?.tag?.toLowerCase() === 'reel' || currentPost?.postType?.toLowerCase() === 'reel';
  const isAd = currentPost?.postType === 'ad';

  // Trigger modal animation when opening
  useEffect(() => {
    if (currentPost && !showModal && !isClosing && postModal.isOpen) {
      // Use requestAnimationFrame for smoother animation timing
      requestAnimationFrame(() => {
        setShowModal(true);
      });
    }
  }, [currentPost, showModal, isClosing, postModal.isOpen]);

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
    setAvatarKey(prev => prev + 1); // Trigger avatar animation
  }, [currentPost?.id, userId, currentPost?.likes, currentPost?.bookmarks, currentPost?.comments, currentPost]);

  const handleClose = () => {
    setIsClosing(true);
    setShowModal(false);
    // Re-enable scrolling immediately when closing starts
    document.body.style.overflow = '';
    setTimeout(() => {
      postModal.onClose();
      setIsClosing(false);
      // Force scroll restoration after modal closes
      document.body.style.overflow = '';
    }, 300); // Match animation duration
  };

  const handleProfileClick = (userId: string) => {
    handleClose();
    setTimeout(() => {
      router.push(`/profile/${userId}`);
    }, 300); // Wait for modal close animation to complete
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

  const handleDeletePost = async () => {
    if (!currentPost || !currentUser) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`/api/post/${currentPost.id}`);
      postModal.onClose();
      window.location.reload(); // Refresh to update the feed
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handleReportPost = async () => {
    if (!currentPost) return;

    const reason = prompt('Please provide a reason for reporting this post:');
    if (!reason?.trim()) return;

    try {
      await axios.post('/api/report', {
        postId: currentPost.id,
        reason: reason.trim(),
      });
      alert('Report submitted successfully');
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to report post:', error);
      alert('Failed to submit report');
    }
  };

  // Tag search handler
  useEffect(() => {
    const searchTags = async () => {
      if (!tagSearch.trim()) {
        setTagResults([]);
        return;
      }

      setIsTagSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(tagSearch)}`);
        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        const taggableResults = (data.results || []).filter((item: any) =>
          ['user', 'listing', 'shop'].includes(item.type)
        );
        setTagResults(taggableResults);
      } catch (error) {
        console.error('Tag search error:', error);
        setTagResults([]);
      } finally {
        setIsTagSearching(false);
      }
    };

    const debounce = setTimeout(searchTags, 300);
    return () => clearTimeout(debounce);
  }, [tagSearch]);

  const handleTagSelect = (tag: any) => {
    if (!selectedTags.find(t => t.id === tag.id && t.type === tag.type)) {
      setSelectedTags(prev => [...prev, tag]);
    }
    setTagSearch('');
    setTagResults([]);
  };

  const handleTagRemove = (tagId: string, tagType: string) => {
    setSelectedTags(prev => prev.filter(t => !(t.id === tagId && t.type === tagType)));
  };

  const handleSaveTags = async () => {
    if (!currentPost) return;

    try {
      await axios.patch(`/api/post/${currentPost.id}`, {
        taggedUsers: selectedTags.filter(t => t.type === 'user').map(t => t.id),
        taggedListings: selectedTags.filter(t => t.type === 'listing').map(t => t.id),
        taggedShops: selectedTags.filter(t => t.type === 'shop').map(t => t.id),
      });
      setShowTagModal(false);
      alert('Tags saved successfully!');
    } catch (error) {
      console.error('Failed to save tags:', error);
      alert('Failed to save tags');
    }
  };

  const handleCommentSubmit = async () => {
    if (!currentUser) {
      router.push('/register');
      return;
    }
    if (!comment.trim() || !currentPost) return;

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

  // Don't render if modal is not open and we're not animating
  if (!postModal.isOpen && !isClosing) return null;

  if (!currentPost) return null;

  const listingAd = currentPost.listing as SafeListing | undefined;
  const shopAd = currentPost.shop as SafeShop | undefined;

  if (isAd) {
    return (
      <>
        <style jsx>{styles}</style>
        <div
          className={`fixed inset-0 z-[60] bg-neutral-900/70 transition-opacity duration-300 ${
            showModal ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
        />
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className={`relative max-w-lg w-full duration-300 transform transition-all ${
              showModal ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
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

      {/* Backdrop with fade */}
      <div
        className={`fixed inset-0 z-[60] bg-neutral-900/70 transition-opacity duration-300 ${
          showModal ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: showModal ? 'auto' : 'none' }}
        onClick={handleClose}
      />

      {/* Modal content with slide-up animation */}
      <div
        ref={containerRef}
        className={`fixed inset-0 z-[70] overflow-hidden ultra-smooth duration-300 transform transition-all ${
          showModal ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: 'pan-y pinch-zoom',
          overscrollBehavior: 'none',
          pointerEvents: showModal ? 'auto' : 'none'
        }}
      >
        {/* TikTok-style continuous scroll container */}
        <div
          className="relative w-full ultra-smooth transition-opacity duration-300"
          style={{
            height: `${postsToRender.length * 100}vh`,
            // This creates the continuous scroll effect - you can see adjacent posts during transition
            transform: `translate3d(0, ${(-currentPostIndex * 100) + (isDragging ? (dragOffset / window.innerHeight) * 100 : 0)}vh, 0)`,
            // Only apply transition after initial load, not on first render
            transition: isDragging ? 'none' : showModal ? 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s' : 'opacity 0.3s',
            willChange: 'transform, opacity',
            // Fade in/out content smoothly
            opacity: showModal ? 1 : 0
          }}
        >
          {postsToRender.map((postData, index) => {
            const formattedDate = format(new Date(postData.createdAt), 'PPP');
            const isReelPost = postData?.tag?.toLowerCase() === 'reel' || postData?.postType?.toLowerCase() === 'reel';
            const videoState = getVideoState(postData.id);

            return (
              <div 
                key={postData.id}
                className="absolute top-0 left-0 w-full h-screen ultra-smooth"
                style={{ 
                  // Each post is positioned at its index * 100vh for continuous scroll
                  transform: `translate3d(0, ${index * 100}vh, 0)`,
                  willChange: 'transform'
                }}
              >
                {isReelPost ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative overflow-hidden w-full max-w-md mx-auto h-[700px] flex flex-col rounded-2xl">
                      {postData.mediaUrl ? (
                        postData.mediaType === 'video' ? (
                          <video
                            ref={createVideoRefCallback(postData.id)}
                            src={postData.mediaUrl}
                            autoPlay={index === currentPostIndex}
                            muted={videoState.isMuted}
                            loop
                            className="w-full flex-1 object-cover"
                            controls={false}
                            playsInline
                          />
                        ) : (
                          <div className="relative flex-1">
                            <Image
                              src={postData.mediaUrl}
                              alt="Reel media"
                              fill
                              className="object-cover"
                              priority={Math.abs(index - currentPostIndex) <= 1}
                            />
                          </div>
                        )
                      ) : (
                        <div className="flex-1 bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                          <p className="text-white text-2xl text-center px-8 max-w-2xl leading-relaxed">{postData.content}</p>
                        </div>
                      )}

                      {/* Text Overlay - rendered via CSS to match preview exactly */}
                      {postData.mediaOverlay && (postData.mediaOverlay as MediaOverlay).text && (
                        <div
                          className="pointer-events-none absolute inset-0 flex p-6 z-10"
                          style={{
                            justifyContent:
                              (postData.mediaOverlay as MediaOverlay).pos.endsWith('left') ? 'flex-start' :
                              (postData.mediaOverlay as MediaOverlay).pos.endsWith('right') ? 'flex-end' :
                              'center',
                            alignItems:
                              (postData.mediaOverlay as MediaOverlay).pos.startsWith('top') ? 'flex-start' :
                              (postData.mediaOverlay as MediaOverlay).pos.startsWith('bottom') ? 'flex-end' :
                              'center',
                          }}
                        >
                          <div
                            style={{
                              fontSize: `${(postData.mediaOverlay as MediaOverlay).size}px`,
                              color: (postData.mediaOverlay as MediaOverlay).color === 'ffffff' ? '#fff' : '#000',
                              textShadow: (postData.mediaOverlay as MediaOverlay).color === 'ffffff'
                                ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'
                                : '2px 2px 4px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)',
                              lineHeight: 1.2,
                              fontWeight: 700,
                              maxWidth: '85%',
                              wordBreak: 'break-word',
                              textAlign:
                                (postData.mediaOverlay as MediaOverlay).pos.endsWith('left') ? 'left' :
                                (postData.mediaOverlay as MediaOverlay).pos.endsWith('right') ? 'right' :
                                'center',
                            }}
                          >
                            {(postData.mediaOverlay as MediaOverlay).text}
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                        <div className="video-controls rounded-xl px-4 py-3 text-white">
                        {/* Caption with truncation */}
                        {postData.content && (
                          <div className="mb-3">
                            <p className="font-semibold text-white text-sm mb-1">{postData.user.name || 'Anonymous'}</p>
                            <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{postData.content}</p>
                          </div>
                        )}

                        {postData.mediaType === 'video' && (
                          <div className="space-y-2">
                            {/* Progress bar */}
                            <div
                              className="w-full h-1 bg-white/20 rounded-full cursor-pointer hover:h-1.5 transition-all"
                              onClick={(e) => handleProgressClick(postData.id, e)}
                            >
                              <div
                                className="h-full bg-white rounded-full transition-all duration-150"
                                style={{ width: `${videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0}%` }}
                              />
                            </div>

                            {/* Controls row */}
                            <div className="flex items-center justify-between text-white text-xs">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handlePlayPause(postData.id)}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-all"
                                >
                                  {videoState.isPlaying ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                      <rect x="6" y="4" width="4" height="16" rx="1" />
                                      <rect x="14" y="4" width="4" height="16" rx="1" />
                                    </svg>
                                  ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                      <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                  )}
                                </button>

                                <span className="font-mono text-white/90 text-xs">
                                  {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
                                </span>
                              </div>

                              <button
                                onClick={() => handleMuteToggle(postData.id)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-all"
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
                        )}
                        </div>
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

                            {/* Text Overlay for non-reel video posts */}
                            {postData.mediaOverlay && (postData.mediaOverlay as MediaOverlay).text && (
                              <div
                                className="pointer-events-none absolute inset-0 flex p-6 z-10"
                                style={{
                                  justifyContent:
                                    (postData.mediaOverlay as MediaOverlay).pos.endsWith('left') ? 'flex-start' :
                                    (postData.mediaOverlay as MediaOverlay).pos.endsWith('right') ? 'flex-end' :
                                    'center',
                                  alignItems:
                                    (postData.mediaOverlay as MediaOverlay).pos.startsWith('top') ? 'flex-start' :
                                    (postData.mediaOverlay as MediaOverlay).pos.startsWith('bottom') ? 'flex-end' :
                                    'center',
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: `${(postData.mediaOverlay as MediaOverlay).size}px`,
                                    color: (postData.mediaOverlay as MediaOverlay).color === 'ffffff' ? '#fff' : '#000',
                                    textShadow: (postData.mediaOverlay as MediaOverlay).color === 'ffffff'
                                      ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'
                                      : '2px 2px 4px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)',
                                    lineHeight: 1.2,
                                    fontWeight: 700,
                                    maxWidth: '85%',
                                    wordBreak: 'break-word',
                                    textAlign:
                                      (postData.mediaOverlay as MediaOverlay).pos.endsWith('left') ? 'left' :
                                      (postData.mediaOverlay as MediaOverlay).pos.endsWith('right') ? 'right' :
                                      'center',
                                  }}
                                >
                                  {(postData.mediaOverlay as MediaOverlay).text}
                                </div>
                              </div>
                            )}

                            <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                              <div className="video-controls rounded-xl px-4 py-3 text-white">
                                {/* Caption with truncation */}
                                {postData.content && (
                                  <div className="mb-3">
                                    <p className="font-semibold text-white text-sm mb-1">{postData.user.name || 'Anonymous'}</p>
                                    <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{postData.content}</p>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  {/* Progress bar */}
                                  <div
                                    className="w-full h-1 bg-white/20 rounded-full cursor-pointer hover:h-1.5 transition-all"
                                    onClick={(e) => handleProgressClick(postData.id, e)}
                                  >
                                    <div
                                      className="h-full bg-white rounded-full transition-all duration-150"
                                      style={{ width: `${videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0}%` }}
                                    />
                                  </div>

                                  {/* Controls row */}
                                  <div className="flex items-center justify-between text-white text-xs">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handlePlayPause(postData.id)}
                                        className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-all"
                                      >
                                        {videoState.isPlaying ? (
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                            <rect x="6" y="4" width="4" height="16" rx="1" />
                                            <rect x="14" y="4" width="4" height="16" rx="1" />
                                          </svg>
                                        ) : (
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                            <polygon points="5,3 19,12 5,21" />
                                          </svg>
                                        )}
                                      </button>

                                      <span className="font-mono text-white/90 text-xs">
                                        {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => handleMuteToggle(postData.id)}
                                      className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-all"
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

                            {/* Text Overlay for non-reel image posts */}
                            {postData.mediaOverlay && (postData.mediaOverlay as MediaOverlay).text && (
                              <div
                                className="pointer-events-none absolute inset-0 flex p-6 z-10"
                                style={{
                                  justifyContent:
                                    (postData.mediaOverlay as MediaOverlay).pos.endsWith('left') ? 'flex-start' :
                                    (postData.mediaOverlay as MediaOverlay).pos.endsWith('right') ? 'flex-end' :
                                    'center',
                                  alignItems:
                                    (postData.mediaOverlay as MediaOverlay).pos.startsWith('top') ? 'flex-start' :
                                    (postData.mediaOverlay as MediaOverlay).pos.startsWith('bottom') ? 'flex-end' :
                                    'center',
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: `${(postData.mediaOverlay as MediaOverlay).size}px`,
                                    color: (postData.mediaOverlay as MediaOverlay).color === 'ffffff' ? '#fff' : '#000',
                                    textShadow: (postData.mediaOverlay as MediaOverlay).color === 'ffffff'
                                      ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'
                                      : '2px 2px 4px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)',
                                    lineHeight: 1.2,
                                    fontWeight: 700,
                                    maxWidth: '85%',
                                    wordBreak: 'break-word',
                                    textAlign:
                                      (postData.mediaOverlay as MediaOverlay).pos.endsWith('left') ? 'left' :
                                      (postData.mediaOverlay as MediaOverlay).pos.endsWith('right') ? 'right' :
                                      'center',
                                  }}
                                >
                                  {(postData.mediaOverlay as MediaOverlay).text}
                                </div>
                              </div>
                            )}

                            <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                              <div className="video-controls rounded-2xl p-6 text-white shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                  <button
                                    onClick={() => handleProfileClick(postData.user.id)}
                                    className="relative w-10 h-10 hover:scale-110 transition-transform duration-200 cursor-pointer flex-shrink-0"
                                  >
                                    <Image
                                      src={postData.user.image || '/images/placeholder.jpg'}
                                      alt={postData.user.name || 'User'}
                                      fill
                                      className="rounded-full object-cover border-2 border-white/20"
                                    />
                                  </button>
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
                        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8 relative">
                          <p className="text-gray-900 text-xl text-center leading-relaxed max-w-sm font-medium">{postData.content}</p>

                          <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                            <div className="rounded-2xl p-4 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleProfileClick(postData.user.id)}
                                  className="relative w-10 h-10 hover:scale-110 transition-transform duration-200 cursor-pointer flex-shrink-0"
                                >
                                  <Image
                                    src={postData.user.image || '/images/placeholder.jpg'}
                                    alt={postData.user.name || 'User'}
                                    fill
                                    className="rounded-full object-cover border-2 border-gray-200"
                                  />
                                </button>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-gray-900">{postData.user.name || 'Anonymous'}</p>
                                  <p className="text-xs text-gray-500">{formattedDate}</p>
                                </div>
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

        {/* Side action buttons - positioned right next to the post */}
        <div
          className="fixed top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-6 text-white z-30 transition-opacity duration-300 left-1/2"
          style={{
            opacity: showModal ? 1 : 0,
            marginLeft: 'calc(224px + 24px)' // half of max-w-md (448px/2) + 24px gap
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <button onClick={handleClose} className="hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" />
              </svg>
            </button>
            <span className="text-xs">Close</span>
          </div>

          <button
            onClick={() => handleProfileClick(currentPost.user.id)}
            className="border border-white rounded-full avatar-container hover:scale-110 transition-transform duration-200 cursor-pointer"
          >
            <div key={avatarKey} className="avatar-image-morph">
              <Avatar src={currentPost.user.image ?? undefined} />
            </div>
          </button>

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

          <div className="flex flex-col items-center gap-2 relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="hover:scale-110 transition-transform duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
                <path d="M21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12Z" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" stroke="currentColor" strokeWidth="1.5"></path>
                <path d="M6 12C6 11.1716 5.32843 10.5 4.5 10.5C3.67157 10.5 3 11.1716 3 12C3 12.8284 3.67157 13.5 4.5 13.5C5.32843 13.5 6 12.8284 6 12Z" stroke="currentColor" strokeWidth="1.5"></path>
              </svg>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-full mr-4 bottom-0 z-50 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-96 overflow-y-auto">
                  {currentUser && currentPost.user.id === currentUser.id ? (
                    <>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowTagModal(true);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
                          <path d="M5.18007 15.2964C3.92249 16.0335 0.625213 17.5386 2.63348 19.422C3.6145 20.342 4.7071 21 6.08077 21H13.9192C15.2929 21 16.3855 20.342 17.3665 19.422C19.3748 17.5386 16.0775 16.0335 14.8199 15.2964C11.8709 13.5679 8.12906 13.5679 5.18007 15.2964Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 7C14 9.20914 12.2091 11 10 11C7.79086 11 6 9.20914 6 7C6 4.79086 7.79086 3 10 3C12.2091 3 14 4.79086 14 7Z" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M19.5 7V14M16 10.5H23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Tag Post
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleDeletePost();
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
                          <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M9.5 16.5L9.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M14.5 16.5L14.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleReportPost();
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
                        <path d="M5.32171 9.6829C7.73539 5.41196 8.94222 3.27648 10.5983 2.72678C11.5093 2.42437 12.4907 2.42437 13.4017 2.72678C15.0578 3.27648 16.2646 5.41196 18.6783 9.6829C21.092 13.9538 22.2988 16.0893 21.9368 17.8293C21.7376 18.7866 21.2469 19.6548 20.535 20.3097C19.241 21.5 16.8274 21.5 12 21.5C7.17265 21.5 4.75897 21.5 3.46496 20.3097C2.75308 19.6548 2.26239 18.7866 2.06322 17.8293C1.70119 16.0893 2.90803 13.9538 5.32171 9.6829Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M11.992 16H12.001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Report
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Comments Panel */}
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.5 17.5C6.29454 18.5019 5.37769 20.6665 6.31569 21.3651C6.806 21.7218 7.58729 21.3408 9.14987 20.5789C10.2465 20.0441 11.3562 19.4309 12.5546 19.155C12.9931 19.0551 13.4395 19.0125 14 19C17.7712 19 19.6569 19 20.8284 17.8284C22 16.6569 22 14.7712 22 11V10.5C22 6.72876 22 4.84315 20.8284 3.67157C19.6569 2.5 17.7712 2.5 14 2.5H10C6.22876 2.5 4.34315 2.5 3.17157 3.67157C2 4.84315 2 6.72876 2 10.5V11C2 14.7712 2 16.6569 3.17157 17.8284C3.82475 18.4816 4.7987 18.8721 6.09881 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
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
                    onFocus={() => {
                      if (!currentUser) {
                        router.push('/register');
                      }
                    }}
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

        {/* Tag Modal */}
        {showTagModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowTagModal(false)}
            />
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Tag Post</h3>
                <button
                  onClick={() => setShowTagModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Search users, businesses, or shops..."
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {isTagSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {tagResults.length > 0 && (
                  <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                    {tagResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleTagSelect(result)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        {result.image && (
                          <img src={result.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Tags */}
              <div className="p-6 max-h-64 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 mb-3">Tagged ({selectedTags.length})</p>
                {selectedTags.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No tags added yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTags.map((tag) => (
                      <div
                        key={`${tag.type}-${tag.id}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        {tag.image && (
                          <img src={tag.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{tag.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{tag.type}</p>
                        </div>
                        <button
                          onClick={() => handleTagRemove(tag.id, tag.type)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowTagModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTags}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Save Tags
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PostModal;
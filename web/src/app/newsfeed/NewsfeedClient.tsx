'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import Image from 'next/image';
import Logo from '@/components/ui/Logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import axios from 'axios';
import { signOut } from 'next-auth/react';
import { PlusSignIcon, Notification03Icon, MessageMultiple01Icon, MoreVerticalIcon, Share08Icon, Link01Icon, ViewOffIcon, Flag03Icon, Delete02Icon, Cancel01Icon } from 'hugeicons-react';
import { toast } from 'react-hot-toast';
import { placeholderDataUri } from '@/lib/placeholders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SafePost, SafeUser, SafeComment, MediaOverlay } from '@/app/types';
import { isMasterUser } from '@/app/libs/authorization';
import { usePostStore } from '@/app/hooks/usePostStore';
import ClientProviders from '@/components/ClientProviders';
import PageHeader from '@/components/PageHeader';
import useLoginModal from '@/app/hooks/useLoginModal';
import useInboxModal from '@/app/hooks/useInboxModal';
import useNotificationsModal from '@/app/hooks/useNotificationsModal';
import { clearEarlyAccess } from '@/app/utils/earlyAccess';

interface NewsfeedClientProps {
  posts?: SafePost[];
  currentUser: SafeUser | null;
  initialPostId?: string;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const NewsfeedClient: React.FC<NewsfeedClientProps> = ({
  posts: serverPosts,
  currentUser,
  initialPostId,
}) => {
  const router = useRouter();
  const { updatePost } = usePostStore();
  const loginModal = useLoginModal();
  const inboxModal = useInboxModal();
  const notificationsModal = useNotificationsModal();

  // Client-side fetch when no server posts provided
  const [fetchedPosts, setFetchedPosts] = useState<SafePost[] | null>(serverPosts ?? null);
  useEffect(() => {
    if (serverPosts) return;
    fetch('/api/post/list?filter=for-you')
      .then((r) => r.json())
      .then((data) => setFetchedPosts(data))
      .catch(() => setFetchedPosts([]));
  }, [serverPosts]);

  const initialPosts = fetchedPosts ?? [];

  // === MORPH ANIMATION ===
  // Phase 0: PageHeader visible at top (identical to discover)
  // Phase 1: header slides up out of view, sidebar slides in from left
  // Phase 2: sidebar settled, content fades in
  const [morphPhase, setMorphPhase] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const pendingNavRef = useRef<string | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setMorphPhase(1), 300);
    const t2 = setTimeout(() => setMorphPhase(2), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Exit transition: reverse the animation, then navigate
  const handleNavAway = useCallback((href: string) => {
    if (isLeaving) return;
    setIsLeaving(true);
    pendingNavRef.current = href;
    // Reverse: sidebar out, header back down
    setMorphPhase(0);
    setTimeout(() => {
      router.push(href);
    }, 400);
  }, [isLeaving, router]);

  // Stable per-instance keys so prepending/appending batches doesn't remount
  // existing slides. Each entry pairs a post with a monotonic key.
  type FeedItem = { post: SafePost; key: string };
  const seqRef = useRef(0);
  const wrapBatch = useCallback((arr: SafePost[]): FeedItem[] => {
    return arr.map((p) => {
      seqRef.current += 1;
      return { post: p, key: `${p.id}-${seqRef.current}` };
    });
  }, []);

  // Initial state: pre-prepend one shuffled batch ABOVE the starting batch so
  // there's already headroom to scroll up at any time. The user lands on the
  // first item of the second batch (or the requested post, if any).
  const [posts, setPosts] = useState<FeedItem[]>(() => {
    if (!initialPosts.length) return [];
    const first = (() => {
      if (initialPostId) {
        const target = initialPosts.find((p) => p.id === initialPostId);
        const rest = shuffle(initialPosts.filter((p) => p.id !== initialPostId));
        return target ? [target, ...rest] : shuffle(initialPosts);
      }
      return shuffle(initialPosts);
    })();
    seqRef.current = 0;
    const above = wrapBatch(shuffle(initialPosts));
    const below = wrapBatch(first);
    return [...above, ...below];
  });

  const [currentIndex, setCurrentIndex] = useState(initialPosts.length);
  const currentPost = posts[currentIndex]?.post;

  // Suppress the slide transition for one frame whenever we prepend, so the
  // index re-anchoring doesn't visually animate.
  const [skipTransitionTick, setSkipTransitionTick] = useState(0);

  // Grow the feed in either direction as the user approaches an edge.
  useEffect(() => {
    if (!initialPosts.length) return;
    const batchLen = initialPosts.length;

    // Approaching the tail — append a fresh shuffle.
    if (currentIndex >= posts.length - 3) {
      setPosts((prev) => [...prev, ...wrapBatch(shuffle(initialPosts))]);
      return;
    }

    // Approaching the head — prepend a fresh shuffle and re-anchor index.
    if (currentIndex < 3) {
      const prepend = wrapBatch(shuffle(initialPosts));
      flushSync(() => {
        setSkipTransitionTick((t) => t + 1);
        setPosts((prev) => [...prepend, ...prev]);
        setCurrentIndex((idx) => idx + batchLen);
      });
      // Re-enable transitions on the next frame.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSkipTransitionTick((t) => t + 1));
      });
    }
  }, [currentIndex, posts.length, initialPosts, wrapBatch]);

  // Whether transitions are currently suppressed (toggled off → on by ticks).
  const transitionDisabled = skipTransitionTick % 2 === 1;

  // Interaction state
  const [likes, setLikes] = useState<string[]>([]);
  const [liked, setLiked] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<SafeComment[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState(false);

  // TikTok scroll
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canScrollRef = useRef(true);
  const accumulatedDelta = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  const lastTouchTime = useRef(0);
  const touchVelocityRef = useRef(0);

  const userId = currentUser?.id;

  // Track playback for the active video so the timeline can render progress.
  const [videoProgress, setVideoProgress] = useState(0); // 0..1
  const [videoDuration, setVideoDuration] = useState(0);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const setActiveVideo = useCallback((el: HTMLVideoElement | null) => {
    activeVideoRef.current = el;
    if (!el) return;
    const onTime = () => {
      if (!el.duration || !isFinite(el.duration)) return;
      setVideoProgress(el.currentTime / el.duration);
      setVideoDuration(el.duration);
    };
    const onLoaded = () => { if (isFinite(el.duration)) setVideoDuration(el.duration); };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onLoaded);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onLoaded);
    };
  }, []);

  // Reset progress when the active post changes.
  useEffect(() => {
    setVideoProgress(0);
    setVideoDuration(0);
    setPlayPauseFlash(null);
  }, [currentPost?.id]);

  // Flash a play/pause icon overlay on tap. `tick` retriggers the CSS animation
  // even when the same icon shows twice in a row.
  const [playPauseFlash, setPlayPauseFlash] = useState<{ kind: 'play' | 'pause'; tick: number } | null>(null);
  const flashTickRef = useRef(0);

  // Detect whether the comments list overflows its 180px window. When it does,
  // we surface a "View all" affordance in the section header instead of the count.
  const commentsScrollRef = useRef<HTMLDivElement | null>(null);
  const [commentsOverflow, setCommentsOverflow] = useState(false);
  useEffect(() => {
    const el = commentsScrollRef.current;
    if (!el) { setCommentsOverflow(false); return; }
    const measure = () => setCommentsOverflow(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [comments, currentPost?.id]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (currentPost && userId) {
      setLikes(currentPost.likes || []);
      setLiked(currentPost.likes?.includes(userId) || false);
      setBookmarks(currentPost.bookmarks || []);
      setBookmarked(currentPost.bookmarks?.includes(userId) || false);
      setComments(currentPost.comments || []);
    }
    setShowFullCaption(false);
    setComment('');
  }, [currentPost?.id, userId]);

  useEffect(() => {
    if (currentPost) axios.post(`/api/post/${currentPost.id}/view`).catch(() => {});
  }, [currentPost?.id]);

  const navigatePost = useCallback((direction: 1 | -1) => {
    // Both directions are unbounded — the feed grows on demand at either edge.
    if (canScrollRef.current) {
      canScrollRef.current = false;
      setCurrentIndex((idx) => idx + direction);
      setTimeout(() => { canScrollRef.current = true; }, 950);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || posts.length <= 1) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!canScrollRef.current) return;
      accumulatedDelta.current += e.deltaY;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        if (Math.abs(accumulatedDelta.current) >= 25) navigatePost(accumulatedDelta.current > 0 ? 1 : -1);
        accumulatedDelta.current = 0;
      }, 20);
    };
    const el = containerRef.current;
    el.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => { el.removeEventListener('wheel', handleWheel, true); if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current); };
  }, [navigatePost, posts.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (posts.length <= 1 || !canScrollRef.current) return;
    const t = e.touches[0];
    touchStartY.current = t.clientY; lastTouchY.current = t.clientY; lastTouchTime.current = Date.now();
    touchVelocityRef.current = 0; setIsDragging(true); setDragOffset(0);
  }, [posts.length]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !canScrollRef.current) return;
    const t = e.touches[0]; const dt = Date.now() - lastTouchTime.current;
    if (dt > 0) touchVelocityRef.current = (t.clientY - lastTouchY.current) / dt;
    let offset = t.clientY - touchStartY.current;
    // Edges are unbounded; no friction needed.
    setDragOffset(offset); lastTouchY.current = t.clientY; lastTouchTime.current = Date.now();
  }, [isDragging, currentIndex, posts.length]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !canScrollRef.current) return;
    setIsDragging(false);
    const v = touchVelocityRef.current; const dist = dragOffset; const thresh = window.innerHeight * 0.15;
    let shouldNav = false; let dir: 1 | -1 = 1;
    if (Math.abs(v) > 0.5) { shouldNav = true; dir = v < 0 ? 1 : -1; }
    else if (Math.abs(dist) > thresh) { shouldNav = true; dir = dist < 0 ? 1 : -1; }
    if (shouldNav) navigatePost(dir);
    setTimeout(() => setDragOffset(0), 50);
  }, [isDragging, dragOffset, navigatePost]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.contentEditable === 'true') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); navigatePost(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); navigatePost(-1); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigatePost]);

  const handleLike = async () => {
    if (!currentPost || !userId) return;
    const has = likes.includes(userId);
    const next = has ? likes.filter((id) => id !== userId) : [...likes, userId];
    setLikes(next); setLiked(!has); updatePost(currentPost.id, { likes: next });
    try { await axios.post(`/api/postActions/${currentPost.id}/like`); }
    catch { setLikes(currentPost.likes || []); setLiked(currentPost.likes?.includes(userId) || false); }
  };

  const handleBookmark = async () => {
    if (!currentPost || !userId) return;
    const has = bookmarks.includes(userId);
    const next = has ? bookmarks.filter((id) => id !== userId) : [...bookmarks, userId];
    setBookmarks(next); setBookmarked(!has); updatePost(currentPost.id, { bookmarks: next });
    try { await axios.post(`/api/postActions/${currentPost.id}/bookmark`); }
    catch { setBookmarks(currentPost.bookmarks || []); setBookmarked(currentPost.bookmarks?.includes(userId) || false); }
  };

  const handleShare = async () => {
    if (!currentPost) return;
    const url = `${window.location.origin}/post/${currentPost.id}`;
    try {
      if (navigator.share) await navigator.share({ title: `Post by ${currentPost.user.name}`, url });
      else { await navigator.clipboard.writeText(url); setShowShareSuccess(true); setTimeout(() => setShowShareSuccess(false), 2000); }
    } catch { try { await navigator.clipboard.writeText(url); setShowShareSuccess(true); setTimeout(() => setShowShareSuccess(false), 2000); } catch {} }
  };

  const handleCopyLink = async () => {
    if (!currentPost) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${currentPost.id}`);
      toast.success('Link copied');
    } catch { toast.error('Couldn’t copy the link.'); }
  };

  const handleHidePost = async () => {
    if (!currentPost) return;
    try {
      await axios.post(`/api/postActions/${currentPost.id}/hide`);
      toast.success('Post hidden');
      router.push('/newsfeed');
    } catch { toast.error('Couldn’t hide that post.'); }
  };

  const handleReportPost = () => {
    toast.success('Post reported');
  };

  const handleDeletePost = async () => {
    if (!currentPost) return;
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const deletedId = currentPost.id;
    try {
      await axios.delete(`/api/post/${deletedId}`);
      setPosts((prev) => prev.filter((item) => item.post.id !== deletedId));
      toast.success('Post deleted');
      router.push('/newsfeed');
    } catch { toast.error('Couldn’t delete that post.'); }
  };

  const handleCommentSubmit = async () => {
    if (!currentUser) { router.push('/register'); return; }
    if (!comment.trim() || !currentPost) return;
    setIsSubmitting(true);
    const opt: SafeComment = {
      id: `temp-${Date.now()}`, content: comment.trim(), createdAt: new Date().toISOString(),
      userId: currentUser.id, postId: currentPost.id,
      user: { id: currentUser.id, name: currentUser.name || 'You', image: currentUser.image },
    };
    setComments((prev) => [...prev, opt]); setComment('');
    try {
      await axios.post(`/api/postActions/${currentPost.id}/comment`, { content: opt.content });
      const res = await axios.get(`/api/post/${currentPost.id}`);
      setComments(res.data.comments || []); setLikes(res.data.likes || []); setBookmarks(res.data.bookmarks || []);
    } catch { setComments(comments); setComment(opt.content); }
    finally { setIsSubmitting(false); }
  };

  const SIDEBAR_W = 200;
  const isLoadingPosts = fetchedPosts === null;
  const isMorphed = morphPhase >= 1;
  const isSettled = morphPhase >= 2;

  const isEmpty = !isLoadingPosts && initialPosts.length === 0;

  const navItems = [
    { label: 'Home', href: '/', icon: 'Ho' },
    { label: 'Maps', href: '/maps', icon: 'Ma' },
    { label: 'Brands', href: '/shops', icon: 'Br' },
    ...(currentUser ? [{ label: 'Bookings', href: '/bookings/reservations', icon: 'Bk' }] : []),
    { label: 'Settings', href: '/settings', icon: 'Se' },
  ];

  const sidebarBtnClass = 'w-10 h-10 rounded-full flex items-center justify-center text-stone-400    hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200';

  return (
    <ClientProviders>
      <style jsx global>{`
        @keyframes morphPulse {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 30px 5px rgba(255,255,255,0.05); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
      `}</style>

      <div className="fixed inset-0 bg-white  dark:bg-stone-950 overflow-hidden">


        {/* ===== LOGO — fades in with content, fades out when leaving ===== */}
        <div
          className="fixed z-[70] flex items-center justify-center"
          style={{ top: '46px', left: 0, width: `${SIDEBAR_W}px`, opacity: (isSettled && !isLeaving) ? 1 : 0, transition: 'opacity 0.4s ease-out' }}
        >
          <button onClick={() => handleNavAway('/')}>
            <Logo />
          </button>
        </div>

        {/* ===== SIDEBAR — slides in from left beneath logo ===== */}
        <div
          className="fixed z-50 left-0 top-0 h-full flex flex-col items-center justify-between pb-8"
          style={{
            paddingTop: '130px',
            width: `${SIDEBAR_W}px`,
            opacity: (isSettled && !isLeaving) ? 1 : 0,
            transition: 'opacity 0.4s ease-out',
            pointerEvents: (isSettled && !isLeaving) ? 'auto' : 'none',
          }}
        >
          {/* Nav items — centered under logo */}
          <div className="flex flex-col items-center">
            <nav
              className="flex flex-col items-center gap-1 mt-10"
              style={{
                opacity: (isSettled && !isLeaving) ? 1 : 0,
                transition: 'opacity 0.4s ease-out',
              }}
            >
              {navItems.map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => handleNavAway(item.href)}
                  className="h-9 px-4 rounded-xl flex items-center justify-center text-[14px] text-stone-500     hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200"
                  style={{
                    opacity: (isSettled && !isLeaving) ? 1 : 0,
                    transition: 'opacity 0.4s ease-out',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Action buttons — centered */}
          <div
            className="flex flex-col items-center gap-2"
            style={{
              opacity: (isSettled && !isLeaving) ? 1 : 0,
              transition: 'opacity 0.4s ease-out',
            }}
          >
            {(currentUser ? [
              { onClick: () => router.push('/listing/new'), icon: <PlusSignIcon className="w-5 h-5" strokeWidth={1.5} />, label: 'Create' },
              { onClick: () => notificationsModal.onOpen(), icon: <Notification03Icon className="w-5 h-5" strokeWidth={1.5} />, label: 'Notifications' },
              { onClick: () => inboxModal.onOpen(currentUser), icon: <MessageMultiple01Icon className="w-5 h-5" strokeWidth={1.5} />, label: 'Messages' },
            ] : []).map((btn, i) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className={sidebarBtnClass}
                title={btn.label}
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Profile — centered */}
          <div
            style={{
              opacity: (isSettled && !isLeaving) ? 1 : 0,
              transition: 'opacity 0.4s ease-out',
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)' }}>
                  {currentUser?.image ? (
                    <Image src={currentUser.image} alt="Profile" width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-600 dark:to-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300  text-sm font-medium">
                      {currentUser?.name?.[0] || 'G'}
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-48 ml-2">
                {currentUser ? (
                  <>
                    <DropdownMenuItem onClick={() => router.push(`/profile/${currentUser.id}`)}>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/properties')}>Listings</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/analytics')}>Analytics</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/favorites')}>Favorites</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/subscription')}>Subscription</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { if (confirm('Clear early access?')) clearEarlyAccess(); }} className="text-red-500">Clear Data</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => loginModal.onOpen()}>Sign In</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/register')}>Sign Up</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ===== MAIN CONTENT — TikTok vertical scroll ===== */}
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-hidden"
          onTouchStart={isLoadingPosts ? undefined : handleTouchStart}
          onTouchMove={isLoadingPosts ? undefined : handleTouchMove}
          onTouchEnd={isLoadingPosts ? undefined : handleTouchEnd}
          style={{
            left: `${SIDEBAR_W}px`,
            top: 0,
            right: 0,
            bottom: 0,
            opacity: (isLoadingPosts || !isSettled) ? 1 : (isSettled && !isLeaving) ? 1 : 0,
            transition: 'opacity 0.4s ease-out',
            touchAction: 'none',
            overscrollBehavior: 'none',
          }}
        >
          {/* Inline skeleton — renders in the exact same container as real posts */}
          {/* Data-driven skeleton: shows until morph settles, mirrors actual post shape */}
          {!isSettled && (() => {
            // Once data arrives, use real post to shape the skeleton
            const skPost = currentPost || null;
            const skCaption = skPost?.content || '';
            // Estimate caption line count (~55 chars per line at text-[14px] in ~370px panel)
            const captionLines = skCaption ? Math.min(Math.ceil(skCaption.length / 55), 6) : 0;
            const commentCount = skPost?.comments?.length || 0;
            const hasCaption = captionLines > 0;

            return (
              <div className="flex items-center h-full w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
                {/* Video frame */}
                <div className="flex-1 h-full flex items-center justify-center">
                  <div
                    className="relative overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-900 animate-pulse"
                    style={{ aspectRatio: '9 / 16', height: 'calc(100dvh - 48px)', maxHeight: 'calc(100dvh - 48px)', width: 'auto' }}
                  />
                </div>

                {/* Right panel — appears same time as video, shaped by real data when available */}
                <div className="hidden lg:flex w-[500px] shrink-0 flex-col px-14 max-h-[calc(100%-48px)]">
                    {/* User card */}
                    <div className="flex items-center gap-3.5 mb-5">
                      <div
                        className="w-12 h-12 rounded-full shrink-0 animate-pulse bg-stone-200/60 dark:bg-stone-800/60"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="h-[15px] rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60 mb-1" style={{ width: `${Math.min(Math.max((skPost?.user?.name?.length || 8) * 9, 60), 200)}px` }} />
                        <div className="h-3 w-28 mt-0.5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      </div>
                      <div className="shrink-0 w-8 h-8 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    </div>

                    {/* Caption — lines based on real content length */}
                    {hasCaption && (
                      <div className="mb-5">
                        {Array.from({ length: captionLines }).map((_, i) => (
                          <div
                            key={i}
                            className="h-[14px] mb-[5px] rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60"
                            style={{ width: i === captionLines - 1 ? `${30 + Math.random() * 50}%` : '100%' }}
                          />
                        ))}
                        {skCaption.length > 200 && (
                          <div className="h-3 w-10 mt-1.5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        )}
                      </div>
                    )}

                    {/* Engagement — 3 buttons with real counts */}
                    <div className="flex items-center gap-1 mb-5">
                      {[
                        skPost?.likes?.length || 0,
                        skPost?.comments?.length || 0,
                        skPost?.bookmarks?.length || 0,
                      ].map((count, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-2 rounded-xl">
                          <div className="w-5 h-5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                          <div className="h-[13px] rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ width: `${String(count).length * 8 + 8}px` }} />
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-stone-100 dark:bg-stone-800/80 mb-5" />

                    {/* Comments — real count */}
                    <div className="flex-1 min-h-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-[13px] w-24 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        {commentCount > 3 && (
                          <div className="h-3 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        )}
                      </div>

                      {commentCount === 0 ? (
                        <div className="py-6 text-center">
                          <div className="h-[13px] w-36 mx-auto rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        </div>
                      ) : (
                        <div className="max-h-[180px] overflow-hidden space-y-4 pr-1">
                          {Array.from({ length: Math.min(commentCount, 3) }).map((_, i) => {
                            const comment = skPost?.comments?.[i];
                            const commentLen = comment?.content?.length || 40;
                            const commentLines = Math.min(Math.ceil(commentLen / 50), 3);
                            return (
                              <div key={i} className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-full shrink-0 ring-1 ring-stone-100 dark:ring-stone-800 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-baseline gap-2">
                                    <div className="h-[13px] rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ width: `${Math.min(Math.max((comment?.user?.name?.length || 6) * 8, 40), 120)}px` }} />
                                    <div className="h-[11px] w-6 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                                  </div>
                                  {Array.from({ length: commentLines }).map((_, j) => (
                                    <div
                                      key={j}
                                      className="h-[13px] mt-1 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60"
                                      style={{ width: j === commentLines - 1 ? `${30 + Math.random() * 50}%` : '100%' }}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Comment input */}
                      <div className="mt-4 relative">
                        <div className="w-full bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl h-[42px]" />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      </div>
                    </div>
                  </div>
              </div>
            );
          })()}
          {!isLoadingPosts && isSettled && <div
            className="relative w-full"
            style={{
              height: `${posts.length * 100}%`,
              transform: `translate3d(0, ${(-currentIndex * 100 / posts.length)}% ${isDragging ? ` + ${dragOffset}px` : ''}, 0)`,
              transition: (isDragging || transitionDisabled) ? 'none' : 'transform 950ms cubic-bezier(0.32, 0.72, 0, 1)',
              willChange: 'transform',
            }}
          >
            {posts.map((item, index) => {
              const post = item.post;
              const postIsVideo = post.mediaType === 'video';
              const postIsText = !post.imageSrc && !post.mediaUrl;
              const isCurrent = index === currentIndex;

              return (
                <div
                  key={item.key}
                  className="absolute left-0 w-full flex items-center justify-center"
                  style={{ top: `${(index / posts.length) * 100}%`, height: `${100 / posts.length}%` }}
                >
                  <div className="flex items-center h-full w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
                    {/* Post media */}
                    <div className="flex-1 h-full flex items-center justify-center">
                      <div
                        className="relative overflow-hidden rounded-2xl bg-stone-100  dark:bg-stone-900"
                        style={{
                          aspectRatio: '9 / 16',
                          height: 'calc(100dvh - 48px)',
                          maxHeight: 'calc(100dvh - 48px)',
                          width: 'auto',
                          opacity: (isSettled && !isLeaving) ? 1 : 0,
                          transition: 'opacity 0.4s ease-out',
                        }}
                      >
                        {postIsText ? (
                          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-10">
                            <p className="text-white/90 text-lg leading-relaxed font-medium text-center whitespace-pre-wrap">{post.content}</p>
                          </div>
                        ) : postIsVideo ? (
                          <>
                            <video
                              key={post.id}
                              ref={isCurrent ? setActiveVideo : null}
                              src={post.mediaUrl || post.imageSrc || ''}
                              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                              autoPlay
                              muted
                              loop
                              playsInline
                              onClick={() => {
                                if (!isCurrent) return;
                                const v = activeVideoRef.current;
                                if (!v) return;
                                flashTickRef.current += 1;
                                if (v.paused) {
                                  v.play().catch(() => {});
                                  setPlayPauseFlash({ kind: 'play', tick: flashTickRef.current });
                                } else {
                                  v.pause();
                                  setPlayPauseFlash({ kind: 'pause', tick: flashTickRef.current });
                                }
                              }}
                            />
                            {isCurrent && playPauseFlash && (
                              <div
                                key={playPauseFlash.tick}
                                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
                                style={{ animation: 'playPauseFlash 620ms cubic-bezier(0.16, 1, 0.3, 1) both' }}
                              >
                                <div
                                  className="flex items-center justify-center rounded-full"
                                  style={{
                                    width: 84,
                                    height: 84,
                                    background: 'rgba(20, 20, 22, 0.55)',
                                    backdropFilter: 'blur(18px) saturate(160%)',
                                    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                                    border: '1px solid rgba(255, 255, 255, 0.18)',
                                    boxShadow:
                                      '0 1px 0 rgba(255,255,255,0.18) inset, 0 12px 36px -12px rgba(0,0,0,0.55), 0 2px 8px -2px rgba(0,0,0,0.35)',
                                  }}
                                >
                                  {playPauseFlash.kind === 'play' ? (
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="white" className="ml-[3px] drop-shadow-sm">
                                      <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l11-6.86a1 1 0 0 0 0-1.66l-11-6.86A1 1 0 0 0 8 5.14z" />
                                    </svg>
                                  ) : (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="drop-shadow-sm">
                                      <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
                                      <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            )}
                            {isCurrent && (
                              <VideoTimeline
                                progress={videoProgress}
                                duration={videoDuration}
                                onSeek={(ratio) => {
                                  const v = activeVideoRef.current;
                                  if (v && isFinite(v.duration)) {
                                    v.currentTime = ratio * v.duration;
                                    setVideoProgress(ratio);
                                  }
                                }}
                              />
                            )}
                          </>
                        ) : (
                          <>
                            <Image src={post.mediaUrl || post.imageSrc || ''} alt={post.user?.name ? `Post by ${post.user.name}` : 'Post image'} fill className="object-cover" priority={Math.abs(index - currentIndex) <= 1} sizes="460px" />
                            {post.mediaOverlay && (post.mediaOverlay as MediaOverlay).text && (
                              <div className="pointer-events-none absolute inset-0 flex p-6 z-10" style={{
                                justifyContent: (post.mediaOverlay as MediaOverlay).pos.endsWith('left') ? 'flex-start' : (post.mediaOverlay as MediaOverlay).pos.endsWith('right') ? 'flex-end' : 'center',
                                alignItems: (post.mediaOverlay as MediaOverlay).pos.startsWith('top') ? 'flex-start' : (post.mediaOverlay as MediaOverlay).pos.startsWith('bottom') ? 'flex-end' : 'center',
                              }}>
                                <div style={{ fontSize: `${(post.mediaOverlay as MediaOverlay).size}px`, color: (post.mediaOverlay as MediaOverlay).color === 'ffffff' ? '#fff' : '#000', textShadow: '2px 2px 4px rgba(0,0,0,0.8)', lineHeight: 1.2, fontWeight: 700, maxWidth: '85%', wordBreak: 'break-word' as const }}>
                                  {(post.mediaOverlay as MediaOverlay).text}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Info panel — slides with the media as one unit */}
                    <div className="hidden lg:flex w-[500px] shrink-0 flex-col px-14 max-h-[calc(100%-48px)]">
                      {/* User card */}
                      <div className="flex items-center gap-3.5 mb-5">
                        <button
                          onClick={() => router.push(`/profile/${post.user.id}`)}
                          className="relative w-12 h-12 rounded-full overflow-hidden hover:scale-105 transition-transform shrink-0"
                          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)' }}
                        >
                          <Image src={post.user.image || placeholderDataUri(post.user.name || 'User')} alt={post.user.name || 'User avatar'} fill className="object-cover" sizes="48px" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => router.push(`/profile/${post.user.id}`)}
                            className="text-[15px] font-semibold text-stone-900  dark:text-white hover:text-stone-600 dark:text-stone-300 dark:hover:text-stone-300 transition-colors block truncate"
                          >
                            {post.user.name || 'Anonymous'}
                          </button>
                          <p className="text-[12px] text-stone-400   dark:text-stone-400  mt-0.5">{format(new Date(post.createdAt), 'PPP')}</p>
                        </div>
                        {isCurrent && (
                          <DropdownMenu open={postMenuOpen} onOpenChange={setPostMenuOpen}>
                            <DropdownMenuTrigger
                              className="relative shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-stone-400  hover:text-stone-600  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800   dark:text-stone-400  dark:hover:text-stone-200 transition-all outline-none"
                              aria-label={postMenuOpen ? 'Close menu' : 'More options'}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className={`absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${postMenuOpen ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}
                              >
                                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                              </svg>
                              <Cancel01Icon
                                className={`absolute w-5 h-5 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${postMenuOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}`}
                                strokeWidth={2}
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={10} className="w-48">
                              <DropdownMenuItem onClick={handleShare} className="gap-4">
                                <Share08Icon className="w-4 h-4 text-stone-500  dark:text-stone-500" strokeWidth={1.5} />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleCopyLink} className="gap-4">
                                <Link01Icon className="w-4 h-4 text-stone-500  dark:text-stone-500" strokeWidth={1.5} />
                                Copy Link
                              </DropdownMenuItem>
                              {currentUser && post.user.id !== currentUser.id && !isMasterUser(currentUser) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={handleHidePost} className="gap-4">
                                    <ViewOffIcon className="w-4 h-4 text-stone-500  dark:text-stone-500" strokeWidth={1.5} />
                                    Hide Post
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={handleReportPost} className="gap-4">
                                    <Flag03Icon className="w-4 h-4 text-stone-500  dark:text-stone-500" strokeWidth={1.5} />
                                    Report Post
                                  </DropdownMenuItem>
                                </>
                              )}
                              {currentUser && (post.user.id === currentUser.id || isMasterUser(currentUser)) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={handleDeletePost} className="gap-4 text-red-600 focus:text-red-600">
                                    <Delete02Icon className="w-4 h-4" strokeWidth={1.5} />
                                    Delete Post
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {/* Caption */}
                      <div className="mb-5">
                        <p className={`text-[14px] leading-[1.7] text-stone-600 dark:text-stone-300 dark:text-stone-300 ${isCurrent && showFullCaption ? '' : 'line-clamp-6'}`}>
                          {post.content || 'Just shared something new. Check out this look — been working on perfecting this style for a while now. If you want to book a session or learn more about what I offer, tap my profile above. Always taking new clients and love meeting people who appreciate the craft.'}
                        </p>
                        {(post.content?.length || 0) > 200 && (
                          <button
                            onClick={() => setShowFullCaption(!showFullCaption)}
                            className="text-[12px] font-medium text-stone-400  hover:text-stone-600   dark:text-stone-400  dark:hover:text-stone-300 mt-1.5 transition-colors"
                          >
                            {isCurrent && showFullCaption ? 'less' : 'more'}
                          </button>
                        )}
                      </div>

                      {/* Engagement row */}
                      <div className="flex items-center gap-1 mb-5">
                        <button
                          onClick={isCurrent ? handleLike : undefined}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-500  dark:text-stone-500   hover:bg-stone-50  dark:bg-stone-900 dark:hover:bg-stone-800/50 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isCurrent && liked ? '#292524' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" />
                          </svg>
                          <span className="text-[13px] tabular-nums">{isCurrent ? likes.length : post.likes?.length || 0}</span>
                        </button>

                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-500  dark:text-stone-500   hover:bg-stone-50  dark:bg-stone-900 dark:hover:bg-stone-800/50 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6.5 17.5C6.29454 18.5019 5.37769 20.6665 6.31569 21.3651C6.806 21.7218 7.58729 21.3408 9.14987 20.5789C10.2465 20.0441 11.3562 19.4309 12.5546 19.155C12.9931 19.0551 13.4395 19.0125 14 19C17.7712 19 19.6569 19 20.8284 17.8284C22 16.6569 22 14.7712 22 11V10.5C22 6.72876 22 4.84315 20.8284 3.67157C19.6569 2.5 17.7712 2.5 14 2.5H10C6.22876 2.5 4.34315 2.5 3.17157 3.67157C2 4.84315 2 6.72876 2 10.5V11C2 14.7712 2 16.6569 3.17157 17.8284C3.82475 18.4816 4.7987 18.8721 6.09881 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          <span className="text-[13px] tabular-nums">{isCurrent ? comments.length : post.comments?.length || 0}</span>
                        </button>

                        <button
                          onClick={isCurrent ? handleBookmark : undefined}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-500  dark:text-stone-500   hover:bg-stone-50  dark:bg-stone-900 dark:hover:bg-stone-800/50 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isCurrent && bookmarked ? '#292524' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" />
                          </svg>
                          <span className="text-[13px] tabular-nums">{isCurrent ? bookmarks.length : post.bookmarks?.length || 0}</span>
                        </button>

                      </div>

                      {/* Divider */}
                      <div className="h-px bg-stone-100  dark:bg-stone-800/80 mb-5" />

                      {/* Comments */}
                      {isCurrent && (
                        <div className="flex-1 min-h-0">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-medium text-stone-800 dark:text-stone-200 ">Comments</span>
                            {commentsOverflow && (
                              <button
                                type="button"
                                onClick={() => {
                                  const el = commentsScrollRef.current;
                                  if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
                                }}
                                className="text-[12px] font-medium text-stone-500   hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100   dark:hover:text-white transition-colors"
                              >
                                View all
                              </button>
                            )}
                          </div>

                          <div ref={commentsScrollRef} className="max-h-[180px] overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                            {comments.length === 0 ? (
                              <div className="py-6 text-center">
                                <p className="text-[13px] text-stone-400   dark:text-stone-400 ">Start the conversation</p>
                              </div>
                            ) : comments.map((c) => (
                              <div key={c.id} className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 relative ring-1 ring-stone-100 dark:ring-stone-800">
                                  <Image src={c.user.image || placeholderDataUri(c.user.name || 'User')} alt={c.user.name || 'User avatar'} fill className="object-cover" sizes="28px" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-[13px] font-medium text-stone-700  dark:text-stone-300">{c.user.name}</span>
                                    <span className="text-[11px] text-stone-300  dark:text-stone-300">
                                      {(() => {
                                        const d = new Date(c.createdAt);
                                        const now = new Date();
                                        const hrs = (now.getTime() - d.getTime()) / 3600000;
                                        return hrs < 1 ? 'now' : hrs < 24 ? `${Math.floor(hrs)}h` : `${Math.floor(hrs / 24)}d`;
                                      })()}
                                    </span>
                                  </div>
                                  <p className="text-[13px] text-stone-500  dark:text-stone-500   leading-relaxed mt-0.5">{c.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Comment input */}
                          <div className="mt-4 relative">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter' && !isSubmitting && comment.trim()) { e.preventDefault(); handleCommentSubmit(); } }}
                              className="w-full bg-stone-50  dark:bg-stone-800/50 border border-stone-200   rounded-xl px-4 py-2.5 pr-11 text-[13px] text-stone-800 dark:text-stone-200 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-300 dark:border-stone-700 dark:focus:border-stone-600 focus:bg-white  dark:focus:bg-stone-800 transition-all"
                              disabled={isSubmitting}
                            />
                            <button
                              onClick={handleCommentSubmit}
                              disabled={isSubmitting || !comment.trim()}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center text-stone-400  hover:text-stone-600 dark:text-stone-300 dark:hover:text-white disabled:opacity-20 transition-all"
                            >
                              {isSubmitting ? (
                                <div className="w-3.5 h-3.5 border-[1.5px] border-stone-300  border-t-stone-600 dark:border-stone-600 dark:border-t-white rounded-full animate-spin" />
                              ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>}

          {/* ===== EMPTY STATE — when there are no posts to show ===== */}
          {isEmpty && (
            <div
              className="absolute inset-0 flex items-center justify-center px-6"
              style={{
                opacity: (isSettled && !isLeaving) ? 1 : 0,
                transition: 'opacity 0.6s ease-out',
              }}
            >
              <div className="text-center max-w-[340px]">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shadow-sm">
                  <Notification03Icon
                    className="w-6 h-6 text-stone-400 dark:text-stone-500"
                    strokeWidth={1.25}
                  />
                </div>
                <h2 className="mt-5 text-[20px] font-semibold text-stone-900 dark:text-stone-50 tracking-[-0.02em] leading-tight">
                  Your feed is quiet
                </h2>
                <p className="mt-2 text-[13.5px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  Posts from brands and pros you follow will show up here. Head back to Discover to find some.
                </p>
                <button
                  type="button"
                  onClick={() => handleNavAway('/')}
                  className="mt-6 inline-flex items-center px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[13px] font-medium tracking-tight shadow-sm hover:bg-stone-800 dark:hover:bg-stone-200 active:scale-[0.97] transition-all duration-200"
                >
                  Back to Discover
                </button>
              </div>
            </div>
          )}

          {/* ===== NAV ARROWS — minimal, right edge ===== */}
          {!isEmpty && (
            <div
              className="hidden sm:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-2 select-none"
              style={{
                opacity: (isSettled && !isLeaving) ? 1 : 0,
                transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <button
                type="button"
                onClick={() => navigatePost(-1)}
                aria-label="Previous post"
                className="group w-10 h-10 rounded-full flex items-center justify-center text-stone-500   hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 active:scale-[0.92] transition-all duration-200   dark:hover:text-white "
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => navigatePost(1)}
                aria-label="Next post"
                className="group w-10 h-10 rounded-full flex items-center justify-center text-stone-500   hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 active:scale-[0.92] transition-all duration-200   dark:hover:text-white "
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
          )}


        </div>
      </div>
    </ClientProviders>
  );
};

export default NewsfeedClient;

/* ---------------------------------------------------------------------------
 * VideoTimeline — minimal, refined progress bar pinned to the bottom of the
 * media frame. Hairline track expands on hover, click/drag to seek.
 * ------------------------------------------------------------------------ */
interface VideoTimelineProps {
  progress: number; // 0..1
  duration: number; // seconds
  onSeek: (ratio: number) => void;
}

const formatSecs = (s: number) => {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
};

const VideoTimeline: React.FC<VideoTimelineProps> = ({ progress, duration, onSeek }) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);

  const ratioFromEvent = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setScrubbing(true);
    onSeek(ratioFromEvent(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const r = ratioFromEvent(e.clientX);
    setHoverRatio(r);
    if (scrubbing) onSeek(r);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (scrubbing) {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      setScrubbing(false);
    }
  };

  const expanded = hovering || scrubbing;
  const displayRatio = scrubbing && hoverRatio !== null ? hoverRatio : progress;
  const currentSecs = displayRatio * duration;

  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-20"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setHoverRatio(null); }}
    >
      {/* Soft fade behind so the timeline reads on bright videos */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />

      {/* Hover-revealed time chip */}
      <div
        className="pointer-events-none absolute bottom-6 left-5 text-[11px] font-medium text-white/85 tabular-nums tracking-wide"
        style={{
          opacity: expanded ? 1 : 0,
          transform: `translateY(${expanded ? 0 : 4}px)`,
          transition: 'opacity 220ms ease-out, transform 220ms ease-out',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        }}
      >
        {formatSecs(currentSecs)} <span className="text-white/45">/ {formatSecs(duration)}</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative w-full cursor-pointer touch-none"
        style={{
          height: expanded ? 18 : 14, // tap target stays generous; visual track is thinner
          paddingTop: expanded ? 14 : 12,
          paddingBottom: 4,
          transition: 'height 220ms ease-out, padding-top 220ms ease-out',
        }}
      >
        {/* Background track */}
        <div
          className="relative w-full overflow-hidden rounded-full"
          style={{
            height: expanded ? 3 : 2,
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'height 220ms ease-out, background 220ms ease-out',
          }}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${Math.max(0, Math.min(1, displayRatio)) * 100}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,1))',
              boxShadow: '0 0 8px rgba(255,255,255,0.35)',
              transition: scrubbing ? 'none' : 'width 120ms linear',
            }}
          />
        </div>

        {/* Scrubber dot */}
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white dark:bg-stone-900"
          style={{
            left: `${Math.max(0, Math.min(1, displayRatio)) * 100}%`,
            width: expanded ? 10 : 0,
            height: expanded ? 10 : 0,
            opacity: expanded ? 1 : 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06)',
            transition: 'width 220ms ease-out, height 220ms ease-out, opacity 220ms ease-out',
          }}
        />
      </div>
    </div>
  );
};

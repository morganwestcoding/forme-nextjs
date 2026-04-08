'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import axios from 'axios';
import { signOut } from 'next-auth/react';
import { PlusSignIcon, Notification03Icon, MessageMultiple01Icon } from 'hugeicons-react';
import { placeholderDataUri } from '@/lib/placeholders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SafePost, SafeUser, SafeComment, MediaOverlay } from '@/app/types';
import { usePostStore } from '@/app/hooks/usePostStore';
import ClientProviders from '@/components/ClientProviders';
import PageHeader from '@/components/PageHeader';
import useLoginModal from '@/app/hooks/useLoginModal';
import useInboxModal from '@/app/hooks/useInboxModal';
import useNotificationsModal from '@/app/hooks/useNotificationsModal';
import { clearEarlyAccess } from '@/app/utils/earlyAccess';

interface NewsfeedClientProps {
  posts: SafePost[];
  currentUser: SafeUser | null;
  initialPostId?: string;
}

const NewsfeedClient: React.FC<NewsfeedClientProps> = ({
  posts,
  currentUser,
  initialPostId,
}) => {
  const router = useRouter();
  const { updatePost } = usePostStore();
  const loginModal = useLoginModal();
  const inboxModal = useInboxModal();
  const notificationsModal = useNotificationsModal();

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

  const initialIndex = useMemo(() => {
    if (!initialPostId) return 0;
    const idx = posts.findIndex((p) => p.id === initialPostId);
    return idx >= 0 ? idx : 0;
  }, [initialPostId, posts]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentPost = posts[currentIndex];

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
    const next = currentIndex + direction;
    if (next >= 0 && next < posts.length && canScrollRef.current) {
      canScrollRef.current = false;
      setCurrentIndex(next);
      setTimeout(() => { canScrollRef.current = true; }, 700);
    }
  }, [currentIndex, posts.length]);

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
    if ((currentIndex === 0 && offset > 0) || (currentIndex === posts.length - 1 && offset < 0)) offset *= 0.3;
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

  if (!currentPost) return null;

  const isMorphed = morphPhase >= 1;
  const isSettled = morphPhase >= 2;
  const SIDEBAR_W = 200;

  const navItems = [
    { label: 'Home', href: '/', icon: 'Ho' },
    { label: 'Maps', href: '/maps', icon: 'Ma' },
    { label: 'Brands', href: '/shops', icon: 'Br' },
    ...(currentUser ? [{ label: 'Bookings', href: '/bookings/reservations', icon: 'Bk' }] : []),
    { label: 'Settings', href: '/settings', icon: 'Se' },
  ];

  const sidebarBtnClass = 'w-10 h-10 rounded-full flex items-center justify-center text-stone-400 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all duration-200';

  return (
    <ClientProviders>
      <style jsx global>{`
        @keyframes morphPulse {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 30px 5px rgba(255,255,255,0.05); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
      `}</style>

      <div className="fixed inset-0 bg-white dark:bg-zinc-950 overflow-hidden">


        {/* ===== LOGO — fades in with content, fades out when leaving ===== */}
        <div
          className="fixed z-[70] flex items-center justify-center"
          style={{ top: '46px', left: 0, width: `${SIDEBAR_W}px`, opacity: (isSettled && !isLeaving) ? 1 : 0, transition: 'opacity 0.4s ease-out' }}
        >
          <button onClick={() => handleNavAway('/')}>
            <Image
              src="/logos/fm-logo.png"
              alt="Logo"
              width={72}
              height={46}
              className="opacity-90 hover:opacity-100 transition-opacity duration-200"
            />
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
                  className="h-9 px-4 rounded-xl flex items-center justify-center text-[14px] text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all duration-200"
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
            {[
              { onClick: () => router.push('/listing/new'), icon: <PlusSignIcon className="w-5 h-5" strokeWidth={1.5} />, label: 'Create' },
              { onClick: () => notificationsModal.onOpen(), icon: <Notification03Icon className="w-5 h-5" strokeWidth={1.5} />, label: 'Notifications' },
              { onClick: () => inboxModal.onOpen(currentUser), icon: <MessageMultiple01Icon className="w-5 h-5" strokeWidth={1.5} />, label: 'Messages' },
            ].map((btn, i) => (
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
                    <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 text-sm font-medium">
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            // Shift right as sidebar morphs in, shift back when leaving
            left: `${SIDEBAR_W}px`,
            top: 0,
            right: 0,
            bottom: 0,
            opacity: (isSettled && !isLeaving) ? 1 : 0,
            transition: 'opacity 0.4s ease-out',
            touchAction: 'none',
            overscrollBehavior: 'none',
          }}
        >
          <div
            className="relative w-full"
            style={{
              height: `${posts.length * 100}%`,
              transform: `translate3d(0, ${(-currentIndex * 100 / posts.length)}% ${isDragging ? ` + ${dragOffset}px` : ''}, 0)`,
              transition: isDragging ? 'none' : 'transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)',
              willChange: 'transform',
            }}
          >
            {posts.map((post, index) => {
              const postIsVideo = post.mediaType === 'video';
              const postIsText = !post.imageSrc && !post.mediaUrl;
              const isCurrent = index === currentIndex;

              return (
                <div
                  key={post.id}
                  className="absolute left-0 w-full flex items-center justify-center"
                  style={{ top: `${(index / posts.length) * 100}%`, height: `${100 / posts.length}%` }}
                >
                  <div className="flex items-center h-full w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
                    {/* Post media */}
                    <div className="flex-1 h-full flex items-center justify-center">
                      <div
                        className="relative overflow-hidden rounded-2xl bg-stone-100 dark:bg-zinc-900"
                        style={{
                          width: '100%', maxWidth: '460px', aspectRatio: '4 / 5',
                          maxHeight: 'calc(100% - 48px)',
                          opacity: (isSettled && !isLeaving) ? 1 : 0,
                          transition: 'opacity 0.4s ease-out',
                        }}
                      >
                        {postIsText ? (
                          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-10">
                            <p className="text-white/90 text-lg leading-relaxed font-medium text-center whitespace-pre-wrap">{post.content}</p>
                          </div>
                        ) : postIsVideo ? (
                          <video key={post.id} src={post.mediaUrl || post.imageSrc || ''} className="absolute inset-0 w-full h-full object-cover" autoPlay={isCurrent} muted loop playsInline />
                        ) : (
                          <>
                            <Image src={post.mediaUrl || post.imageSrc || ''} alt="" fill className="object-cover" priority={Math.abs(index - currentIndex) <= 1} sizes="460px" />
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

                    {/* Info panel */}
                    <div
                      className="w-[500px] shrink-0 flex flex-col px-14"
                      style={{
                        opacity: isCurrent && isSettled && !isLeaving ? 1 : 0,
                        transition: 'opacity 0.4s ease-out',
                      }}
                    >
                      {/* User card */}
                      <div className="flex items-center gap-3.5 mb-5">
                        <button
                          onClick={() => router.push(`/profile/${post.user.id}`)}
                          className="relative w-12 h-12 rounded-full overflow-hidden hover:scale-105 transition-transform shrink-0"
                          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)' }}
                        >
                          <Image src={post.user.image || placeholderDataUri(post.user.name || 'User')} alt="" fill className="object-cover" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => router.push(`/profile/${post.user.id}`)}
                            className="text-[15px] font-semibold text-gray-900 dark:text-white hover:text-stone-600 dark:hover:text-zinc-300 transition-colors block truncate"
                          >
                            {post.user.name || 'Anonymous'}
                          </button>
                          <p className="text-[12px] text-stone-400 dark:text-zinc-500 mt-0.5">{format(new Date(post.createdAt), 'PPP')}</p>
                        </div>
                      </div>

                      {/* Caption */}
                      <div className="mb-5">
                        <p className={`text-[14px] leading-[1.7] text-stone-600 dark:text-zinc-300 ${isCurrent && showFullCaption ? '' : 'line-clamp-6'}`}>
                          {post.content || 'Just shared something new. Check out this look — been working on perfecting this style for a while now. If you want to book a session or learn more about what I offer, tap my profile above. Always taking new clients and love meeting people who appreciate the craft.'}
                        </p>
                        {(post.content?.length || 0) > 200 && (
                          <button
                            onClick={() => setShowFullCaption(!showFullCaption)}
                            className="text-[12px] font-medium text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300 mt-1.5 transition-colors"
                          >
                            {isCurrent && showFullCaption ? 'less' : 'more'}
                          </button>
                        )}
                      </div>

                      {/* Engagement row */}
                      <div className="flex items-center gap-1 mb-5">
                        <button
                          onClick={isCurrent ? handleLike : undefined}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-500 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isCurrent && liked ? '#292524' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" />
                          </svg>
                          <span className="text-[13px] tabular-nums">{isCurrent ? likes.length : post.likes?.length || 0}</span>
                        </button>

                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-500 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6.5 17.5C6.29454 18.5019 5.37769 20.6665 6.31569 21.3651C6.806 21.7218 7.58729 21.3408 9.14987 20.5789C10.2465 20.0441 11.3562 19.4309 12.5546 19.155C12.9931 19.0551 13.4395 19.0125 14 19C17.7712 19 19.6569 19 20.8284 17.8284C22 16.6569 22 14.7712 22 11V10.5C22 6.72876 22 4.84315 20.8284 3.67157C19.6569 2.5 17.7712 2.5 14 2.5H10C6.22876 2.5 4.34315 2.5 3.17157 3.67157C2 4.84315 2 6.72876 2 10.5V11C2 14.7712 2 16.6569 3.17157 17.8284C3.82475 18.4816 4.7987 18.8721 6.09881 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          <span className="text-[13px] tabular-nums">{isCurrent ? comments.length : post.comments?.length || 0}</span>
                        </button>

                        <button
                          onClick={isCurrent ? handleBookmark : undefined}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-500 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isCurrent && bookmarked ? '#292524' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" />
                          </svg>
                          <span className="text-[13px] tabular-nums">{isCurrent ? bookmarks.length : post.bookmarks?.length || 0}</span>
                        </button>

                        <button
                          onClick={isCurrent ? handleShare : undefined}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-500 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-all ml-auto relative"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
                            <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
                          </svg>
                          {showShareSuccess && isCurrent && (
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-stone-800 dark:bg-zinc-700 text-white text-[11px] px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg">
                              Copied
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-stone-100 dark:bg-zinc-800/80 mb-5" />

                      {/* Comments */}
                      {isCurrent && (
                        <div className="flex-1 min-h-0">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[13px] font-medium text-stone-800 dark:text-zinc-200">
                              Comments
                            </span>
                            <span className="text-[12px] text-stone-400 dark:text-zinc-500 tabular-nums">
                              {comments.length}
                            </span>
                          </div>

                          <div className="max-h-[180px] overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                            {comments.length === 0 ? (
                              <div className="py-6 text-center">
                                <p className="text-[13px] text-stone-400 dark:text-zinc-500">Start the conversation</p>
                              </div>
                            ) : comments.map((c) => (
                              <div key={c.id} className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 relative ring-1 ring-stone-100 dark:ring-zinc-800">
                                  <Image src={c.user.image || placeholderDataUri(c.user.name || 'User')} alt="" fill className="object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-[13px] font-medium text-stone-700 dark:text-zinc-300">{c.user.name}</span>
                                    <span className="text-[11px] text-stone-300 dark:text-zinc-600">
                                      {(() => {
                                        const d = new Date(c.createdAt);
                                        const now = new Date();
                                        const hrs = (now.getTime() - d.getTime()) / 3600000;
                                        return hrs < 1 ? 'now' : hrs < 24 ? `${Math.floor(hrs)}h` : `${Math.floor(hrs / 24)}d`;
                                      })()}
                                    </span>
                                  </div>
                                  <p className="text-[13px] text-stone-500 dark:text-zinc-400 leading-relaxed mt-0.5">{c.content}</p>
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
                              className="w-full bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700/50 rounded-xl px-4 py-2.5 pr-11 text-[13px] text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-zinc-500 outline-none focus:border-stone-300 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-800 transition-all"
                              disabled={isSubmitting}
                            />
                            <button
                              onClick={handleCommentSubmit}
                              disabled={isSubmitting || !comment.trim()}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-white disabled:opacity-20 transition-all"
                            >
                              {isSubmitting ? (
                                <div className="w-3.5 h-3.5 border-[1.5px] border-stone-300 border-t-stone-600 dark:border-zinc-600 dark:border-t-white rounded-full animate-spin" />
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
          </div>

          {/* Scroll dots */}
          <div className="fixed right-4 sm:right-6 lg:right-8 xl:right-16 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20" style={{ opacity: (isSettled && !isLeaving) ? 1 : 0, transition: 'opacity 0.4s ease-out' }}>
            {posts.map((_, i) => (
              <button key={i} onClick={() => { if (canScrollRef.current) { canScrollRef.current = false; setCurrentIndex(i); setTimeout(() => { canScrollRef.current = true; }, 700); } }}
                className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'w-1.5 h-5 bg-gray-900 dark:bg-white' : 'w-1.5 h-1.5 bg-gray-300 dark:bg-zinc-600 hover:bg-gray-400 dark:hover:bg-zinc-500'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </ClientProviders>
  );
};

export default NewsfeedClient;

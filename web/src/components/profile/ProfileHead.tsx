'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeListing, SafePost, SafeUser, SafeReview } from '@/app/types';
import Button from '@/components/ui/Button';
import type { ProviderService } from '@/app/actions/getServicesByUserId';
import PostCard from '@/components/feed/PostCard';
import ListingCard from '@/components/listings/ListingCard';
import ServiceCard from '@/components/listings/ServiceCard';
import QRModal from '@/components/modals/QRModal';
import { ShieldUserIcon } from 'hugeicons-react';
import { categories } from '@/components/Categories';
import { placeholderDataUri } from '@/lib/placeholders';
import useReviewModal from '@/app/hooks/useReviewModal';
import useMessageModal from '@/app/hooks/useMessageModal';
import ReviewCard from '@/components/reviews/ReviewCard';
import VerificationBadge from '@/components/VerificationBadge';

interface ProfileHeadProps {
  user: SafeUser;
  currentUser: SafeUser | null;
  posts: SafePost[];
  listings: SafeListing[];
  services?: ProviderService[];
  reviews?: SafeReview[];
  reviewStats?: {
    totalCount: number;
    averageRating: number;
  };
}

const ProfileHead: React.FC<ProfileHeadProps> = ({
  user,
  currentUser,
  posts = [],
  listings = [],
  services = [],
  reviews = [],
  reviewStats,
}) => {
  const {
    id,
    name,
    location,
    image,
    imageSrc,
    bio,
    followers = [],
    following = [],
    galleryImages = [],
  } = user;

  const isStudent = user.userType === 'student';
  const isCustomer = user.userType === 'customer';
  // Show an admin/master badge on the profile owner's avatar.
  const isAdminProfile = (user as any).role === 'admin' || (user as any).role === 'master';
  const studentAcademyName = user.academyName ?? null;

  const router = useRouter();
  const reviewModal = useReviewModal();
  const messageModal = useMessageModal();

  const starGradientId = `starGrad-${React.useId().replace(/:/g, '')}`;

  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Extract dominant color from profile image
  const profileImage = image || imageSrc || placeholderDataUri(name || 'User');
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  useEffect(() => {
    if (profileImage.startsWith('data:')) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 20;
        canvas.height = 20;
        ctx.drawImage(img, 0, 0, 20, 20);
        const data = ctx.getImageData(0, 0, 20, 20).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 30 && brightness < 220) {
            r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
          }
        }
        if (count > 0) setDominantColor(`${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}`);
      } catch {}
    };
    img.src = profileImage;
  }, [profileImage]);

  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  // Forward scroll events from left column to right column
  useEffect(() => {
    const leftCol = leftColumnRef.current;
    const rightCol = rightColumnRef.current;
    if (!leftCol || !rightCol) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      rightCol.scrollTop += e.deltaY;
    };

    leftCol.addEventListener('wheel', handleWheel, { passive: false });
    return () => leftCol.removeEventListener('wheel', handleWheel);
  }, []);

  const [isFollowing, setIsFollowing] = useState(
    !!currentUser?.following?.includes(id)
  );
  const [followersCount, setFollowersCount] = useState(followers.length);

  const [city, state] = useMemo(
    () => (location ? location.split(',').map((s) => s.trim()) : [null, null]),
    [location]
  );

  // Derive jobTitle: prefer the per-listing Employee title (more specific,
  // e.g. "Lead Stylist at Salon X"), otherwise fall back to the global
  // User.jobTitle set on the profile itself.
  const jobTitle = useMemo(() => {
    for (const listing of listings) {
      const employee = listing.employees?.find(emp => emp.userId === id);
      if (employee?.jobTitle) return employee.jobTitle;
    }
    return (user as any).jobTitle || null;
  }, [listings, id, user]);

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to follow users');
      return;
    }
    try {
      const res = await axios.post(`/api/follow/${id}`);
      setIsFollowing((f) => !f);
      setFollowersCount(res.data?.followers?.length ?? followersCount + (isFollowing ? -1 : 1));
      toast.success(isFollowing ? 'Unfollowed' : 'Followed');
    } catch {
      toast.error('Something went wrong');
    }
  };

  // Check if user can edit this profile
  const isMasterUser = currentUser?.role === 'master' || currentUser?.role === 'admin';
  const isOwner = !!currentUser?.id && currentUser.id === id;
  const canEdit = isOwner || isMasterUser;

  const firstName = useMemo(() => {
    if (!name) return 'User';
    return name.split(' ')[0];
  }, [name]);

  const openEditProfile = () => {
    setShowDropdown(false);
    router.push(`/profile/${id}/edit`);
  };

  const handleDropdownToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!showDropdown) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.right });
    }
    setShowDropdown(!showDropdown);
  };

  // Filter listings to exclude Personal category
  const visibleListings = useMemo(() =>
    listings.filter(l => l.category !== 'Personal'),
    [listings]
  );

  const btnClass = "w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 flex items-center gap-4 transition-colors duration-150";

  const qrIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" className="text-stone-500 dark:text-stone-400 dark:text-stone-500" strokeWidth="1.5">
      <path d="M3 6C3 4.58579 3 3.87868 3.43934 3.43934C3.87868 3 4.58579 3 6 3C7.41421 3 8.12132 3 8.56066 3.43934C9 3.87868 9 4.58579 9 6C9 7.41421 9 8.12132 8.56066 8.56066C8.12132 9 7.41421 9 6 9C4.58579 9 3.87868 9 3.43934 8.56066C3 8.12132 3 7.41421 3 6Z" />
      <path d="M3 18C3 16.5858 3 15.8787 3.43934 15.4393C3.87868 15 4.58579 15 6 15C7.41421 15 8.12132 15 8.56066 15.4393C9 15.8787 9 16.5858 9 18C9 19.4142 9 20.1213 8.56066 20.5607C8.12132 21 7.41421 21 6 21C4.58579 21 3.87868 21 3.43934 20.5607C3 20.1213 3 19.4142 3 18Z" />
      <path d="M15 6C15 4.58579 15 3.87868 15.4393 3.43934C15.8787 3 16.5858 3 18 3C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6C21 7.41421 21 8.12132 20.5607 8.56066C20.1213 9 19.4142 9 18 9C16.5858 9 15.8787 9 15.4393 8.56066C15 8.12132 15 7.41421 15 6Z" />
    </svg>
  );

  const dropdownMenu = showDropdown && dropdownPos ? (
    <div
      className="fixed w-48 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 py-2 z-50"
      style={{ top: dropdownPos.top, left: dropdownPos.left - 192, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
    >
      <button onClick={() => { setShowDropdown(false); setShowQRModal(true); }} className={btnClass} type="button">
        {qrIcon}
        {isOwner ? 'Show QR Code' : 'View QR Code'}
      </button>
      <hr className="my-1 border-stone-200 dark:border-stone-800" />
      {isMasterUser && !isOwner && (
        <>
          <button onClick={openEditProfile} className={btnClass} type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 dark:text-stone-400 dark:text-stone-500">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
            </svg>
            Edit Profile
          </button>
          <hr className="my-1 border-stone-200 dark:border-stone-800" />
        </>
      )}
      {canEdit && (
        <button onClick={() => setShowDropdown(false)} className={btnClass} type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 dark:text-stone-400 dark:text-stone-500">
            <path d="M3 6h18l-2 13H5L3 6z"/>
            <path d="M8 10v6"/>
            <path d="M16 10v6"/>
            <path d="M12 10v6"/>
          </svg>
          View Analytics
        </button>
      )}
      {!isOwner && currentUser && (
        <>
          <button onClick={() => { handleFollow(); setShowDropdown(false); }} className={btnClass} type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 dark:text-stone-400 dark:text-stone-500">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
          <button onClick={() => { setShowDropdown(false); reviewModal.onOpen({ targetType: 'user', targetUser: user, currentUser }); }} className={btnClass} type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 dark:text-stone-400 dark:text-stone-500">
              <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z"/>
            </svg>
            Add Review
          </button>
          <hr className="my-1 border-stone-200 dark:border-stone-800" />
          <button onClick={() => setShowDropdown(false)} className={btnClass} type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 dark:text-stone-400 dark:text-stone-500">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" x2="4" y1="22" y2="15"/>
            </svg>
            Report Profile
          </button>
        </>
      )}
    </div>
  ) : null;

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${id}` : '';

  return (
    <>
      {/* QR Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={profileUrl}
        title={name ?? 'Profile'}
        subtitle={jobTitle || (location ? `${city}${state ? `, ${state}` : ''}` : undefined)}
        headerTitle={isOwner ? 'Share Your Profile' : 'Share This Profile'}
        headerSubtitle="Let others easily find this profile"
      />

      {/* Dropdown backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Dropdown Menu - rendered at top level to avoid overflow clipping */}
      {dropdownMenu}

      {/* ========== TWO-COLUMN LAYOUT ========== */}
      <div className="flex gap-6 -mx-6 md:-mx-24 px-6 md:px-24 -mt-2 md:-mt-8 md:h-[calc(100vh-2rem)] md:overflow-hidden">

        {/* ===== LEFT COLUMN - Profile Card ===== */}
        <div ref={leftColumnRef} className="w-[320px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
          <div
            className="rounded-2xl overflow-hidden border border-stone-200/40 shadow-sm transition-colors duration-700"
            style={{
              background: dominantColor
                ? `linear-gradient(180deg, rgba(${dominantColor}, 0.06) 0%, rgba(${dominantColor}, 0.02) 40%, white 100%)`
                : 'white',
            }}
          >
            {/* Centered Avatar & Identity */}
            <div className="pt-8 pb-5 px-6 text-center relative">
              {/* Back button - top left */}
              <button
                onClick={() => router.back()}
                className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 rounded-full transition-all z-20"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
                </svg>
              </button>
              {/* 3-dot menu - top right */}
              <button
                onClick={handleDropdownToggle}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 rounded-full transition-all z-20"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-24 h-24 rounded-full overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)' }}>
                  <img
                    src={profileImage}
                    alt={name ?? 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isStudent && (
                  <div
                    title={studentAcademyName ? `Student at ${studentAcademyName}` : 'Student'}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-stone-600 to-stone-900 ring-[1.5px] ring-white flex items-center justify-center shadow-[0_2px_8px_rgba(49,46,129,0.4)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
                    </svg>
                  </div>
                )}
                {isAdminProfile && !isStudent && (
                  <div
                    title={(user as any).role === 'master' ? 'Master Admin' : 'Admin'}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 ring-[1.5px] ring-white flex items-center justify-center shadow-[0_2px_8px_rgba(180,83,9,0.4)]"
                  >
                    <ShieldUserIcon className="w-[18px] h-[18px] text-white" strokeWidth={2} />
                  </div>
                )}
              </div>
              <div className="mt-3">
                <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100 text-center tracking-tight">
                  {name ?? 'User'}
                </h1>
                {!isCustomer && (
                  <p className="text-[13px] text-stone-400 dark:text-stone-500 mt-1">{jobTitle || (isStudent ? 'Student' : 'Member')}</p>
                )}
                {location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[13px] text-stone-400 dark:text-stone-500 mt-1 hover:text-stone-600 dark:text-stone-300 transition-colors"
                  >
                    {city}{state ? `, ${state}` : ''}
                  </a>
                )}
              </div>
              {/* Rating — hidden for customers (they're booking, not being rated) */}
              {!isCustomer && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <linearGradient id={starGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={star <= Math.round(reviewStats?.averageRating || 0) ? `url(#${starGradientId})` : '#e5e7eb'}
                    >
                      <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" />
                    </svg>
                  ))}
                  <span className="text-xs text-stone-400 dark:text-stone-500 ml-1.5">{reviewStats?.totalCount || 0}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between text-center">
                <div className="flex-1">
                  <p className="text-[18px] font-bold text-stone-900 dark:text-stone-100 tabular-nums">{followersCount}</p>
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-0.5">followers</p>
                </div>
                <div className="w-px h-10 bg-stone-100 dark:bg-stone-800" />
                <div className="flex-1">
                  <p className="text-[18px] font-bold text-stone-900 dark:text-stone-100 tabular-nums">{posts.length}</p>
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-0.5">posts</p>
                </div>
                <div className="w-px h-10 bg-stone-100 dark:bg-stone-800" />
                <div className="flex-1">
                  <p className="text-[18px] font-bold text-stone-900 dark:text-stone-100 tabular-nums">{reviewStats?.totalCount || 0}</p>
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-0.5">reviews</p>
                </div>
              </div>
            </div>

            {/* Bio Section — show the user's actual bio, or a muted prompt
                if they haven't written one yet. getProfileById returns the
                string "No Bio Provided Yet.." as a fallback, so treat that
                as empty for placeholder purposes. */}
            <div className="px-6 py-5">
              <p className={`text-[13px] leading-[1.7] whitespace-pre-wrap ${bio && bio.trim() && bio !== 'No Bio Provided Yet..' ? 'text-stone-700 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500 italic'}`}>
                {bio && bio.trim() && bio !== 'No Bio Provided Yet..'
                  ? bio
                  : `${firstName} hasn't added a bio yet.`}
              </p>

              {/* Share */}
              <div className="flex items-center justify-center gap-4 mt-6 mb-2">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/profile/${id}`;
                    if (navigator.share) {
                      navigator.share({ title: name ?? 'Profile', url });
                    } else {
                      navigator.clipboard.writeText(url);
                      toast.success('Link copied');
                    }
                  }}
                  className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:text-stone-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
                    <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
                  </svg>
                  <span className="text-[12px]">Share</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-5">
              {!isOwner && (
                <div className="flex gap-2.5">
                  <Button
                    onClick={() => {
                      if (!currentUser) {
                        toast.error('You must be logged in to message');
                        return;
                      }
                      axios.post('/api/conversations', { userId: id })
                        .then(res => {
                          messageModal.onOpen(res.data.id, id);
                        })
                        .catch(() => toast.error('Failed to start conversation'));
                    }}
                    fullWidth
                    size="lg"
                    type="button"
                  >
                    Message
                  </Button>
                  <button
                    onClick={handleFollow}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl text-[13px] font-medium transition-all border border-stone-200/60"
                    type="button"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              )}
              {isOwner && (
                <Button onClick={openEditProfile} fullWidth size="lg" type="button">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

        </div>

        {/* ===== RIGHT COLUMN - Content ===== */}
        <div ref={rightColumnRef} className="flex-1 min-w-0 md:overflow-y-auto md:py-14 scrollbar-hide md:px-2 md:-mx-2">
          {/* Mobile Profile Header (hidden on desktop) */}
          <div className="md:hidden mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-stone-100 dark:bg-stone-800 border-2 border-white shadow-lg overflow-hidden flex-shrink-0">
                <img
                  src={image || imageSrc || placeholderDataUri(name || 'User')}
                  alt={name ?? 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate">{name ?? 'User'}</h1>
                </div>
                {!isCustomer && (
                  <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">{jobTitle || 'Member'}</p>
                )}
              </div>
              <button
                onClick={handleDropdownToggle}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">

            {/* Posts Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Posts</h3>
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{posts.length}</span>
                </div>
                <button className="text-xs font-medium text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 transition-colors">View all</button>
              </div>
              {posts.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-0.5 overflow-hidden rounded-xl">
                  {posts.slice(0, 16).map((post, idx) => {
                    // Calculate which corners to round (outside corners only)
                    const cols = 8; // max columns at lg
                    const total = Math.min(posts.length, 16);
                    const isFirstRow = idx < cols;
                    const isLastRow = idx >= total - (total % cols || cols);
                    const isFirstCol = idx % cols === 0;
                    const isLastCol = idx % cols === cols - 1 || idx === total - 1;

                    let roundedClass = '';
                    if (isFirstRow && isFirstCol) roundedClass += ' rounded-tl-xl';
                    if (isFirstRow && isLastCol) roundedClass += ' rounded-tr-xl';
                    if (isLastRow && isFirstCol) roundedClass += ' rounded-bl-xl';
                    if (isLastRow && isLastCol) roundedClass += ' rounded-br-xl';

                    return (
                      <div
                        key={post.id}
                        className={`overflow-hidden ${roundedClass}`}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out both`,
                          animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                        }}
                      >
                        <PostCard
                          post={post}
                          currentUser={currentUser}
                          categories={categories}
                          hideUserInfo
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-stone-50 dark:bg-stone-900 rounded-xl">
                  <p className="text-sm text-stone-400 dark:text-stone-500">No posts yet</p>
                </div>
              )}
            </section>

            {/* Services Section — every service this user is qualified to perform,
                whether they own the listing or work there as an employee/student.
                Hidden for customers since they don't provide services. */}
            {!isCustomer && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Services</h3>
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{services.length}</span>
                </div>
              </div>
              {services.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 -mx-1 px-1 py-1 mb-10">
                  {services.map((svc, idx) => {
                    const stubListing = {
                      id: svc.listingId,
                      title: svc.listingTitle,
                      user: { id: svc.employeeId },
                    } as any;
                    return (
                      <div
                        key={svc.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out both`,
                          animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                        }}
                      >
                        <ServiceCard
                          service={{
                            id: svc.id,
                            serviceName: svc.serviceName,
                            price: svc.price,
                            category: svc.category,
                          }}
                          listing={stubListing}
                          currentUser={currentUser}
                          onClick={() => {
                            if (!currentUser) {
                              router.push(`/listings/${svc.listingId}`);
                              return;
                            }
                            router.push(`/reserve/${svc.listingId}?employeeId=${svc.employeeId}&serviceId=${svc.id}`);
                          }}
                          compact
                          solidBackground
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-stone-50 dark:bg-stone-900 rounded-xl mb-10">
                  <p className="text-sm text-stone-400 dark:text-stone-500">No services yet</p>
                </div>
              )}
            </section>
            )}

            {/* Businesses Section — places the user owns OR actively works at.
                Hidden for students (represented via their academy) and for
                customers (they book, they don't operate businesses). */}
            {!isStudent && !isCustomer && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Businesses</h3>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{visibleListings.length}</span>
                  </div>
                  <button className="text-xs font-medium text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 transition-colors">View all</button>
                </div>
                {visibleListings.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 -mx-1 px-1 py-1">
                    {visibleListings.slice(0, 8).map((listing, idx) => (
                      <div
                        key={listing.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out both`,
                          animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                        }}
                      >
                        <ListingCard
                          data={listing}
                          currentUser={currentUser}
                          categories={categories}
                          solidBackground
                          compact
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-stone-50 dark:bg-stone-900 rounded-xl">
                    <p className="text-sm text-stone-400 dark:text-stone-500">No listings yet</p>
                  </div>
                )}
              </section>
            )}

            {/* Gallery Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Gallery</h3>
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{galleryImages.length}</span>
                </div>
                <button className="text-xs font-medium text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 transition-colors">View all</button>
              </div>
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 -mx-1 px-1 py-1">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 aspect-square group cursor-pointer"
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 520ms ease-out both`,
                        animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                      }}
                    >
                      <img
                        src={img}
                        alt={`${name || 'User'} - Image ${idx + 1}`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-stone-50 dark:bg-stone-900 rounded-xl">
                  <p className="text-sm text-stone-400 dark:text-stone-500">No images yet</p>
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Reviews</h3>
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{reviews.length}</span>
                </div>
                <button className="text-xs font-medium text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 transition-colors">View all</button>
              </div>
              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reviews.slice(0, 6).map((review, idx) => (
                    <div
                      key={review.id}
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 520ms ease-out both`,
                        animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                      }}
                    >
                      <ReviewCard review={review} currentUser={currentUser} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-stone-50 dark:bg-stone-900 rounded-xl">
                  <p className="text-sm text-stone-400 dark:text-stone-500">No reviews yet</p>
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHead;

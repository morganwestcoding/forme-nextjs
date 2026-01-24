'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeListing, SafePost, SafeUser, SafeReview } from '@/app/types';
import PostCard from '@/components/feed/PostCard';
import ListingCard from '@/components/listings/ListingCard';
import { categories } from '@/components/Categories';
import useReviewModal from '@/app/hooks/useReviewModal';
import useMessageModal from '@/app/hooks/useMessageModal';
import ReviewCard from '@/components/reviews/ReviewCard';
import VerificationBadge from '@/components/VerificationBadge';
import StripeConnectCard from '@/components/stripe/StripeConnectCard';

interface ProfileHeadProps {
  user: SafeUser;
  currentUser: SafeUser | null;
  posts: SafePost[];
  listings: SafeListing[];
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
  reviews = [],
  reviewStats,
}) => {
  const {
    id,
    name,
    location,
    image,
    imageSrc,
    followers = [],
    following = [],
    galleryImages = [],
  } = user;

  const router = useRouter();
  const reviewModal = useReviewModal();
  const messageModal = useMessageModal();

  const starGradientId = `starGrad-${React.useId().replace(/:/g, '')}`;

  const [showDropdown, setShowDropdown] = useState(false);

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

  // Derive jobTitle from user's employee record
  const jobTitle = useMemo(() => {
    for (const listing of listings) {
      const employee = listing.employees?.find(emp => emp.userId === id);
      if (employee?.jobTitle) return employee.jobTitle;
    }
    return null;
  }, [listings, id]);

  // Check if user is an employee (can receive payments)
  const isEmployee = useMemo(() => {
    return listings.some(listing =>
      listing.employees?.some(emp => emp.userId === id && emp.isActive)
    );
  }, [listings, id]);

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

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  // Filter listings to exclude Personal category
  const visibleListings = useMemo(() =>
    listings.filter(l => l.category !== 'Personal'),
    [listings]
  );

  return (
    <>
      {/* Dropdown backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          className="fixed top-20 right-6 md:right-24 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
          style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
        >
          {canEdit && (
            <>
              <button
                onClick={openEditProfile}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                </svg>
                Edit Profile
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M3 6h18l-2 13H5L3 6z"/>
                  <path d="M8 10v6"/>
                  <path d="M16 10v6"/>
                  <path d="M12 10v6"/>
                </svg>
                View Analytics
              </button>
            </>
          )}

          {!isOwner && currentUser && (
            <>
              <button
                onClick={() => {
                  handleFollow();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  reviewModal.onOpen({
                    targetType: 'user',
                    targetUser: user,
                    currentUser,
                  });
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z"/>
                </svg>
                Add Review
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" x2="4" y1="22" y2="15"/>
                </svg>
                Report Profile
              </button>
            </>
          )}
        </div>
      )}

      {/* ========== TWO-COLUMN LAYOUT ========== */}
      <div className="flex gap-6 -mx-6 md:-mx-24 px-6 md:px-24 -mt-2 md:-mt-8 md:h-[calc(100vh-2rem)] md:overflow-hidden">

        {/* ===== LEFT COLUMN - Profile Card ===== */}
        <div ref={leftColumnRef} className="w-[300px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
          <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-200/60 shadow-sm">
            {/* Centered Avatar & Identity */}
            <div className="pt-8 pb-5 px-6 text-center relative">
              {/* 3-dot menu - top right */}
              <button
                onClick={handleDropdownToggle}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
              <div className="w-24 h-24 rounded-full mx-auto overflow-hidden ring-2 ring-gray-100 shadow-lg">
                <img
                  src={image || imageSrc || '/placeholder.jpg'}
                  alt={name ?? 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4">
                <h1 className="text-xl font-bold text-gray-900 text-center">
                  {(() => {
                    const displayName = name ?? 'User';
                    const words = displayName.trim().split(' ');
                    if (words.length <= 2) {
                      // Keep all words together with badge
                      return (
                        <span className="whitespace-nowrap">
                          {displayName}
                          <span className="inline-flex items-center align-middle ml-1">
                            <VerificationBadge size={18} />
                          </span>
                        </span>
                      );
                    }
                    // Keep last 2 words together with badge to prevent orphans
                    const firstWords = words.slice(0, -2);
                    const lastTwoWords = words.slice(-2).join(' ');
                    return (
                      <>
                        {firstWords.join(' ')}{' '}
                        <span className="whitespace-nowrap">
                          {lastTwoWords}
                          <span className="inline-flex items-center align-middle ml-1">
                            <VerificationBadge size={18} />
                          </span>
                        </span>
                      </>
                    );
                  })()}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{jobTitle || 'Member'}</p>
                {location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-gray-400 mt-0.5 hover:text-gray-600 transition-colors"
                  >
                    {city}{state ? `, ${state}` : ''}
                  </a>
                )}
              </div>
              {/* Rating */}
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
                    fill={star <= Math.round(reviewStats?.averageRating || 5) ? `url(#${starGradientId})` : '#e5e7eb'}
                  >
                    <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" />
                  </svg>
                ))}
                <span className="text-xs text-gray-400 ml-1.5">{reviewStats?.totalCount || 0}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-center">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">{followersCount}</p>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Followers</p>
                </div>
                <div className="w-px h-10 bg-gray-100" />
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">{posts.length}</p>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Posts</p>
                </div>
                <div className="w-px h-10 bg-gray-100" />
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">{reviewStats?.totalCount || 0}</p>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Reviews</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">
                {`${firstName} hasn't added a bio yet. When they do, you'll be able to learn more about them, their interests, and what they're all about.`}
              </p>

              {/* Social Icons */}
              <div className="flex items-center justify-center gap-3 mt-6 mb-2">
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-5 border-t border-gray-100">
              {!isOwner && (
                <div className="flex gap-2">
                  <button
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
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all"
                    type="button"
                  >
                    Message
                  </button>
                  <button
                    onClick={handleFollow}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all border border-gray-200/60"
                    type="button"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              )}
              {canEdit && (
                <button
                  onClick={openEditProfile}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all"
                  type="button"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stripe Connect - Payment setup for workers */}
          {canEdit && isEmployee && (
            <StripeConnectCard userId={id} isOwner={canEdit} />
          )}

        </div>

        {/* ===== RIGHT COLUMN - Content ===== */}
        <div ref={rightColumnRef} className="flex-1 min-w-0 md:overflow-y-auto md:py-14 scrollbar-hide">
          {/* Mobile Profile Header (hidden on desktop) */}
          <div className="md:hidden mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-white shadow-lg overflow-hidden flex-shrink-0">
                <img
                  src={image || imageSrc || '/placeholder.jpg'}
                  alt={name ?? 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900 truncate">{name ?? 'User'}</h1>
                  <VerificationBadge size={16} />
                </div>
                <p className="text-sm text-gray-500">{jobTitle || 'Member'}</p>
              </div>
              <button
                onClick={handleDropdownToggle}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-10">

            {/* Posts Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Posts</h3>
                  <span className="text-[11px] font-semibold text-gray-600 bg-gray-200/80 px-2.5 py-1 rounded-lg">{posts.length}</span>
                </div>
                <button className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">View all</button>
              </div>
              {posts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {posts.slice(0, 8).map((post, idx) => (
                    <div
                      key={post.id}
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-400">No posts yet</p>
                </div>
              )}
            </section>

            {/* Listings Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Businesses</h3>
                  <span className="text-[11px] font-semibold text-gray-600 bg-gray-200/80 px-2.5 py-1 rounded-lg">{visibleListings.length}</span>
                </div>
                <button className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">View all</button>
              </div>
              {visibleListings.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                        compact
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-400">No listings yet</p>
                </div>
              )}
            </section>

            {/* Gallery Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Gallery</h3>
                  <span className="text-[11px] font-semibold text-gray-600 bg-gray-200/80 px-2.5 py-1 rounded-lg">{galleryImages.length}</span>
                </div>
                <button className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">View all</button>
              </div>
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square group cursor-pointer"
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
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-400">No images yet</p>
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Reviews</h3>
                  <span className="text-[11px] font-semibold text-gray-600 bg-gray-200/80 px-2.5 py-1 rounded-lg">{reviews.length}</span>
                </div>
                <button className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">View all</button>
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
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-400">No reviews yet</p>
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

'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ServiceCard from './ServiceCard';
import Button from '../ui/Button';
import WorkerCard from './WorkerCard';
import PostCard from '../feed/PostCard';
import QRModal from '../modals/QRModal';
import { SafePost, SafeUser, SafeListing, SafeReview } from '@/app/types';
import useReviewModal from '@/app/hooks/useReviewModal';
import { placeholderDataUri } from '@/lib/placeholders';
import useFavorite from '@/app/hooks/useFavorite';
import ReviewCard from '@/components/reviews/ReviewCard';
import VerificationBadge from '@/components/VerificationBadge';
import InlineEmptyState from '@/components/InlineEmptyState';
import { useTheme } from '@/app/context/ThemeContext';
import { Cancel01Icon } from 'hugeicons-react';

interface ServiceItem {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  imageSrc?: string | null;
  description?: string;
  popular?: boolean;
  durationMinutes?: number;
}

interface ListingHeadProps {
  listing: SafeListing & { user: SafeUser };
  currentUser?: SafeUser | null;
  Services: ServiceItem[];
  posts?: SafePost[];
  categories?: any[];
  reviews?: SafeReview[];
  reviewStats?: {
    totalCount: number;
    averageRating: number;
  };
}

const ListingHead: React.FC<ListingHeadProps> = ({
  listing,
  currentUser,
  Services,
  posts = [],
  categories = [],
  reviews = [],
  reviewStats,
}) => {
  const router = useRouter();
  const { title, location, galleryImages, imageSrc, employees = [], user, storeHours = [], description, phoneNumber, website } = listing;
  const address = (listing as any).address;

  const starGradientId = `starGrad-${React.useId().replace(/:/g, '')}`;

  const initialFollowers = useMemo<string[]>(
    () => (Array.isArray((listing as any).followers) ? (listing as any).followers : []),
    [listing]
  );
  const [followers, setFollowers] = useState<string[]>(initialFollowers);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const dropdownBtnRef = useRef<HTMLButtonElement>(null);

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

  const isFollowing = !!currentUser?.id && followers.includes(currentUser.id);

  const reviewModal = useReviewModal();
  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId: listing.id,
    currentUser
  });

  const mainImage = imageSrc || galleryImages?.[0] || placeholderDataUri(listing.title || 'Listing');

  // Extract dominant color from listing image
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  useEffect(() => {
    if (!mainImage || mainImage.startsWith('data:')) return;
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
          // Skip very dark and very light pixels
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 30 && brightness < 220) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          setDominantColor(`${r}, ${g}, ${b}`);
        }
      } catch {}
    };
    img.src = mainImage;
  }, [mainImage]);

  const handleReserveClick = () => {
    if (!currentUser) {
      toast.error('You must be logged in to reserve');
      return;
    }
    router.push(`/reserve/${listing.id}`);
  };

  const isOwner = !!currentUser?.id && currentUser.id === user?.id;
  const isEmployee = !!currentUser?.id && employees.some(emp => emp.userId === currentUser.id);
  const isMasterUser = currentUser?.role === 'master' || currentUser?.role === 'admin';

  const handleToggleFollow = async () => {
    if (isOwner) return;
    if (!currentUser?.id) {
      toast.error('You must be logged in to follow');
      return;
    }

    setFollowers(prev =>
      prev.includes(currentUser.id)
        ? prev.filter(id => id !== currentUser.id)
        : [...prev, currentUser.id]
    );

    try {
      const res = await axios.post(`/api/follow/${listing.id}?type=listing`);
      const updated = res.data as { followers?: string[] };
      if (Array.isArray(updated?.followers)) {
        setFollowers(updated.followers);
      }
    } catch {
      setFollowers(prev =>
        prev.includes(currentUser.id)
          ? prev.filter(id => id !== currentUser.id)
          : [...prev, currentUser.id]
      );
    }
  };

  const handleQRClick = () => {
    setShowQRModal(true);
  };

  const handleDropdownToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!showDropdown) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 10, left: rect.right });
    }
    setShowDropdown(!showDropdown);
  };

  const handleEditListing = () => {
    setShowDropdown(false);
    router.push(`/listing/${listing.id}/edit`);
  };

  const qrIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" className="text-stone-500  dark:text-stone-500" strokeWidth="1.5">
      <path d="M3 6C3 4.58579 3 3.87868 3.43934 3.43934C3.87868 3 4.58579 3 6 3C7.41421 3 8.12132 3 8.56066 3.43934C9 3.87868 9 4.58579 9 6C9 7.41421 9 8.12132 8.56066 8.56066C8.12132 9 7.41421 9 6 9C4.58579 9 3.87868 9 3.43934 8.56066C3 8.12132 3 7.41421 3 6Z" />
      <path d="M3 18C3 16.5858 3 15.8787 3.43934 15.4393C3.87868 15 4.58579 15 6 15C7.41421 15 8.12132 15 8.56066 15.4393C9 15.8787 9 16.5858 9 18C9 19.4142 9 20.1213 8.56066 20.5607C8.12132 21 7.41421 21 6 21C4.58579 21 3.87868 21 3.43934 20.5607C3 20.1213 3 19.4142 3 18Z" />
      <path d="M15 6C15 4.58579 15 3.87868 15.4393 3.43934C15.8787 3 16.5858 3 18 3C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6C21 7.41421 21 8.12132 20.5607 8.56066C20.1213 9 19.4142 9 18 9C16.5858 9 15.8787 9 15.4393 8.56066C15 8.12132 15 7.41421 15 6Z" />
    </svg>
  );

  const btnClass = "w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 flex items-center gap-4 transition-colors duration-150";

  const dropdownMenu = showDropdown && dropdownPos ? (
    <div
      className="fixed w-48 bg-white dark:bg-stone-900 rounded-xl shadow-elevation-3 border border-stone-200 dark:border-stone-800 py-2 z-50"
      style={{ top: dropdownPos.top, left: dropdownPos.left - 192, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
    >
      {(isOwner || isEmployee) && (
        <>
          <button onClick={() => { setShowDropdown(false); handleQRClick(); }} className={btnClass} type="button">
            {qrIcon}
            Show QR Code
          </button>
          {isOwner && (
            <>
              <hr className="my-1 border-stone-200 dark:border-stone-800" />
              <button onClick={handleEditListing} className={btnClass} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500  dark:text-stone-500">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                </svg>
                Edit Listing
              </button>
            </>
          )}
        </>
      )}
      {!isOwner && !isEmployee && currentUser && (
        <>
          {isMasterUser && (
            <>
              <button onClick={handleEditListing} className={btnClass} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500  dark:text-stone-500">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                </svg>
                Edit Listing
              </button>
              <hr className="my-1 border-stone-200 dark:border-stone-800" />
            </>
          )}
          <button onClick={() => { setShowDropdown(false); handleQRClick(); }} className={btnClass} type="button">
            {qrIcon}
            View QR Code
          </button>
          <hr className="my-1 border-stone-200 dark:border-stone-800" />
          <button onClick={() => { handleToggleFollow(); setShowDropdown(false); }} className={btnClass} type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500  dark:text-stone-500">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
          <button onClick={(e: any) => { toggleFavorite(e); setShowDropdown(false); }} className={btnClass} type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={hasFavorited ? "text-rose-500" : "text-stone-500  dark:text-stone-500"}>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            {hasFavorited ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => {
              setShowDropdown(false);
              const url = `${window.location.origin}/listings/${listing.id}`;
              if (navigator.share) {
                navigator.share({ title, url }).catch(() => {});
              } else {
                navigator.clipboard.writeText(url);
                toast.success('Link copied');
              }
            }}
            className={btnClass}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 dark:text-stone-500">
              <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
              <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
            </svg>
            Share
          </button>
          <button
            onClick={() => { setShowDropdown(false); reviewModal.onOpen({ targetType: 'listing', targetListing: listing, currentUser }); }}
            className={btnClass}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500  dark:text-stone-500">
              <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z"/>
            </svg>
            Add Review
          </button>
        </>
      )}
      {!currentUser && (
        <button onClick={() => { setShowDropdown(false); handleQRClick(); }} className={btnClass} type="button">
          {qrIcon}
          View QR Code
        </button>
      )}
    </div>
  ) : null;

  const validServices = useMemo(
    () =>
      (Services || []).filter(
        (s) => (s.serviceName?.trim()?.length ?? 0) > 0 && Number(s.price) > 0
      ),
    [Services]
  );


  // Get operating status
  const getOperatingStatus = () => {
    if (!storeHours || storeHours.length === 0) return null;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = storeHours.find(h => h.dayOfWeek === today);
    if (!todayHours) return null;

    const isOpen = !todayHours.isClosed;
    return {
      isOpen,
      closeTime: todayHours.closeTime,
      openTime: todayHours.openTime
    };
  };

  const operatingStatus = getOperatingStatus();


  return (
    <>
      {/* QR Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        listing={listing}
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

        {/* ===== LEFT COLUMN - Business Card ===== */}
        <div ref={leftColumnRef} className="w-[320px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
          <div
            className="rounded-2xl overflow-hidden border border-stone-200/40 dark:border-stone-800 shadow-elevation-1 transition-colors duration-700"
            style={{
              background: dominantColor
                ? isDarkMode
                  ? `linear-gradient(180deg, rgba(${dominantColor}, 0.10) 0%, rgba(${dominantColor}, 0.04) 40%, #1c1917 100%)`
                  : `linear-gradient(180deg, rgba(${dominantColor}, 0.06) 0%, rgba(${dominantColor}, 0.02) 40%, white 100%)`
                : isDarkMode ? '#1c1917' : 'white',
            }}
          >
            {/* Hero section — banner behind avatar + identity + rating */}
            <div className="relative">

              {/* Back button - top left */}
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center text-stone-400  hover:text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 rounded-full transition-all z-20"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
                </svg>
              </button>

              {/* 3-dot menu - top right */}
              <button
                onClick={handleDropdownToggle}
                aria-label={showDropdown ? 'Close menu' : 'More options'}
                aria-haspopup="menu"
                aria-expanded={showDropdown}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-stone-400  hover:text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 rounded-full transition-all z-20"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${showDropdown ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}
                >
                  <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                </svg>
                <Cancel01Icon
                  className={`absolute w-5 h-5 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${showDropdown ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}`}
                  strokeWidth={2}
                />
              </button>

              {/* Content over banner */}
              <div className="relative z-10 pt-8 pb-5 px-6 text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl mx-auto overflow-hidden border-[3px] border-white shadow-elevation-2">
                  <img src={mainImage} alt={title} className="w-full h-full object-cover" />
                </div>
              <div className="mt-3">
                <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100 text-center tracking-tight">
                  {(() => {
                    return title;
                  })()}
                </h1>
                {(address || location) && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-stone-400  mt-1 hover:text-stone-600 dark:text-stone-300 transition-colors"
                  >
                    {address || location}
                  </a>
                )}
                {operatingStatus && (
                  <p className="text-sm mt-1">
                    <span className={operatingStatus.isOpen ? 'text-success-soft-foreground font-medium' : 'text-danger font-medium'}>
                      {operatingStatus.isOpen ? 'Open' : 'Closed'}
                    </span>
                    <span className="text-stone-400 dark:text-stone-500">
                      {operatingStatus.isOpen
                        ? ` · Closes ${operatingStatus.closeTime}`
                        : ` · Opens ${operatingStatus.openTime}`
                      }
                    </span>
                  </p>
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
                    fill={star <= Math.round(reviewStats?.averageRating || 0) ? `url(#${starGradientId})` : '#e5e7eb'}
                  >
                    <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" />
                  </svg>
                ))}
                <span className="text-xs text-stone-400 dark:text-stone-500 ml-1.5">{reviewStats?.totalCount || 0}</span>
              </div>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-5 ">
              <div className="flex items-center justify-between text-center">
                <div className="flex-1">
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-100 tabular-nums">{validServices.length}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">services</p>
                </div>
                <div className="w-px h-10 bg-stone-100 dark:bg-stone-800" />
                <div className="flex-1">
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-100 tabular-nums">{followers.length}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">followers</p>
                </div>
                <div className="w-px h-10 bg-stone-100 dark:bg-stone-800" />
                <div className="flex-1">
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-100 tabular-nums">{reviewStats?.totalCount || 0}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">reviews</p>
                </div>
              </div>
            </div>

            {/* Description — always rendered so the Heart/Share row stays
                in place even if this listing hasn't filled in a description. */}
            <div className="px-6 py-5">
              <p className={`text-sm leading-[1.7] whitespace-pre-wrap ${description && description.trim() ? 'text-stone-700 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500 italic'}`}>
                {description && description.trim() ? description : 'No description yet.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-5 ">
              {!isOwner ? (
                <div className="flex gap-2.5">
                  <Button onClick={handleReserveClick} className="flex-1" size="lg" type="button">
                    Reserve
                  </Button>
                  <button
                    onClick={handleToggleFollow}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-sm font-medium transition-all border border-stone-200/60 dark:border-stone-700"
                    type="button"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ) : (
                <Button onClick={handleEditListing} fullWidth size="lg" type="button">
                  Edit Listing
                </Button>
              )}
            </div>
          </div>

        </div>

        {/* ===== RIGHT COLUMN - Content ===== */}
        <div ref={rightColumnRef} className="flex-1 min-w-0 md:overflow-y-auto md:py-14 scrollbar-hide md:px-2 md:-mx-2">
          {/* Mobile Header (hidden on desktop) */}
          <div className="md:hidden mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-stone-100 dark:bg-stone-800 border-2 border-white shadow-elevation-1 overflow-hidden flex-shrink-0">
                <img
                  src={mainImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate">{title}</h1>
                </div>
                <p className="text-sm text-stone-500  dark:text-stone-500">{location || 'Business'}</p>
              </div>
              <button
                onClick={handleDropdownToggle}
                aria-label={showDropdown ? 'Close menu' : 'More options'}
                aria-haspopup="menu"
                aria-expanded={showDropdown}
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-stone-400  hover:text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`absolute transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${showDropdown ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}
                >
                  <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                </svg>
                <Cancel01Icon
                  className={`absolute w-5 h-5 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${showDropdown ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}`}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">

            {/* Services Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Services</h3>
                  <span className="text-xs font-medium text-stone-500  dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{validServices.length}</span>
                </div>
                {validServices.length > 8 && (
                  <button className="text-xs font-medium text-stone-500   hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 transition-colors">View all</button>
                )}
              </div>
              {validServices.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 -mx-1 px-1 py-1">
                  {validServices.slice(0, 8).map((service, idx) => (
                    <div
                      key={service.id}
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 520ms ease-out both`,
                        animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                      }}
                    >
                      <ServiceCard
                        service={service}
                        listing={listing}
                        currentUser={currentUser}
                        storeHours={storeHours}
                        compact
                        solidBackground
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <InlineEmptyState
                  title="No services yet"
                  subtitle={(isOwner || isMasterUser) ? 'Add services so clients know what you offer.' : 'Services offered here will show up.'}
                  onClick={(isOwner || isMasterUser) ? handleEditListing : undefined}
                />
              )}
            </section>

            {/* Professionals Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Professionals</h3>
                  <span className="text-xs font-medium text-stone-500  dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{employees.length}</span>
                </div>
                {employees.length > 8 && (
                  <button className="text-xs font-medium text-stone-500   hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 transition-colors">View all</button>
                )}
              </div>
              {employees.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 -mx-1 px-1 py-1">
                  {employees.slice(0, 8).map((employee: any, idx: number) => (
                    <div
                      key={employee.id || idx}
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 520ms ease-out both`,
                        animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                      }}
                    >
                      <WorkerCard
                        employee={employee}
                        listingTitle={title}
                        data={{ title, imageSrc: mainImage, category: (listing as any).category }}
                        listing={listing}
                        currentUser={currentUser}
                        onFollow={() => {}}
                        onBook={() => {}}
                        onCardClick={() =>
                          router.push(`/reserve/${listing.id}?employeeId=${employee.id}`)
                        }
                        compact
                        solidBackground
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-stone-50 dark:bg-stone-900 rounded-xl">
                  <p className="text-sm text-stone-400 dark:text-stone-500">No professionals yet</p>
                </div>
              )}
            </section>

            {/* Gallery Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Gallery</h3>
                  <span className="text-xs font-medium text-stone-500  dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{(galleryImages?.length || 0) + posts.length}</span>
                </div>
                {((galleryImages?.length || 0) + posts.length) > 8 && (
                  <button className="text-xs font-medium text-stone-500   hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 transition-colors">View all</button>
                )}
              </div>

              {(galleryImages && galleryImages.length > 0) || posts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages && galleryImages.length > 0 && galleryImages.map((image, idx) => (
                    <div
                      key={`gallery-${idx}`}
                      className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 group cursor-pointer"
                    >
                      <img
                        src={image}
                        alt={`${title} - Image ${idx + 1}`}
                        loading="lazy"
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                  {posts.map((post) => (
                    <div key={post.id}>
                      <PostCard
                        post={post}
                        currentUser={currentUser}
                        categories={categories}
                        variant="listing"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <InlineEmptyState
                  title="No gallery images yet"
                  subtitle={(isOwner || isMasterUser) ? 'Add photos to showcase your space.' : 'Photos of this space will show up here.'}
                  onClick={(isOwner || isMasterUser) ? handleEditListing : undefined}
                />
              )}
            </section>

            {/* Reviews Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Reviews</h3>
                  <span className="text-xs font-medium text-stone-500  dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full tabular-nums">{reviews.length}</span>
                </div>
                {reviews.length > 8 && (
                  <button className="text-xs font-medium text-stone-500   hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 transition-colors">View all</button>
                )}
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
                <InlineEmptyState
                  title="No reviews yet"
                  subtitle="Reviews from clients will show up here."
                />
              )}
            </section>

          </div>
        </div>
      </div>
    </>
  );
};

export default ListingHead;

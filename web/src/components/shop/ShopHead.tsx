'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ProductCard from './ProductCard';
import Button from '../ui/Button';
import WorkerCard from '../listings/WorkerCard';
import PostCard from '../feed/PostCard';
import { SafePost, SafeUser, SafeShop, SafeProduct } from '@/app/types';
import useFavorite from '@/app/hooks/useFavorite';
import VerificationBadge from '@/components/VerificationBadge';
import InlineEmptyState from '@/components/InlineEmptyState';
import { placeholderDataUri } from '@/lib/placeholders';
import { Cancel01Icon } from 'hugeicons-react';

interface ShopHeadProps {
  shop: SafeShop & {
    user: SafeUser;
    products?: SafeProduct[];
    employees?: any[];
    storeHours?: any[];
    listingId?: string | null;
  };
  currentUser?: SafeUser | null;
  Products: SafeProduct[];
  posts?: SafePost[];
  categories?: any[];
}

const ShopHead: React.FC<ShopHeadProps> = ({
  shop,
  currentUser,
  Products = [],
  posts = [],
  categories = []
}) => {
  const router = useRouter();

  const {
    name = 'Shop Name',
    location,
    galleryImages = [],
    coverImage,
    logo,
    description,
    employees = [],
    user,
    storeHours = [],
    isVerified = false,
    followers: initialFollowersRaw = [],
    listingId
  } = shop;

  const address = shop.address;
  const phoneNumber = (shop as any).phoneNumber;
  const website = (shop as any).website;

  const starGradientId = `starGrad-${React.useId().replace(/:/g, '')}`;

  const initialFollowers = useMemo<string[]>(
    () => (Array.isArray(initialFollowersRaw) ? initialFollowersRaw : []),
    [initialFollowersRaw]
  );
  const [followers, setFollowers] = useState<string[]>(initialFollowers);
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

  const isFollowing = !!currentUser?.id && followers.includes(currentUser.id);

  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId: shop.id,
    currentUser
  });

  const mainImage = coverImage || logo || galleryImages?.[0] || placeholderDataUri(shop.name || 'Shop');

  // Extract dominant color from shop image
  const [dominantColor, setDominantColor] = useState<string | null>(null);
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
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 30 && brightness < 220) {
            r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
          }
        }
        if (count > 0) setDominantColor(`${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}`);
      } catch {}
    };
    img.src = mainImage;
  }, [mainImage]);

  const isOwner = !!currentUser?.id && currentUser.id === user?.id;
  const isEmployee = !!currentUser?.id && employees.some((emp: any) => emp.userId === currentUser.id);

  const handleToggleFollow = async () => {
    if (isOwner) return;
    if (!currentUser?.id) return;

    setFollowers(prev =>
      prev.includes(currentUser.id)
        ? prev.filter(id => id !== currentUser.id)
        : [...prev, currentUser.id]
    );

    try {
      const res = await axios.post(`/api/follow/${shop.id}?type=shop`);
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

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleReserveClick = () => {
    if (!currentUser) return;
    if (listingId) {
      window.location.href = `/listings/${listingId}`;
    }
  };

  const handleEditShop = () => {
    setShowDropdown(false);
    router.push(`/shops/${shop.id}/edit`);
  };

  const validProducts = useMemo(() => {
    return (Products || []).filter(
      (p) => (p.name?.trim()?.length ?? 0) > 0 && Number(p.price) > 0
    );
  }, [Products]);

  const handleAddWorker = () => {
    if (!isOwner) return;
    const url = new URL(window.location.href);
    url.searchParams.set('addWorker', '1');
    router.push(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  };

  const handleAddMedia = () => {
    if (!isOwner) return;
    const url = new URL(window.location.href);
    url.searchParams.set('addMedia', '1');
    router.push(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  };

  // Get operating status
  const getOperatingStatus = () => {
    if (!storeHours || storeHours.length === 0) return null;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = storeHours.find((h: any) => h.dayOfWeek === today);
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
          className="fixed top-[5.375rem] right-6 md:right-24 w-48 bg-white dark:bg-stone-900  rounded-xl shadow-elevation-3 border border-stone-200 dark:border-stone-800  py-2 z-50"
          style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
        >
          {(isOwner || isEmployee) && (
            <>
              {isOwner && (
                <>
                  <button onClick={handleEditShop} className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200  hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900   flex items-center gap-4" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500  dark:text-stone-500     ">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                    </svg>
                    Edit Shop
                  </button>
                  <button onClick={() => { setShowDropdown(false); handleAddWorker(); }} className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200  hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900   flex items-center gap-4" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500  dark:text-stone-500     ">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    Add Professional
                  </button>
                </>
              )}
            </>
          )}

          {!isOwner && !isEmployee && currentUser && (
            <>
              <button onClick={() => { handleToggleFollow(); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200  hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900   flex items-center gap-4" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500  dark:text-stone-500     ">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button onClick={(e: any) => { toggleFavorite(e); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200  hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900   flex items-center gap-4" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={hasFavorited ? "text-rose-500" : "text-stone-500  dark:text-stone-500     "}>
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                {hasFavorited ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  const url = `${window.location.origin}/shops/${shop.id}`;
                  if (navigator.share) {
                    navigator.share({ title: name, url }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(url);
                    toast.success('Link copied');
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200  hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900   flex items-center gap-4"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 dark:text-stone-500">
                  <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
                  <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
                </svg>
                Share
              </button>
            </>
          )}
        </div>
      )}

      {/* ========== TWO-COLUMN LAYOUT ========== */}
      <div className="flex gap-6 -mx-6 md:-mx-24 px-6 md:px-24 -mt-2 md:-mt-8 md:h-[calc(100vh-2rem)] md:overflow-hidden">

        {/* ===== LEFT COLUMN - Shop Card ===== */}
        <div ref={leftColumnRef} className="w-[320px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
          <div
            className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700/40 shadow-elevation-1 transition-colors duration-700"
            style={{
              background: dominantColor
                ? `linear-gradient(180deg, rgba(${dominantColor}, 0.06) 0%, rgba(${dominantColor}, 0.02) 40%, white 100%)`
                : 'white',
            }}
          >
            {/* Hero section */}
            <div className="relative">
              {/* Back button - top left */}
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center text-stone-400     hover:text-stone-600 dark:text-stone-300  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800   rounded-full transition-all z-20"
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
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-stone-400     hover:text-stone-600 dark:text-stone-300  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800   rounded-full transition-all z-20"
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

              {/* Content */}
              <div className="relative z-10 pt-8 pb-5 px-6 text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl mx-auto overflow-hidden border-[3px] border-white shadow-elevation-2">
                  <img src={mainImage} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100  text-center tracking-tight">
                      {name}
                    </h1>
                    {isVerified && <VerificationBadge size={16} />}
                  </div>
                  {(address || location) && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || location || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-stone-400     mt-1 hover:text-stone-600 dark:text-stone-300  transition-colors"
                    >
                      {address || location}
                    </a>
                  )}
                  {operatingStatus && (
                    <p className="text-sm mt-1">
                      <span className={operatingStatus.isOpen ? 'text-success-soft-foreground font-medium' : 'text-danger font-medium'}>
                        {operatingStatus.isOpen ? 'Open' : 'Closed'}
                      </span>
                      <span className="text-stone-400   dark:text-stone-400 ">
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
                      fill={star <= 5 ? `url(#${starGradientId})` : '#e5e7eb'}
                    >
                      <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" />
                    </svg>
                  ))}
                  <span className="text-xs text-stone-400   dark:text-stone-400  ml-1.5">0</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between text-center">
                <div className="flex-1">
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-100  tabular-nums">{validProducts.length}</p>
                  <p className="text-xs text-stone-400   dark:text-stone-400  mt-0.5">products</p>
                </div>
                <div className="w-px h-10 bg-stone-100 dark:bg-stone-800 " />
                <div className="flex-1">
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-100  tabular-nums">{followers.length}</p>
                  <p className="text-xs text-stone-400   dark:text-stone-400  mt-0.5">followers</p>
                </div>
                <div className="w-px h-10 bg-stone-100 dark:bg-stone-800 " />
                <div className="flex-1">
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-100  tabular-nums">{posts.length}</p>
                  <p className="text-xs text-stone-400   dark:text-stone-400  mt-0.5">posts</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="px-6 py-5">
              <p className={`text-sm leading-[1.7] whitespace-pre-wrap ${description && description.trim() ? 'text-stone-700 dark:text-stone-200 ' : 'text-stone-400   dark:text-stone-400  italic'}`}>
                {description && description.trim() ? description : 'No description yet.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-5">
              {!isOwner ? (
                <div className="flex gap-2.5">
                  {listingId && (
                    <Button onClick={handleReserveClick} className="flex-1" size="lg" type="button">
                      Reserve
                    </Button>
                  )}
                  <button
                    onClick={handleToggleFollow}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      listingId
                        ? 'bg-stone-50   hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800   text-stone-700 dark:text-stone-200  border border-stone-200 dark:border-stone-700/60'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                    type="button"
                    style={!listingId ? { boxShadow: '0 2px 8px rgba(0,0,0,0.12)' } : undefined}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ) : (
                <Button onClick={handleEditShop} fullWidth size="lg" type="button">
                  Edit Shop
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN - Content ===== */}
        <div ref={rightColumnRef} className="flex-1 min-w-0 md:overflow-y-auto md:py-14 scrollbar-hide">
          {/* Mobile Header (hidden on desktop) */}
          <div className="md:hidden mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-stone-100 dark:bg-stone-800  border-2 border-white shadow-elevation-2 overflow-hidden flex-shrink-0">
                <img
                  src={mainImage}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100  truncate">{name}</h1>
                  {isVerified && <VerificationBadge size={14} />}
                </div>
                <p className="text-sm text-stone-500  dark:text-stone-500     ">{location || 'Shop'}</p>
              </div>
              <button
                onClick={handleDropdownToggle}
                aria-label={showDropdown ? 'Close menu' : 'More options'}
                aria-haspopup="menu"
                aria-expanded={showDropdown}
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-stone-400     hover:text-stone-600 dark:text-stone-300  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800  "
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

            {/* Products Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100  tracking-tight">Products</h3>
                  <span className="text-xs font-medium text-stone-500  dark:text-stone-500      bg-stone-100 dark:bg-stone-800  px-2.5 py-1 rounded-full tabular-nums">{validProducts.length}</span>
                </div>
                {validProducts.length > 8 && (
                  <button className="text-xs font-medium text-stone-500        hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200   transition-colors">View all</button>
                )}
              </div>
              {validProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0.5 overflow-hidden rounded-xl">
                  {validProducts.slice(0, 10).map((product, idx) => (
                    <div
                      key={product.id}
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 520ms ease-out both`,
                        animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                      }}
                    >
                      <ProductCard
                        data={product}
                        currentUser={currentUser}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <InlineEmptyState
                  title="No products yet"
                  subtitle={isOwner ? 'Add products to start selling.' : 'Products will show up here.'}
                  onClick={isOwner ? handleEditShop : undefined}
                />
              )}
            </section>

            {/* Professionals Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100  tracking-tight">Professionals</h3>
                  <span className="text-xs font-medium text-stone-500  dark:text-stone-500      bg-stone-100 dark:bg-stone-800  px-2.5 py-1 rounded-full tabular-nums">{employees.length}</span>
                </div>
                {employees.length > 8 && (
                  <button className="text-xs font-medium text-stone-500        hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200   transition-colors">View all</button>
                )}
              </div>
              {employees.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        listingTitle={name}
                        data={{ title: name, imageSrc: mainImage, category: shop.category || '' }}
                        listing={shop as any}
                        currentUser={currentUser}
                        onFollow={() => {}}
                        onBook={() => {}}
                        compact
                        solidBackground
                      />
                    </div>
                  ))}
                  {isOwner && (
                    <button
                      onClick={handleAddWorker}
                      type="button"
                      className="group relative aspect-[3/4] rounded-xl border-2 border-dashed border-stone-200   bg-stone-50   hover:border-stone-300 dark:border-stone-700  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800   transition-all"
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-900  border border-stone-200 dark:border-stone-800  flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400   dark:text-stone-400 ">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-stone-500  dark:text-stone-500     ">Add Professional</span>
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 bg-stone-50 dark:bg-stone-900  rounded-xl">
                  <p className="text-sm text-stone-400   dark:text-stone-400 ">No professionals yet</p>
                </div>
              )}
            </section>

            {/* Gallery Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100  tracking-tight">Gallery</h3>
                  <span className="text-xs font-medium text-stone-500  dark:text-stone-500      bg-stone-100 dark:bg-stone-800  px-2.5 py-1 rounded-full tabular-nums">{(galleryImages?.length || 0) + posts.length}</span>
                </div>
                {((galleryImages?.length || 0) + posts.length) > 8 && (
                  <button className="text-xs font-medium text-stone-500        hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200   transition-colors">View all</button>
                )}
              </div>
              {(galleryImages && galleryImages.length > 0) || posts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages && galleryImages.map((image: string, idx: number) => (
                    <div
                      key={`image-${idx}`}
                      className="relative rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800  aspect-square group cursor-pointer"
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 520ms ease-out both`,
                        animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                      }}
                    >
                      <img
                        src={image}
                        alt={`${name} - Image ${idx + 1}`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                  {posts.map((post, idx) => (
                    <div
                      key={post.id}
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 520ms ease-out both`,
                        animationDelay: `${Math.min(60 + (galleryImages?.length || 0) + idx * 30, 360)}ms`,
                      }}
                    >
                      <PostCard
                        post={post}
                        currentUser={currentUser}
                        categories={categories}
                        variant="listing"
                      />
                    </div>
                  ))}
                  {isOwner && (
                    <button
                      onClick={handleAddMedia}
                      type="button"
                      className="group relative aspect-square rounded-xl border-2 border-dashed border-stone-200   bg-stone-50   hover:border-stone-300 dark:border-stone-700  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800   transition-all"
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-900  border border-stone-200 dark:border-stone-800  flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400   dark:text-stone-400 ">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-stone-500  dark:text-stone-500     ">Add Media</span>
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <InlineEmptyState
                  title="No gallery images yet"
                  subtitle={isOwner ? 'Add photos to bring your shop to life.' : 'Photos of this shop will show up here.'}
                  onClick={isOwner ? handleEditShop : undefined}
                />
              )}
            </section>

            {/* Hours Section */}
            {storeHours && storeHours.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100  tracking-tight">Hours</h3>
                  </div>
                </div>
                {(() => {
                  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                  const todayData = storeHours.find((h: any) => h.dayOfWeek === today);
                  const isOpenNow = todayData && !todayData.isClosed;

                  return (
                    <div className="max-w-[480px]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-100 ">
                          {isOpenNow ? 'Open Now' : 'Closed'}
                          {todayData && !todayData.isClosed && (
                            <span className="text-stone-400   dark:text-stone-400  font-normal"> · until {todayData.closeTime?.replace(':00', '')}</span>
                          )}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {storeHours.map((hours: any, idx: number) => {
                          const isToday = hours.dayOfWeek === today;
                          const dayAbbrev = hours.dayOfWeek.slice(0, 3);

                          return (
                            <div
                              key={idx}
                              className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${
                                isToday ? 'bg-stone-900' : 'bg-stone-50 dark:bg-stone-900 '
                              }`}
                            >
                              <span className={`text-xs font-medium ${isToday ? 'text-white' : hours.isClosed ? 'text-stone-300' : 'text-stone-500  dark:text-stone-500     '}`}>
                                {dayAbbrev}
                              </span>
                              <span className={`text-xs mt-1 ${isToday ? 'text-white/60' : hours.isClosed ? 'text-stone-300' : 'text-stone-400   dark:text-stone-400 '}`}>
                                {hours.isClosed ? '—' : hours.openTime?.replace(':00', '').replace(' ', '')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </section>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default ShopHead;

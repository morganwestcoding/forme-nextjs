'use client';

import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Link02Icon, UserAdd01Icon, UserCheck01Icon, Location01Icon, Call02Icon, Globe02Icon, Share08Icon } from 'hugeicons-react';
import ProductCard from './ProductCard';
import WorkerCard from '../listings/WorkerCard';
import PostCard from '../feed/PostCard';
import ShopCategoryNav from './ShopCategoryNav';
import SectionHeader from '@/app/market/SectionHeader';
import { SafePost, SafeUser, SafeShop, SafeProduct } from '@/app/types';
import useFavorite from '@/app/hooks/useFavorite';

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
  } = shop as any;

  const address = (shop as any).address;
  const phoneNumber = (shop as any).phoneNumber;
  const website = (shop as any).website;

  const initialFollowers = useMemo<string[]>(
    () => (Array.isArray(initialFollowersRaw) ? initialFollowersRaw : []),
    [initialFollowersRaw]
  );
  const [followers, setFollowers] = useState<string[]>(initialFollowers);
  const [showDropdown, setShowDropdown] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'About' | 'Products' | 'Professionals' | 'Posts' | 'Reviews' | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse changes
  React.useEffect(() => {
    const checkSidebar = () => setSidebarCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    checkSidebar();
    window.addEventListener('sidebarToggle', checkSidebar);
    return () => window.removeEventListener('sidebarToggle', checkSidebar);
  }, []);

  // Responsive grid - matches Market pattern, adds 1 column when sidebar is collapsed
  const gridColsClass = sidebarCollapsed
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  const isFollowing = !!currentUser?.id && followers.includes(currentUser.id);

  const { hasFavorited, toggleFavorite } = useFavorite({
    listingId: shop.id,
    currentUser
  });

  const mainImage = coverImage || logo || galleryImages?.[0] || '/placeholder.jpg';

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

  const validProducts = useMemo(
    () =>
      (Products || []).filter(
        (p) => (p.name?.trim()?.length ?? 0) > 0 && Number(p.price) > 0
      ),
    [Products]
  );

  const handleAddProduct = () => {
    if (!isOwner) return;
    const url = new URL(window.location.href);
    url.searchParams.set('addProduct', '1');
    router.push(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  };

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

  // AI chat submit handler
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    setIsLoading(true);
    console.log('Chat query:', chatInput);
    setTimeout(() => {
      setIsLoading(false);
      setChatInput('');
    }, 500);
  };

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
          {(isOwner || isEmployee) && (
            <>
              {isOwner && (
                <>
                  <button onClick={handleAddProduct} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add Product
                  </button>
                  <button onClick={() => { setShowDropdown(false); handleAddWorker(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    Add Team Member
                  </button>
                </>
              )}
            </>
          )}

          {!isOwner && !isEmployee && currentUser && (
            <>
              <button onClick={() => { handleToggleFollow(); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button onClick={(e: any) => { toggleFavorite(e); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={hasFavorited ? "text-rose-500" : "text-gray-500"}>
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                {hasFavorited ? 'Saved' : 'Save Shop'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ========== SHOP HEADER ========== */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-12 pb-8">

          {/* Centered Layout - Like Market */}
          <div className="text-center">

            {/* Title + Verified Badge + 3 Dots Menu */}
            <div className="flex items-center justify-center gap-3 relative">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                {name}
              </h1>
              {isVerified && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" className="flex-shrink-0">
                  <path
                    d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                    fill="url(#verifiedGradShop)"
                  />
                  <path d="M9 12.8929C9 12.8929 10.2 13.5447 10.8 14.5C10.8 14.5 12.6 10.75 15 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <defs>
                    <linearGradient id="verifiedGradShop" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#4A90E2" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              {/* 3 Dots Menu - Right Aligned */}
              <button
                onClick={handleDropdownToggle}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all duration-200"
                type="button"
                title="More options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </div>

            {/* Address & Status */}
            <p className="text-gray-500 text-base mt-3 max-w-2xl mx-auto">
              {address && location ? `${address}, ${location}` : address || location}
              {operatingStatus && (
                <>
                  <span className="text-gray-300 mx-2">·</span>
                  <span className={operatingStatus.isOpen ? 'text-emerald-600' : 'text-rose-600'}>
                    {operatingStatus.isOpen
                      ? `Open til ${operatingStatus.closeTime}`
                      : `Closed · Opens ${operatingStatus.openTime}`
                    }
                  </span>
                </>
              )}
            </p>

            {/* Social Stats */}
            <div className="flex items-center justify-center gap-4 sm:gap-5 mt-4 text-[13px] sm:text-[14px] text-neutral-500">
              {/* Rating */}
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-semibold text-neutral-900">4.8</span>
              </span>

              {/* Followers */}
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 12C14.4853 12 16.5 9.98528 16.5 7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5C7.5 9.98528 9.51472 12 12 12Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span><span className="font-semibold text-neutral-900">{followers.length}</span> followers</span>
              </span>

              {/* Posts */}
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.5 12L21.5 12" strokeLinecap="round"/>
                  <path d="M12 21.5V12" strokeLinecap="round"/>
                </svg>
                <span><span className="font-semibold text-neutral-900">{posts.length}</span> posts</span>
              </span>

              {/* Likes */}
              <button
                onClick={(e: any) => toggleFavorite(e)}
                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-[18px] h-[18px] ${hasFavorited ? 'text-rose-500' : ''}`} fill={hasFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                  <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span><span className="font-semibold text-neutral-900">{(shop as any).favoriteCount || 0}</span> likes</span>
              </button>
            </div>

            {/* Search Bar - Centered */}
            <div className="mt-6 max-w-3xl mx-auto">
              <form onSubmit={handleChatSubmit}>
                <div className="bg-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Looking for something?"
                      className="flex-1 text-[13px] sm:text-[14px] bg-transparent border-none outline-none text-neutral-900 placeholder-neutral-400 font-normal pl-2 sm:pl-3"
                    />

                    <div className="w-px h-5 bg-neutral-300" />

                    {/* Attach Button */}
                    <button
                      className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-all duration-200"
                      type="button"
                      title="Attach"
                    >
                      <Link02Icon size={20} strokeWidth={1.5} className="sm:w-[22px] sm:h-[22px]" />
                    </button>

                    {/* Follow Button */}
                    {currentUser && !isOwner && (
                      <button
                        onClick={handleToggleFollow}
                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-all duration-200"
                        type="button"
                        title={isFollowing ? 'Following' : 'Follow'}
                      >
                        {isFollowing ? (
                          <UserCheck01Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
                        ) : (
                          <UserAdd01Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
                        )}
                      </button>
                    )}

                    {/* Reserve/Book Button */}
                    {currentUser && listingId && (
                      <button
                        onClick={handleReserveClick}
                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-all duration-200"
                        type="button"
                        title="Book Appointment"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M18 2V4M6 2V4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3.5 8H20.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Category Nav */}
            <div className="mt-5 flex justify-center">
              <ShopCategoryNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

          </div>

        </div>
      </div>

      {/* ========== SIMPLE CONTENT SECTIONS ========== */}
      <div className="space-y-12">

        {/* Products */}
        {validProducts.length > 0 && (!activeTab || activeTab === 'Products') && (
          <section>
            <SectionHeader
              title="Our Products"
              onViewAll={validProducts.length > 8 ? () => {} : undefined}
              viewAllLabel={validProducts.length > 8 ? `View all ${validProducts.length}` : undefined}
              className="!-mt-2 !mb-6"
            />
            <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
              {validProducts.slice(0, 8).map((product, idx) => (
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
              {isOwner && (
                <div className="max-w-[250px]">
                  <button
                    onClick={handleAddProduct}
                    type="button"
                    className="group relative h-[284px] w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 transition-all"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Add Product</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Team */}
        {employees.length > 0 && (!activeTab || activeTab === 'Professionals') && (
          <section>
            <SectionHeader
              title="Meet Our Team"
              className="!-mt-2 !mb-6"
            />
            <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
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
                    data={{ title: name, imageSrc: mainImage, category: (shop as any).category }}
                    listing={shop as any}
                    currentUser={currentUser}
                    onFollow={() => {}}
                    onBook={() => {}}
                  />
                </div>
              ))}
              {isOwner && (
                <div className="max-w-[250px]">
                  <button
                    onClick={handleAddWorker}
                    type="button"
                    className="group relative h-[288px] w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 transition-all"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Add Team Member</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Gallery / Posts */}
        {((galleryImages && galleryImages.length > 0) || (posts && posts.length > 0) || isOwner) && (!activeTab || activeTab === 'Posts') && (
          <section>
            <SectionHeader
              title="Photos & Gallery"
              className="!-mt-2 !mb-6"
            />
            <div className={`grid ${gridColsClass} gap-3 transition-all duration-300`}>
              {galleryImages && galleryImages.map((image: string, idx: number) => (
                <div
                  key={`image-${idx}`}
                  className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square group cursor-pointer"
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

              {posts && posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  categories={categories}
                  variant="listing"
                />
              ))}

              {isOwner && (
                <div className="relative aspect-square min-h-[200px]">
                  <button
                    onClick={handleAddMedia}
                    type="button"
                    className="group absolute inset-0 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 transition-all"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-500">Add Media</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* About & Hours */}
        {(description || (storeHours && storeHours.length > 0)) && (!activeTab || activeTab === 'About') && (
          <section>
            <SectionHeader
              title="Info & Business Hours"
              className="!-mt-2 !mb-6"
            />
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              {/* Left - Description & Contact */}
              <div className="flex-1 max-w-lg">
                {/* Description */}
                {description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                )}

                {/* Contact Actions */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {address ? (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(address + (location ? ', ' + location : ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-colors"
                    >
                      <Location01Icon size={18} strokeWidth={1.5} />
                      Directions
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-400 transition-colors cursor-not-allowed"
                      disabled
                    >
                      <Location01Icon size={18} strokeWidth={1.5} />
                      Directions
                    </button>
                  )}
                  {phoneNumber ? (
                    <a
                      href={`tel:${phoneNumber}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-colors"
                    >
                      <Call02Icon size={18} strokeWidth={1.5} />
                      Call
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-400 transition-colors cursor-not-allowed"
                      disabled
                    >
                      <Call02Icon size={18} strokeWidth={1.5} />
                      Call
                    </button>
                  )}
                  {website ? (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-colors"
                    >
                      <Globe02Icon size={18} strokeWidth={1.5} />
                      Website
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-400 transition-colors cursor-not-allowed"
                      disabled
                    >
                      <Globe02Icon size={18} strokeWidth={1.5} />
                      Website
                    </button>
                  )}
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-colors"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: name, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                  >
                    <Share08Icon size={18} strokeWidth={1.5} />
                    Share
                  </button>
                </div>
              </div>

              {/* Right - Hours Card */}
              {storeHours && storeHours.length > 0 && (() => {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const todayData = storeHours.find((h: any) => h.dayOfWeek === today);
                const isOpenNow = todayData && !todayData.isClosed;

                return (
                  <div className="flex-shrink-0 flex-1 max-w-[480px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-900">
                        {isOpenNow ? 'Open Now' : 'Closed'}
                        {todayData && !todayData.isClosed && (
                          <span className="text-gray-400 font-normal"> · until {todayData.closeTime?.replace(':00', '')}</span>
                        )}
                      </span>
                    </div>

                    {/* Week Row */}
                    <div className="flex gap-2">
                      {storeHours.map((hours: any, idx: number) => {
                        const isToday = hours.dayOfWeek === today;
                        const dayAbbrev = hours.dayOfWeek.slice(0, 3);

                        return (
                          <div
                            key={idx}
                            className={`
                              flex-1 flex flex-col items-center py-3 rounded-xl transition-all
                              ${isToday
                                ? 'bg-gray-900'
                                : 'bg-gray-50'
                              }
                            `}
                          >
                            <span className={`text-[11px] font-medium ${isToday ? 'text-white' : hours.isClosed ? 'text-gray-300' : 'text-gray-500'}`}>
                              {dayAbbrev}
                            </span>
                            <span className={`text-[10px] mt-1 ${isToday ? 'text-white/60' : hours.isClosed ? 'text-gray-300' : 'text-gray-400'}`}>
                              {hours.isClosed ? '—' : hours.openTime?.replace(':00', '').replace(' ', '')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        {/* Empty States for owner */}
        {validProducts.length === 0 && employees.length === 0 && isOwner && !activeTab && (
          <section className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get started with your shop</h3>
              <p className="text-gray-500 mb-6">Add products and team members to start selling.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                  type="button"
                >
                  Add Product
                </button>
                <button
                  onClick={handleAddWorker}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  Add Team Member
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default ShopHead;

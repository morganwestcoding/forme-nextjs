'use client';

import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import ProductCard from './ProductCard';
import WorkerCard from '../listings/WorkerCard';
import PostCard from '../feed/PostCard';
import { SafeProduct, SafeUser, SafeShop, SafePost } from '@/app/types';
import useReservationModal from '@/app/hooks/useReservationModal';
import { categories } from '@/components/Categories';
import SectionHeader from '@/app/market/SectionHeader';

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
  const {
    name = 'Shop Name',
    location,
    galleryImages = [],
    coverImage,
    logo,
    description = 'No description yet.',
    employees = [],
    user,
    storeHours = [],
    isVerified = false,
    followers = [],
    listingId
  } = shop as any;

  const initialFollowers = useMemo<string[]>(
    () => (Array.isArray(followers) ? followers : []),
    [followers]
  );
  const [shopFollowers, setShopFollowers] = useState<string[]>(initialFollowers);
  const isFollowing = !!currentUser?.id && shopFollowers.includes(currentUser.id);

  type TabKey = 'About' | 'Products' | 'Team' | 'Posts' | 'Reviews';
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [scrollY, setScrollY] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const reservationModal = useReservationModal();

  const mainImage = coverImage || logo || galleryImages?.[0] || '/placeholder.jpg';

  const isOwner = !!currentUser?.id && currentUser.id === user?.id;

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleReserveClick = () => {
    if (!currentUser) return;
    if (listingId) {
      window.location.href = `/listings/${listingId}`;
    }
  };

  const handleToggleFollow = async () => {
    if (isOwner) return;
    if (!currentUser?.id) return;

    setShopFollowers(prev =>
      prev.includes(currentUser.id)
        ? prev.filter(id => id !== currentUser.id)
        : [...prev, currentUser.id]
    );

    try {
      const res = await axios.post(`/api/follow/${shop.id}?type=shop`);
      const updated = res.data as { followers?: string[] };
      if (Array.isArray(updated?.followers)) {
        setShopFollowers(updated.followers);
      }
    } catch (err) {
      setShopFollowers(prev =>
        prev.includes(currentUser.id)
          ? prev.filter(id => id !== currentUser.id)
          : [...prev, currentUser.id]
      );
    }
  };

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'About', label: 'About Us' },
    { key: 'Products', label: 'Products' },
    { key: 'Team', label: 'Team' },
    { key: 'Posts', label: 'Posts' },
    { key: 'Reviews', label: 'Reviews' },
  ];

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
          {!isOwner && currentUser && (
            <>
              <button
                onClick={() => {
                  handleToggleFollow();
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
            </>
          )}
        </div>
      )}

      {/* Hero Section */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-10 overflow-hidden">
          {/* Background Image with Parallax Effect */}
          <div className="absolute inset-0 -mx-6 md:-mx-24 overflow-hidden">
            <img
              src={mainImage}
              alt={name}
              className="absolute w-full object-cover will-change-transform"
              style={{
                top: '-20%',
                height: '140%',
                transform: `translateY(${scrollY * 0.3}px)`
              }}
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top,' +
                  'rgba(0,0,0,0.65) 0%,' +
                  'rgba(0,0,0,0.55) 15%,' +
                  'rgba(0,0,0,0.40) 35%,' +
                  'rgba(0,0,0,0.25) 55%,' +
                  'rgba(0,0,0,0.15) 75%,' +
                  'rgba(0,0,0,0.08) 100%)',
              }}
            />
          </div>

          {/* Three-dot menu button */}
          <div className="absolute top-6 right-6 md:right-24 z-50">
            <button
              onClick={handleDropdownToggle}
              className="p-1 hover:bg-white/5 rounded-xl transition-colors relative z-50"
              type="button"
              aria-label="Options menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12Z" stroke="white" strokeWidth="1.5" fill='white'></path>
                <path d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" stroke="white" strokeWidth="1.5" fill='white'></path>
                <path d="M6 12C6 11.1716 5.32843 10.5 4.5 10.5C3.67157 10.5 3 11.1716 3 12C3 12.8284 3.67157 13.5 4.5 13.5C5.32843 13.5 6 12.8284 6 12Z" stroke="white" strokeWidth="1.5" fill='white'></path>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="relative z-10 pb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-4xl font-bold text-white">
                  {name}
                </h1>
                {/* Verified Badge */}
                {isVerified && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="#60A5FA"
                    aria-label="Verified"
                  >
                    <path
                      d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                      stroke="white"
                      strokeWidth="1"
                      fill="#60A5FA"
                    />
                    <path
                      d="M9 12.8929L10.8 14.5L15 9.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <div className="flex items-center gap-3 text-white/80 mb-6">
                <span className="text-sm">
                  {location || 'Location'}
                </span>
                {storeHours && storeHours.length > 0 && (() => {
                  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                  const todayHours = storeHours.find((h: any) => h.dayOfWeek === today);
                  const isOpen = todayHours && !todayHours.isClosed;

                  return (
                    <>
                      <span className="text-white/40">·</span>
                      <span className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span className="text-sm">
                          {isOpen ? `We're open until ${todayHours.closeTime}` : `We're closed today`}
                        </span>
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {currentUser && (
                  <>
                    <button
                      onClick={handleReserveClick}
                      className="bg-transparent border border-white/30 hover:border-white/50 text-white hover:text-white py-2.5 px-4 rounded-xl transition-all duration-300 text-sm flex items-center justify-center space-x-2"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 2V4M6 2V4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.5 8H20.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 8H21" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Reserve</span>
                    </button>

                    {!isOwner && (
                      <button
                        onClick={handleToggleFollow}
                        className="bg-transparent border border-white/30 hover:border-white/50 text-white hover:text-white py-2.5 px-4 rounded-xl transition-all duration-300 text-sm flex items-center justify-center space-x-2"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="19" y1="8" x2="19" y2="14"/>
                          <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        <span>{isFollowing ? 'Following' : 'Follow'}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="-mx-6 md:-mx-24 pb-3 relative z-10">
            <div className="flex items-center justify-center">
              {tabs.map(({ key, label }, index) => {
                const isSelected = activeTab === key;
                const selectedIndex = tabs.findIndex(t => t.key === activeTab);
                const hasSelection = selectedIndex !== -1;

                const handleTabClick = () => {
                  setActiveTab(activeTab === key ? null : key);
                };

                const getDividerState = () => {
                  if (!hasSelection) return 'vertical';
                  if (index === selectedIndex - 1 || index === selectedIndex) return 'horizontal';
                  return 'hidden';
                };
                const dividerState = getDividerState();

                return (
                  <div key={key} className="relative flex items-center">
                    <button
                      onClick={handleTabClick}
                      className={`
                        px-8 py-3.5 text-sm transition-all duration-200
                        ${isSelected
                          ? 'text-[#60A5FA] font-medium'
                          : 'text-white/80 hover:text-white'
                        }
                      `}
                      type="button"
                    >
                      {label}
                    </button>

                    {index < tabs.length - 1 && (
                      <span
                        className={`
                          bg-white/60 transition-all duration-300 ease-out
                          ${dividerState === 'horizontal' ? 'w-3 h-[0.5px] bg-[#60A5FA]' : ''}
                          ${dividerState === 'vertical' ? 'w-[0.5px] h-4' : ''}
                          ${dividerState === 'hidden' ? 'w-[0.5px] h-4 opacity-0' : ''}
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {/* About Section */}
        {(activeTab === null || activeTab === 'About') && (
          <>
            {description && (
              <>
                <SectionHeader title="What We're All About" />
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed text-[15px]">{description}</p>
                </div>

                {/* Engagement Metrics */}
                {(shopFollowers.length > 0 || (posts?.length || 0) > 0) && (
                  <div className="flex items-center gap-6 pb-8 mb-8 text-sm border-b border-gray-100">
                    {shopFollowers.length > 0 && (
                      <>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-gray-700">{shopFollowers.length}</span>
                          <span className="text-gray-500">followers</span>
                        </div>
                        <span className="text-gray-300">·</span>
                      </>
                    )}

                    {(posts?.length || 0) > 0 && (
                      <>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-gray-700">{posts?.length || 0}</span>
                          <span className="text-gray-500">posts</span>
                        </div>
                        <span className="text-gray-300">·</span>
                      </>
                    )}

                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1.5">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      <span className="font-semibold text-gray-700">4.8</span>
                      <span className="text-gray-500">rating</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Store Hours */}
            {storeHours && storeHours.length > 0 && (
              <div className="mb-12">
                <SectionHeader title="Store Hours" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
                  {storeHours.map((hours: any, index: number) => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const isToday = hours.dayOfWeek === today;

                    return (
                      <div
                        key={index}
                        className={`
                          rounded-lg border transition-all duration-200
                          ${isToday
                            ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="px-3 py-2.5">
                          <div className={`text-xs font-semibold mb-1 uppercase tracking-wide ${isToday ? 'text-white/70' : 'text-gray-500'}`}>
                            {hours.dayOfWeek}
                          </div>

                          {hours.isClosed ? (
                            <div className={`text-sm font-medium ${isToday ? 'text-white/80' : 'text-gray-400'}`}>
                              Closed
                            </div>
                          ) : (
                            <div className={`text-sm font-semibold tabular-nums ${isToday ? 'text-white' : 'text-gray-900'}`}>
                              {hours.openTime}
                              <span className={`text-xs mx-1 ${isToday ? 'text-white/50' : 'text-gray-400'}`}>→</span>
                              {hours.closeTime}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Products Section */}
        {(activeTab === null || activeTab === 'Products') && (
          <div className="mb-12">
            <SectionHeader title="Our Products" />

            {Products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No products yet</p>
                <p className="text-sm text-gray-500">Products will be listed here once added</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Products.map((product, idx) => (
                  <ProductCard
                    key={product.id || idx}
                    data={product}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team Section */}
        {(activeTab === null || activeTab === 'Team') && (
          <div className="mb-12">
            <SectionHeader title="Our Team" />

            {employees.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No team members yet</p>
                <p className="text-sm text-gray-500">Team members will appear here once added</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {employees.map((employee: any, index: number) => (
                  <WorkerCard
                    key={employee.id || index}
                    employee={employee}
                    listingTitle={name}
                    data={{ title: name, imageSrc: mainImage, category: (shop as any)?.category }}
                    listing={shop as any}
                    currentUser={currentUser}
                    onFollow={() => {}}
                    onBook={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts Section */}
        {(activeTab === null || activeTab === 'Posts') && (
          <div className="mb-12">
            <SectionHeader title="Gallery" />

            {(!galleryImages || galleryImages.length === 0) && (!posts || posts.length === 0) ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No posts yet</p>
                <p className="text-sm text-gray-500">Share photos and videos to showcase your work</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages && galleryImages.length > 0 && (
                  galleryImages.map((image: string, index: number) => (
                    <div
                      key={`image-${index}`}
                      className="relative rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 group"
                      style={{ aspectRatio: '1 / 1' }}
                    >
                      <img
                        src={image}
                        alt={`${name} - Image ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  ))
                )}

                {posts && posts.length > 0 && (
                  posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      categories={categories}
                      variant="listing"
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        {(activeTab === null || activeTab === 'Reviews') && (
          <div className="mb-12">
            <SectionHeader title="Reviews" />
            <div className="text-center py-16">
              <p className="text-base font-medium text-gray-600 mb-1">No reviews yet</p>
              <p className="text-sm text-gray-500">Reviews from customers will appear here</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ShopHead;

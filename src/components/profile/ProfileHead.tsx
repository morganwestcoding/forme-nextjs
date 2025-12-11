'use client';

import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserAdd01Icon, UserCheck01Icon } from 'hugeicons-react';
import { SafeListing, SafePost, SafeUser, SafeReview } from '@/app/types';
import PostCard from '@/components/feed/PostCard';
import ListingCard from '@/components/listings/ListingCard';
import SectionHeader from '@/app/market/SectionHeader';
import ProfileCategoryNav from '@/components/profile/ProfileCategoryNav';
import { categories } from '@/components/Categories';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useReviewModal from '@/app/hooks/useReviewModal';
import useMessageModal from '@/app/hooks/useMessageModal';
import { useSidebarState } from '@/app/hooks/useSidebarState';
import ReviewCard from '@/components/reviews/ReviewCard';
import VerificationBadge from '@/components/VerificationBadge';

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

type TabKey = 'About' | 'Posts' | 'Businesses' | 'Images' | 'Reviews';

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
    bio,
    location,
    image,
    imageSrc,
    backgroundImage,
    followers = [],
    following = [],
    galleryImages = [],
    email,
  } = user;

  const registerModal = useRegisterModal();
  const reviewModal = useReviewModal();
  const messageModal = useMessageModal();

  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const sidebarCollapsed = useSidebarState();

  // Responsive grid - matches Market pattern
  const gridColsClass = sidebarCollapsed
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  const [isFollowing, setIsFollowing] = useState(
    !!currentUser?.following?.includes(id)
  );
  const [followersCount, setFollowersCount] = useState(followers.length);

  const [city, state] = useMemo(
    () => (location ? location.split(',').map((s) => s.trim()) : [null, null]),
    [location]
  );

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
    registerModal.onOpen({
      mode: 'edit',
      prefill: {
        id,
        name: name ?? '',
        email: email ?? '',
        location: location ?? '',
        bio: bio ?? '',
        image: image ?? '',
        imageSrc: imageSrc ?? '',
        backgroundImage: backgroundImage ?? '',
        targetUserId: !isOwner && isMasterUser ? id : undefined,
      },
    });
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  // Filter listings to exclude Personal category
  const visibleListings = useMemo(() =>
    listings.filter(l => l.category !== 'Personal'),
    [listings]
  );

  // Get operating status from first listing
  const getOperatingStatus = () => {
    const firstListing = listings.find(l => l.category !== 'Personal');
    const storeHours = firstListing?.storeHours;
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

      {/* ========== PROFILE HEADER ========== */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-11 pb-8">

          {/* Content */}
          <div className="relative z-10 pb-6">
            {/* Centered Layout - Matching Market structure exactly */}
            <div className="relative">
              {/* 3 Dots Menu - Top Right */}
              <button
                onClick={handleDropdownToggle}
                className="absolute right-0 top-0 p-1.5 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all duration-200"
                type="button"
                title="More options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>

              {/* Vertically aligned content */}
              <div className="flex flex-col items-center">
                {/* Avatar + Name/Info block */}
                <div className="flex items-center gap-4 mt-2">
                  {/* Avatar - sized to match WorkerCard */}
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
                    <img
                      src={image || imageSrc || '/placeholder.jpg'}
                      alt={name ?? 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name and Info stacked, left-aligned */}
                  <div className="flex flex-col items-start">
                    {/* Name + Badge */}
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                        {name ?? 'User'}
                      </h1>
                      <VerificationBadge size={20} />
                    </div>

                    {/* Info line */}
                    <p className="text-gray-500 text-base mt-1">
                      <span className="font-semibold text-neutral-900">{followersCount}</span> followers
                      <span className="mx-1.5 text-gray-300">·</span>
                      <span className="font-semibold text-neutral-900">{posts.length}</span> posts
                      <span className="mx-1.5 text-gray-300">·</span>
                      {city || 'City'}{state ? `, ${state}` : ''}
                      {operatingStatus && (
                        <>
                          <span className="text-gray-300 mx-1.5">·</span>
                          <span className={operatingStatus.isOpen ? 'text-emerald-600' : 'text-rose-600'}>
                            {operatingStatus.isOpen ? `Open` : `Closed`}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - Centered with labels */}
                <div className="mt-4">
                  <div
                    className="border border-neutral-200 rounded-2xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(to right, rgb(245 245 245) 0%, rgb(241 241 241) 100%)'
                    }}
                  >
                    <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5">
                      {/* Message Button */}
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
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/80 text-neutral-600 hover:text-neutral-900 transition-all duration-200"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" strokeLinejoin="round" />
                          <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[13px] font-medium">Inbox</span>
                      </button>

                      <div className="w-px h-5 bg-neutral-300" />

                      {/* Follow Button */}
                      <button
                        onClick={handleFollow}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/80 text-neutral-600 hover:text-neutral-900 transition-all duration-200"
                        type="button"
                      >
                        {isFollowing ? (
                          <UserCheck01Icon size={18} color="currentColor" />
                        ) : (
                          <UserAdd01Icon size={18} color="currentColor" />
                        )}
                        <span className="text-[13px] font-medium">{isFollowing ? 'Following' : 'Follow'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Nav - Below, centered */}
                <div className="mt-4">
                  <ProfileCategoryNav
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========== CONTENT SECTIONS ========== */}
      <div className="relative -mt-[30px]">
        <div className="space-y-12">

        {/* Posts Section */}
        {(activeTab === null || activeTab === 'Posts') && (
          <section>
            <SectionHeader
              title={`${firstName}'s Posts`}
              onViewAll={posts.length > 8 ? () => {} : undefined}
              viewAllLabel={posts.length > 8 ? `View all ${posts.length}` : undefined}
              className="!-mt-2 !mb-6"
            />
            {posts.length ? (
              <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
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
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No posts yet</p>
                <p className="text-sm text-gray-500">Posts will appear here once shared</p>
              </div>
            )}
          </section>
        )}

        {/* Businesses Section */}
        {(activeTab === null || activeTab === 'Businesses') && (
          <section>
            <SectionHeader
              title={`${firstName}'s Listings`}
              onViewAll={visibleListings.length > 8 ? () => {} : undefined}
              viewAllLabel={visibleListings.length > 8 ? `View all ${visibleListings.length}` : undefined}
              className="!-mt-2 !mb-6"
            />
            {visibleListings.length ? (
              <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
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
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No listings yet</p>
                <p className="text-sm text-gray-500">Listings will appear here once created</p>
              </div>
            )}
          </section>
        )}

        {/* Gallery Section */}
        {(activeTab === null || activeTab === 'Images') && (
          <section>
            <SectionHeader
              title={`${firstName}'s Gallery`}
              className="!-mt-2 !mb-6"
            />
            {galleryImages.length ? (
              <div className={`grid ${gridColsClass} gap-3 transition-all duration-300`}>
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
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No images yet</p>
                <p className="text-sm text-gray-500">Gallery images will appear here</p>
              </div>
            )}
          </section>
        )}

        {/* Reviews Section */}
        {(activeTab === null || activeTab === 'Reviews') && (
          <section>
            <SectionHeader
              title={`${firstName}'s Reviews`}
              onViewAll={reviews.length > 8 ? () => {} : undefined}
              viewAllLabel={reviews.length > 8 ? `View all ${reviews.length}` : undefined}
              className="!-mt-2 !mb-6"
            />
            {reviews.length > 0 ? (
              <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                {reviews.slice(0, 8).map((review, idx) => (
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
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No reviews yet</p>
                <p className="text-sm text-gray-500">Reviews will appear here once shared</p>
              </div>
            )}
          </section>
        )}

        {/* About & Hours - Last section like ListingHead */}
        {(bio || (() => {
          const firstListing = listings.find(l => l.category !== 'Personal');
          return firstListing?.storeHours && firstListing.storeHours.length > 0;
        })()) && (!activeTab || activeTab === 'About') && (
          <section>
            <SectionHeader
              title="Info & Business Hours"
              className="!-mt-2 !mb-6"
            />
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              {/* Left - Bio & Contact */}
              <div className="flex-1 max-w-lg">
                {bio && (
                  <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
                )}

                {/* Contact Actions */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Email
                    </a>
                  )}
                  {location && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Location
                    </a>
                  )}
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-colors"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: name ?? 'Profile', url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied!');
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Share
                  </button>
                </div>
              </div>

              {/* Right - Hours Card */}
              {(() => {
                const firstListing = listings.find(l => l.category !== 'Personal');
                const storeHours = firstListing?.storeHours;
                if (!storeHours || storeHours.length === 0) return null;

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
        </div>
      </div>
    </>
  );
};

export default ProfileHead;

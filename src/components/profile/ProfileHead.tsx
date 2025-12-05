'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link02Icon, UserAdd01Icon, UserCheck01Icon } from 'hugeicons-react';
import { SafeListing, SafePost, SafeUser, SafeReview } from '@/app/types';
import CreateChatButton from '@/components/profile/CreateChatButton';
import PostCard from '@/components/feed/PostCard';
import ListingCard from '@/components/listings/ListingCard';
import ServiceCard from '@/components/listings/ServiceCard';
import SectionHeader from '@/app/market/SectionHeader';
import ProfileCategoryNav from '@/components/profile/ProfileCategoryNav';
import ContextualSearch from '@/components/search/ContextualSearch';
import { categories } from '@/components/Categories';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useReviewModal from '@/app/hooks/useReviewModal';
import ServiceSelector, { Service } from '@/components/inputs/ServiceSelector';
import Modal from '@/components/modals/Modal';
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

type TabKey = 'About' | 'Posts' | 'Listings' | 'Images' | 'Services' | 'Reviews';

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

  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle search query changes for local filtering
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Listen for sidebar collapse changes
  useEffect(() => {
    const checkSidebar = () => setSidebarCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    checkSidebar();
    window.addEventListener('sidebarToggle', checkSidebar);
    return () => window.removeEventListener('sidebarToggle', checkSidebar);
  }, []);

  // Responsive grid - matches Market pattern
  const gridColsClass = sidebarCollapsed
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  // State for services
  const [services, setServices] = useState<any[]>([]);
  const [isProvider, setIsProvider] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [editServicesList, setEditServicesList] = useState<Service[]>([]);
  const [isSavingServices, setIsSavingServices] = useState(false);

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

  // Fetch services for providers
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const res = await axios.get(`/api/employees/services?userId=${id}`);
        if (res.data.services && res.data.services.length > 0) {
          setServices(res.data.services);
          setIsProvider(true);
        } else {
          setServices([]);
          setIsProvider(false);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
        setIsProvider(false);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, [id]);

  const handleEditServices = () => {
    setEditServicesList(services.map(s => ({
      id: s.id,
      serviceName: s.serviceName,
      price: s.price,
      category: s.category,
    })));
    setIsEditingServices(true);
  };

  const handleSaveServices = async () => {
    if (!canEdit) return;

    try {
      setIsSavingServices(true);
      const res = await axios.post('/api/employees/services', {
        services: editServicesList,
      });

      if (res.data.success) {
        setServices(res.data.services);
        setIsEditingServices(false);
        toast.success('Services updated successfully!');
      }
    } catch (error) {
      console.error('Error saving services:', error);
      toast.error('Failed to update services');
    } finally {
      setIsSavingServices(false);
    }
  };

  const handleCancelEditServices = () => {
    setIsEditingServices(false);
    setEditServicesList([]);
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter((post) =>
      post.content?.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  // Filter listings based on search query
  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings.filter(l => l.category !== 'Personal');
    const query = searchQuery.toLowerCase();
    return listings
      .filter(l => l.category !== 'Personal')
      .filter((listing) =>
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.location?.toLowerCase().includes(query)
      );
  }, [listings, searchQuery]);

  const filteredImages = galleryImages;

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.serviceName?.toLowerCase().includes(query) ||
        service.category?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

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
              {isProvider && (
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleEditServices();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Edit Services
                </button>
              )}
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
        <div className="relative px-6 md:px-24 pt-8 pb-5">

          {/* Centered Layout */}
          <div className="text-center relative">

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

            {/* Profile Picture - Centered */}
            <div className="w-20 h-20 md:w-[88px] md:h-[88px] rounded-full overflow-hidden border-2 border-gray-100 mx-auto mt-5 mb-2">
              <img
                src={image || imageSrc || '/placeholder.jpg'}
                alt={name ?? 'User'}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name + Verified Badge */}
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                {name ?? 'User'}
              </h1>
              <VerificationBadge size={18} />
            </div>

            {/* Location & Status */}
            <p className="text-gray-500 text-sm mt-1">
              {city || 'City'}{state ? `, ${state}` : ''}
              {operatingStatus && (
                <>
                  <span className="text-gray-300 mx-1.5">·</span>
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
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-neutral-500">
              <span><span className="font-semibold text-neutral-900">{followersCount}</span> followers</span>
              <span><span className="font-semibold text-neutral-900">{posts.length}</span> posts</span>
              <span><span className="font-semibold text-neutral-900">{following.length}</span> following</span>
            </div>

            {/* Search Bar - Centered */}
            <div className="mt-4 max-w-3xl mx-auto">
              <ContextualSearch
                placeholder="Looking for something?"
                filterTypes={['listing', 'post', 'service']}
                entityId={id}
                entityType="user"
                onSearchChange={handleSearchChange}
                enableLocalFilter
                actionButtons={
                  <>
                    {/* Attach Button */}
                    <button
                      className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-all duration-200"
                      type="button"
                      title="Attach"
                    >
                      <Link02Icon size={20} strokeWidth={1.5} className="sm:w-[22px] sm:h-[22px]" />
                    </button>

                    {/* Message Button */}
                    {currentUser && !isOwner && (
                      <CreateChatButton currentUser={currentUser} otherUserId={id} variant="icon" />
                    )}

                    {/* Follow Button */}
                    {currentUser && !isOwner && (
                      <button
                        onClick={handleFollow}
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

                    {/* Edit Button for owners */}
                    {canEdit && (
                      <button
                        onClick={openEditProfile}
                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-all duration-200"
                        type="button"
                        title="Edit Profile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" strokeLinejoin="round"/>
                          <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </>
                }
              />
            </div>

            {/* Category Nav */}
            <div className="mt-3 flex justify-center">
              <ProfileCategoryNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                showServices={isProvider}
              />
            </div>

          </div>

        </div>
      </div>

      {/* ========== CONTENT SECTIONS ========== */}
      <div className="space-y-12">

        {/* Posts Section */}
        {(activeTab === null || activeTab === 'Posts') && (
          <section>
            <SectionHeader
              title={`${firstName}'s Posts`}
              onViewAll={filteredPosts.length > 8 ? () => {} : undefined}
              viewAllLabel={filteredPosts.length > 8 ? `View all ${filteredPosts.length}` : undefined}
              className="!-mt-2 !mb-6"
            />
            {filteredPosts.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No posts found</p>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : filteredPosts.length ? (
              <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                {filteredPosts.slice(0, 8).map((post, idx) => (
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

        {/* Listings Section */}
        {(activeTab === null || activeTab === 'Listings') && (
          <section>
            <SectionHeader
              title={`${firstName}'s Listings`}
              onViewAll={filteredListings.length > 8 ? () => {} : undefined}
              viewAllLabel={filteredListings.length > 8 ? `View all ${filteredListings.length}` : undefined}
              className="!-mt-2 !mb-6"
            />
            {filteredListings.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No listings found</p>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : filteredListings.length ? (
              <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                {filteredListings.slice(0, 8).map((listing, idx) => (
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
            {filteredImages.length ? (
              <div className={`grid ${gridColsClass} gap-3 transition-all duration-300`}>
                {filteredImages.map((img, idx) => (
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

        {/* Services Section */}
        {(activeTab === null || activeTab === 'Services') && isProvider && (
          <section>
            <SectionHeader
              title={`${firstName}'s Services`}
              onViewAll={filteredServices.length > 8 ? () => {} : undefined}
              viewAllLabel={filteredServices.length > 8 ? `View all ${filteredServices.length}` : undefined}
              className="!-mt-2 !mb-6"
            />
            {isLoadingServices ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500">Loading services...</p>
              </div>
            ) : filteredServices.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No services found</p>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : filteredServices.length > 0 ? (
              <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                {filteredServices.slice(0, 8).map((service, idx) => (
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
                      currentUser={currentUser}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No services yet</p>
                <p className="text-sm text-gray-500">Services will appear here once added</p>
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

      {/* Services Edit Modal */}
      {isEditingServices && (
        <Modal
          isOpen={isEditingServices}
          title="Edit Your Services"
          actionLabel={isSavingServices ? 'Saving...' : 'Save Changes'}
          secondaryActionLabel="Cancel"
          onClose={handleCancelEditServices}
          onSubmit={handleSaveServices}
          secondaryAction={handleCancelEditServices}
          disabled={isSavingServices}
          body={
            <div className="flex flex-col gap-6">
              <p className="text-sm text-gray-600">
                Manage the services you provide. Add, edit, or remove services to keep your profile up to date.
              </p>
              <ServiceSelector
                onServicesChange={setEditServicesList}
                existingServices={editServicesList}
              />
            </div>
          }
        />
      )}
    </>
  );
};

export default ProfileHead;

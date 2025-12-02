// components/profile/ProfileHead.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeListing, SafePost, SafeUser } from '@/app/types';
import CreateChatButton from '@/components/profile/CreateChatButton';
import PostCard from '@/components/feed/PostCard';
import ListingCard from '@/components/listings/ListingCard';
import ServiceCard from '@/components/listings/ServiceCard';
import SectionHeader from '@/app/market/SectionHeader';
import { categories } from '@/components/Categories';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import ServiceSelector, { Service } from '@/components/inputs/ServiceSelector';
import Modal from '@/components/modals/Modal';
import ListingLocalSearch from '@/components/listings/ListingLocalSearch';

interface ProfileHeadProps {
  user: SafeUser;
  currentUser: SafeUser | null;
  posts: SafePost[];
  listings: SafeListing[];
}

type TabKey = 'About' | 'Posts' | 'Listings' | 'Images' | 'Services';

const ProfileHead: React.FC<ProfileHeadProps> = ({
  user,
  currentUser,
  posts = [],
  listings = [],
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

  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const avatar = image || '/people/chicken-headshot.jpeg';

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

  // Check if user can edit this profile (owner or master/admin)
  const isMasterUser = currentUser?.role === 'master' || currentUser?.role === 'admin';
  const isOwner = !!currentUser?.id && currentUser.id === id;
  const canEdit = isOwner || isMasterUser;

  // Get first name from user's full name
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
        // Pass targetUserId if master is editing another user's profile
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

  // Filter images based on search - images don't have searchable text, so just return all
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

  // Hero background image - prioritize user's backgroundImage, then fallback to other images
  const heroImage =
    backgroundImage ||
    (listings.length > 0 && listings[0].imageSrc) ||
    imageSrc ||
    (galleryImages.length > 0 && galleryImages[0]) ||
    '/placeholder.jpg';

  // Build tabs array
  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'About', label: 'About' },
    { key: 'Posts', label: 'Posts' },
    { key: 'Listings', label: 'Listings' },
    { key: 'Images', label: 'Images' },
    ...(isProvider ? [{ key: 'Services' as TabKey, label: 'Services' }] : []),
  ];

  return (
    <>
      {/* Dropdown backdrop - closes dropdown when clicked - Outside main flow */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Dropdown Menu - Fixed position to escape overflow */}
      {showDropdown && (
        <div
          className="fixed top-20 right-6 md:right-24 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
          style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
        >
          {/* Owner options */}
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
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Profile Settings
              </button>
            </>
          )}

          {/* Non-owner options */}
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
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Copy Link
              </button>
            </>
          )}
        </div>
      )}

      {/* Hero Section */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div
          className="relative px-6 md:px-24 pt-10 overflow-hidden"
        >
          {/* Background Image with Parallax Effect */}
          <div className="absolute inset-0 -mx-6 md:-mx-24 overflow-hidden">
            <img
              src={heroImage}
              alt={name ?? 'User'}
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

          {/* Three-dot menu button - top right */}
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
            {/* Row 1: Avatar + Name + Location */}
            <div className="flex items-center gap-3 mb-6">
              {/* User Profile Image - Circular, Full Color */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg relative group">
                  <Image
                    src={avatar}
                    alt={name ?? 'User'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Name and Location */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-4xl font-bold text-white">
                    {name ?? 'User'}
                  </h1>
                  {/* Verified Badge */}
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
                </div>

                <div className="flex items-center gap-3 text-white/80">
                  <span className="text-sm">
                    {city || 'City'}{state ? `, ${state}` : ''}
                  </span>
                  {/* Operating Status - from first listing if available */}
                  {(() => {
                    const firstListing = listings.find(l => l.category !== 'Personal');
                    const storeHours = firstListing?.storeHours;

                    if (storeHours && storeHours.length > 0) {
                      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                      const todayHours = storeHours.find((h: any) => h.dayOfWeek === today);
                      const isOpen = todayHours && !todayHours.isClosed;

                      return (
                        <>
                          <span className="text-white/40">·</span>
                          <span className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span className="text-sm">
                              {isOpen ? `Open until ${todayHours.closeTime}` : `Closed today`}
                            </span>
                          </span>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>

            {/* Row 2: Search Bar and Buttons */}
            <div className="flex gap-3">
              <div className="flex-grow">
                <ListingLocalSearch
                  placeholder="Search..."
                  onSearchChange={setSearchQuery}
                />
              </div>

              {/* Action Buttons - Side by Side */}
              {currentUser && (
                <>
                  {/* Message Button or Edit Button */}
                  {canEdit ? (
                    <button
                      onClick={openEditProfile}
                      className="bg-transparent border border-white/30 hover:border-white/50 text-white hover:text-white py-2.5 px-4 rounded-xl transition-all duration-300 text-sm flex items-center justify-center space-x-2"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" strokeLinejoin="round"/>
                        <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Edit</span>
                    </button>
                  ) : (
                    <CreateChatButton currentUser={currentUser} otherUserId={id} />
                  )}

                  {/* Follow Button for non-owners */}
                  {!isOwner && (
                    <button
                      onClick={handleFollow}
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

          {/* Navigation Tabs */}
          <div className="-mx-6 md:-mx-24 pb-3 relative z-10">
            <div className="flex items-center justify-center">
              {tabs.map(({ key, label }, index) => {
                const isSelected = activeTab === key;
                const selectedIndex = tabs.findIndex(t => t.key === activeTab);
                const hasSelection = selectedIndex !== -1;

                // Toggle behavior: click to select, click again to deselect (show all)
                const handleTabClick = () => {
                  setActiveTab(activeTab === key ? null : key);
                };

                // Determine divider state: adjacent to selected rotates horizontal, others disappear
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

                    {/* Divider: vertical by default, rotates horizontal when adjacent to selected, disappears otherwise */}
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
            {/* Bio Section */}
            {bio && (
              <>
                <SectionHeader title="About" />
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed text-[15px]">{bio}</p>
                </div>

                {/* Engagement Metrics */}
                {(followersCount > 0 || posts.length > 0 || following.length > 0) && (
                  <div className="flex items-center gap-6 pb-8 mb-8 text-sm border-b border-gray-100">
                    {/* Posts - only show if > 0 */}
                    {posts.length > 0 && (
                      <>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-gray-700">{posts.length}</span>
                          <span className="text-gray-500">posts</span>
                        </div>
                        <span className="text-gray-300">·</span>
                      </>
                    )}

                    {/* Followers - only show if > 0 */}
                    {followersCount > 0 && (
                      <>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-gray-700">{followersCount}</span>
                          <span className="text-gray-500">followers</span>
                        </div>
                        <span className="text-gray-300">·</span>
                      </>
                    )}

                    {/* Following - only show if > 0 */}
                    {following.length > 0 && (
                      <>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-gray-700">{following.length}</span>
                          <span className="text-gray-500">following</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Contact Information */}
            {(location || email) && (
              <div className="mb-12">
                <SectionHeader title="Contact" />
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-sm text-gray-700 hover:text-gray-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span className="font-medium">{email}</span>
                    </a>
                  )}

                  {location && (
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="font-medium">{location}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Posts Section */}
        {(activeTab === null || activeTab === 'Posts') && (
          <div className="mb-12">
            <SectionHeader title={`${firstName}'s Posts`} />
            {filteredPosts.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No posts found</p>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : filteredPosts.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    categories={categories}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No posts yet</p>
                <p className="text-sm text-gray-500">Posts will appear here once shared</p>
              </div>
            )}
          </div>
        )}

        {/* Listings Section */}
        {(activeTab === null || activeTab === 'Listings') && (
          <div className="mb-12">
            <SectionHeader title={`${firstName}'s Listings`} />
            {filteredListings.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No listings found</p>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : filteredListings.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    data={listing}
                    currentUser={currentUser}
                    categories={categories}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No listings yet</p>
                <p className="text-sm text-gray-500">Listings will appear here once created</p>
              </div>
            )}
          </div>
        )}

        {/* Images Section */}
        {(activeTab === null || activeTab === 'Images') && (
          <div className="mb-12">
            <SectionHeader title={`${firstName}'s Gallery`} />
            {filteredImages.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 group"
                    style={{ aspectRatio: '1 / 1' }}
                  >
                    <img
                      src={img}
                      alt={`${name || 'User'} - Image ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No images yet</p>
                <p className="text-sm text-gray-500">Gallery images will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Services Section */}
        {(activeTab === null || activeTab === 'Services') && isProvider && (
          <div className="mb-12">
            <SectionHeader title={`${firstName}'s Services`} />

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-base font-medium text-gray-600 mb-1">No services yet</p>
                <p className="text-sm text-gray-500">Services will appear here once added</p>
              </div>
            )}
          </div>
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

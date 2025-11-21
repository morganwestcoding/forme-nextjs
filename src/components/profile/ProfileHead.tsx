// components/profile/ProfileHead.tsx
'use client';

import React from 'react';
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

interface ProfileHeadProps {
  user: SafeUser;
  currentUser: SafeUser | null;
  posts: SafePost[];
  listings: SafeListing[];
}

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

  const [activeTab, setActiveTab] = React.useState<
    'Posts' | 'Listings' | 'Images' | 'Services'
  >('Posts');

  // State for services
  const [services, setServices] = React.useState<any[]>([]);
  const [isProvider, setIsProvider] = React.useState(false);
  const [isLoadingServices, setIsLoadingServices] = React.useState(false);
  const [isEditingServices, setIsEditingServices] = React.useState(false);
  const [editServicesList, setEditServicesList] = React.useState<Service[]>([]);
  const [isSavingServices, setIsSavingServices] = React.useState(false);

  const [isFollowing, setIsFollowing] = React.useState(
    !!currentUser?.following?.includes(id)
  );
  const [followersCount, setFollowersCount] = React.useState(followers.length);

  const [city, state] = React.useMemo(
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
  const firstName = React.useMemo(() => {
    if (!name) return 'User';
    return name.split(' ')[0];
  }, [name]);

  const openEditProfile = () => {
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
  React.useEffect(() => {
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

  // Hero background image - prioritize user's backgroundImage, then fallback to other images
  const heroImage =
    backgroundImage ||
    (listings.length > 0 && listings[0].imageSrc) ||
    imageSrc ||
    (galleryImages.length > 0 && galleryImages[0]) ||
    '/placeholder.jpg';

  return (
    <div className="w-full space-y-6">
      {/* Hero Banner Style Header - Matches ListingHead */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-10 overflow-hidden">
          {/* Background Image - extends to bottom of CategoryNav */}
          <div className="absolute inset-0 -mx-6 md:-mx-24">
            <img
              src={heroImage}
              alt={name ?? 'User'}
              className="absolute inset-0 w-full h-full object-cover grayscale"
            />
            {/* Simple dark overlay */}
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Three-dot menu button - top right */}
          <div className="absolute top-6 right-6 md:right-24 z-50">
            <button
              className="p-1 hover:bg-white/20 rounded-xl transition-colors relative z-50"
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

          {/* Content Overlay */}
          <div className="relative z-10 pb-6 flex items-center gap-6">
            {/* User Profile Image - Circular, Full Color, Left Side */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white shadow-lg relative group">
                <Image
                  src={avatar}
                  alt={name ?? 'User'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Content - Right of Profile Picture */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Name with Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
                  {name ?? 'User'}
                </h1>

                {/* Verified Badge */}
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="26"
                    height="26"
                    fill="#60A5FA"
                    className="shrink-0 text-white drop-shadow-lg"
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
              </div>

              {/* Location */}
              <div className="text-base text-white/90 mb-4 drop-shadow-md">
                {city || 'City'}{state ? `, ${state}` : ''}
              </div>

              {/* Stats and Buttons Row */}
              <div className="flex items-center justify-between">
                {/* Stats Counter */}
                <div className="flex items-center gap-6">
                  {/* Posts Counter */}
                  <div className="flex flex-col">
                    <span className="text-2xl font-semibold text-white">{posts?.length || 0}</span>
                    <span className="text-xs text-white/70">Posts</span>
                  </div>

                  {/* Followers Counter */}
                  <div className="flex flex-col">
                    <span className="text-2xl font-semibold text-white">{followersCount}</span>
                    <span className="text-xs text-white/70">Followers</span>
                  </div>

                  {/* Following Counter */}
                  <div className="flex flex-col">
                    <span className="text-2xl font-semibold text-white">{following.length}</span>
                    <span className="text-xs text-white/70">Following</span>
                  </div>
                </div>

                {/* Buttons - Right Side */}
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <button
                      onClick={openEditProfile}
                      className="bg-white/15 backdrop-blur-sm hover:bg-blue-400/10 border border-white/40 hover:border-blue-400/60 text-white hover:text-[#60A5FA] py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center hover:shadow-sm text-sm w-28"
                      type="button"
                    >
                      Edit Profile
                    </button>
                  )}
                  {!isOwner && (
                    <>
                      {/* Message Button - styled like QR button */}
                      {currentUser && (
                        <CreateChatButton currentUser={currentUser} otherUserId={id} />
                      )}

                      {/* Follow Button */}
                      <button
                        onClick={handleFollow}
                        className="bg-white/15 backdrop-blur-sm hover:bg-blue-400/10 border border-white/40 hover:border-blue-400/60 text-white hover:text-[#60A5FA] py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center hover:shadow-sm text-sm w-28"
                        type="button"
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Outside content wrapper but inside main wrapper */}
          <div className="-mx-6 md:-mx-24 pb-3 border-b border-gray-300/80 relative z-10">
            <div className="flex items-center justify-center">
          {[
            { key: 'Posts', label: 'Posts', show: true },
            { key: 'Listings', label: 'Listings', show: true },
            { key: 'Images', label: 'Images', show: true },
            { key: 'Services', label: 'Services', show: isProvider },
          ]
            .filter(tab => tab.show)
            .map(({ key, label }, index, arr) => {
              const isSelected = activeTab === key;
              const isLast = index === arr.length - 1;

              return (
                <div key={key} className="relative flex items-center">
                  <button
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`
                      px-6 py-3.5 text-sm transition-colors duration-150 rounded-lg
                      ${isSelected
                        ? 'text-[#60A5FA] hover:text-[#4F94E5]'
                        : 'text-gray-600/90 hover:text-gray-700'
                      }
                    `}
                    type="button"
                  >
                    {label}
                  </button>

                  {!isLast && (
                    <div className="h-6 w-px bg-gray-300 mx-3" />
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div>
        {/* POSTS */}
        {activeTab === 'Posts' && (
          <>
            <div className="mt-8 mb-4">
              <SectionHeader title={`${firstName}'s Posts`} accent="#60A5FA" className="mt-0 mb-0" />
            </div>
            {posts.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    categories={categories}
                  />
                ))}
              </div>
            ) : (
              <EmptyBlock text="No posts yet" />
            )}
          </>
        )}

        {/* LISTINGS */}
        {activeTab === 'Listings' && (
          <>
            <div className="mt-8 mb-4">
              <SectionHeader title={`${firstName}'s Listings`} accent="#60A5FA" className="mt-0 mb-0" />
            </div>
            {(() => {
              // Filter out personal listings (category = 'Personal')
              const visibleListings = listings.filter(l => l.category !== 'Personal');
              return visibleListings.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {visibleListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      data={listing}
                      currentUser={currentUser}
                      categories={categories}
                    />
                  ))}
                </div>
              ) : (
                <EmptyBlock text="No listings yet" />
              );
            })()}
          </>
        )}

        {/* IMAGES */}
        {activeTab === 'Images' && (
          <>
            <div className="mt-8 mb-4">
              <SectionHeader title={`${firstName}'s Gallery`} accent="#60A5FA" className="mt-0 mb-0" />
            </div>
            {galleryImages.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                {galleryImages.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    <Image
                      src={img}
                      alt={`${name || 'User'} - Image ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock text="No images yet" />
            )}
          </>
        )}

        {/* SERVICES */}
        {activeTab === 'Services' && (
          <>
            <div className="mt-8 mb-4 flex items-center justify-between">
              <SectionHeader title={`${firstName}'s Services`} accent="#60A5FA" className="mt-0 mb-0" />
              {canEdit && services.length > 0 && (
                <button
                  onClick={handleEditServices}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Edit Services
                </button>
              )}
            </div>

            {isLoadingServices ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500">Loading services...</p>
              </div>
            ) : services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="rounded-full flex items-center justify-center bg-gray-100 text-gray-400 w-16 h-16 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                  {canEdit
                    ? 'Add services you provide to help clients find you.'
                    : `${firstName} hasn't added any services yet.`}
                </p>
                {canEdit && (
                  <button
                    onClick={handleEditServices}
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Add your first service
                  </button>
                )}
              </div>
            )}
          </>
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
    </div>
  );
};

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="text-center text-gray-500 py-12">
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <p className="font-medium">{text}</p>
      </div>
    </div>
  );
}

export default ProfileHead;

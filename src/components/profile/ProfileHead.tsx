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
import { categories } from '@/components/Categories';
import useRegisterModal from '@/app/hooks/useRegisterModal';

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
    followers = [],
    following = [],
    galleryImages = [],
    email,
  } = user;

  const registerModal = useRegisterModal();

  const [activeTab, setActiveTab] = React.useState<
    'Posts' | 'Listings' | 'Images' | 'Reels'
  >('Posts');

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

  const isOwner = !!currentUser?.id && currentUser.id === id;

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
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header - Matches ListingHead styling */}
      <div className="w-full relative">
        {/* SINGLE CONTAINER: Image and content all in one div */}
        <div className="w-full rounded-xl p-6 border border-gray-300 bg-white relative min-h-[151px]">
          {/* Image positioned on the left */}
          <div className="absolute left-6 top-6">
            <div className="w-[140px] h-[140px] shadow-sm rounded-xl overflow-hidden relative hover:shadow-md transition-shadow group border border-gray-300">
              <Image src={avatar} alt={name ?? 'User'} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          </div>

          {/* Content area with left margin to account for image */}
          <div className="ml-[163px] relative flex items-center min-h-[140px]">
            {/* Three-dot menu - top right */}
            <div className="absolute top-0 right-0">
              <button
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
                aria-label="Options menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#6b7280" fill="none">
                  <path d="M21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12Z" stroke="currentColor" strokeWidth="1.5" fill='#6b7280'></path>
                  <path d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" stroke="currentColor" strokeWidth="1.5" fill='#6b7280'></path>
                  <path d="M6 12C6 11.1716 5.32843 10.5 4.5 10.5C3.67157 10.5 3 11.1716 3 12C3 12.8284 3.67157 13.5 4.5 13.5C5.32843 13.5 6 12.8284 6 12Z" stroke="currentColor" strokeWidth="1.5" fill='#6b7280'></path>
                </svg>
              </button>
            </div>

            <div className="flex-1">
              <div className="space-y-3">
                {/* Name with Badge */}
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-black">
                    {name ?? 'User'}
                  </h1>

                  {/* Verified Badge */}
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="#60A5FA"
                      className="shrink-0 text-white drop-shadow-sm"
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
                <div className="text-sm text-gray-500">
                  {city || 'City'}{state ? `, ${state}` : ''}
                </div>

                {/* Stats and Buttons Row */}
                <div className="flex items-center justify-between">
                  {/* Stats Counter */}
                  <div className="flex items-center gap-8">
                    {/* Posts Counter */}
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-black leading-none">{posts?.length || 0}</span>
                      <span className="text-xs text-gray-400 mt-0.5">posts</span>
                    </div>

                    {/* Followers Counter */}
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-black leading-none">{followersCount}</span>
                      <span className="text-xs text-gray-400 mt-0.5">followers</span>
                    </div>

                    {/* Following Counter */}
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-black leading-none">{following.length}</span>
                      <span className="text-xs text-gray-400 mt-0.5">following</span>
                    </div>
                  </div>

                  {/* Buttons - Right Side */}
                  <div className="flex items-center gap-1.5">
                    {isOwner ? (
                      <button
                        onClick={openEditProfile}
                        className="w-28 px-4 py-3 rounded-lg border border-gray-300 transition-all duration-300 bg-gray-50 text-gray-500 hover:shadow-lg hover:shadow-blue-100/50 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-blue-50 [transition:background_400ms_ease-in-out,border-color_300ms_ease,box-shadow_300ms_ease] flex items-center justify-center text-sm"
                        type="button"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleFollow}
                          className={`group w-28 px-4 py-3 rounded-lg border transition-all duration-300 flex items-center justify-center text-sm [transition:background_400ms_ease-in-out,border-color_300ms_ease,box-shadow_300ms_ease] ${
                            isFollowing
                              ? 'bg-blue-50 border-[#60A5FA] text-[#60A5FA] hover:shadow-lg hover:shadow-blue-100/50 hover:bg-blue-50'
                              : 'bg-gray-50 border-gray-300 text-gray-500 hover:shadow-lg hover:shadow-blue-100/50 hover:border-[#60A5FA] hover:text-[#60A5FA] hover:bg-blue-50'
                          }`}
                          type="button"
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        {currentUser && <CreateChatButton currentUser={currentUser} otherUserId={id} />}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Matches ListingHead Style */}
      <div className="py-5 border-y border-gray-300">
        <div className="flex items-center justify-center">
          {[
            { key: 'Posts', label: 'Posts' },
            { key: 'Listings', label: 'Listings' },
            { key: 'Images', label: 'Images' },
          ].map(({ key, label }, index) => {
            const isSelected = activeTab === key;
            const isLast = index === 2;

            return (
              <div key={key} className="relative flex items-center">
                <button
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={`
                    px-6 py-2.5 text-sm transition-colors duration-200
                    ${isSelected
                      ? 'text-[#60A5FA] hover:text-[#60A5FA]'
                      : 'text-gray-500 hover:text-gray-700'
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

      {/* Tab content */}
      <div className="px-4 sm:px-0 mt-6">
        {/* POSTS */}
        {activeTab === 'Posts' && (
          posts.length ? (
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
          )
        )}

        {/* LISTINGS */}
        {activeTab === 'Listings' && (
          listings.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
              {listings.map((listing) => (
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
          )
        )}

        {/* IMAGES */}
        {activeTab === 'Images' && (
          galleryImages.length ? (
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
          )
        )}


      </div>
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

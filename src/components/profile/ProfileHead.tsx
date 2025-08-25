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

// helper: truncate on word boundary with ellipsis
const truncate = (text: string, max: number) => {
  if (!text) return text;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const atWord = cut.lastIndexOf(' ');
  return (atWord > 0 ? cut.slice(0, atWord) : cut).trimEnd() + '…';
};

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
  const cover = imageSrc || '/assets/hero-background.jpeg';

  const aboutRaw = bio || 'No Bio Provided Yet..';
  const about = React.useMemo(() => truncate(aboutRaw, 230), [aboutRaw]); // 230 chars

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
    <div className="w-full">
      {/* Header card — mirrors ListingHead styling */}
      <div className="w-full relative">
        <div>
          <div>
            <div
              className="rounded-2xl p-6 border border-gray-100/50 backdrop-blur-sm shadow-sm"
              style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)' }}
            >
              <div className="flex items-start gap-6 mb-8">
                {/* Left: square avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-[130px] h-[130px] rounded-xl overflow-hidden relative shadow-sm">
                    <Image src={avatar} alt={name ?? 'User'} fill className="object-cover" />
                  </div>
                </div>

                {/* Right: meta */}
                <div className="flex-1 min-w-0">
                  {/* Name row with badge + 3-dots */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Left group: name + badge */}
                    <div className="flex items-center gap-2">
                      <h1
                        className="text-xl font-bold tracking-tight text-gray-900 leading-tight"
                        style={{ letterSpacing: '-0.025em' }}
                      >
                        {name ?? 'User'}
                      </h1>

                      {/* Badge (same as ListingHead) */}
                      <div className="drop-shadow-sm text-white inline-flex -mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                          width="26" height="26" fill="#60A5FA">
                          <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                            stroke="currentColor" strokeWidth="1.5" />
                          <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor"
                            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Right group: 3-dot menu */}
                    <button
                      className="p-1 rounded-full hover:bg-gray-100 transition text-neutral-400"
                      aria-label="More options"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="stroke-current fill-current"
                      >
                        <path d="M13.5 4.5C13.5 3.67157 12.8284 3 12 3C11.1716 3 10.5 3.67157 10.5 4.5C10.5 5.32843 11.1716 6 12 6C12.8284 6 13.5 5.32843 13.5 4.5Z" strokeWidth="1.5" />
                        <path d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" strokeWidth="1.5" />
                        <path d="M13.5 19.5C13.5 18.6716 12.8284 18 12 18C11.1716 18 10.5 18.6716 10.5 19.5C10.5 20.3284 11.1716 21 12 21C12.8284 21 13.5 20.3284 13.5 19.5Z" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </div>

                  {/* Location badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-[#60A5FA] border border-[#60A5FA]">
                      {city || 'City'}{state ? `, ${state}` : ''}
                    </span>
                  </div>

                  {/* Stats line */}
                  <div className="mb-3 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{followersCount}</span>
                    <span className="text-gray-500"> followers</span>
                    <span className="mx-2">•</span>
                    <span className="font-semibold text-gray-900">{following.length}</span>
                    <span className="text-gray-500"> following</span>
                  </div>

                  <div className="text-gray-700 text-sm leading-relaxed">
                    {about}
                  </div>
                </div>
              </div>

              {/* Actions — centered, like ListingHead */}
              <div className="flex items-center justify-center pt-6 border-t border-gray-100">
                <div className="flex gap-4">
                  {isOwner ? (
                    <button
                      className="group inline-flex items-center justify-center px-24 py-3 rounded-xl text-sm font-medium text-white shadow-sm hover:shadow-md transition-all duration-200 border border-[#60A5FA] hover:bg-blue-600"
                      style={{ backgroundColor: '#60A5FA' }}
                      onClick={openEditProfile}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleFollow}
                        className="group inline-flex items-center justify-center px-24 py-3 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all duration-200"
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      {currentUser && <CreateChatButton currentUser={currentUser} otherUserId={id} />}
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* /card */}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex border-b border-gray-200 relative justify-center">
          <div className="flex gap-8">
            {[
              { key: 'Posts', label: 'Posts' },
              { key: 'Listings', label: 'Listings' },
              { key: 'Images', label: 'Images' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`pb-4 pt-3 px-6 text-sm transition-all duration-200 relative group ${
                  activeTab === key ? 'font-semibold' : 'text-gray-500 hover:text-gray-700'
                }`}
                style={activeTab === key ? { color: '#60A5FA' } : {}}
              >
                <span
                  className={`transition-transform duration-200 ${
                    activeTab === key ? '-translate-y-px' : ''
                  }`}
                >
                  {label}
                </span>
                {activeTab === key && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: '#60A5FA' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 sm:px-0 mt-6">
        {/* POSTS */}
        {activeTab === 'Posts' && (
          posts.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

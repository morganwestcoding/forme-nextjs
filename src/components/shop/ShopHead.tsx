// components/shop/ShopHead.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ProductCard from './ProductCard';
import WorkerCard from '../listings/WorkerCard';
import PostCard from '../feed/PostCard';
import { SafeProduct, SafeUser, SafeShop, SafePost } from '@/app/types';
import useReservationModal from '@/app/hooks/useReservationModal';
import HeartButton from '@/components/HeartButton';

interface ShopHeadProps {
  shop: SafeShop & {
    user: SafeUser;
    products?: SafeProduct[];
    employees?: any[];
    storeHours?: any[];
    listingId?: string | null; // allow null to match data shape
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

  const [activeTab, setActiveTab] = useState<'Products' | 'Team' | 'Reviews' | 'Images' | 'Reels'>('Products');
  const [city, state] = (location ?? 'City, State').split(',').map((s: string) => s?.trim()) || [];

  const reservationModal = useReservationModal();

  const mainImage =
    (galleryImages && galleryImages[0]) ||
    coverImage ||
    logo ||
    '/images/placeholder.jpg';

  const truncatedDescription =
    description && description.length > 230
      ? description.substring(0, 230)
      : description;

  const followersCount = Array.isArray(followers) ? followers.length : 0;

  const handleReserveClick = () => {
    if (listingId) {
      window.location.href = `/listings/${listingId}#reserve`;
      return;
    }
    console.log('Reservations coming soon for shops');
  };

  return (
    <div className="w-full">
      {/* Card wrapper identical to ListingHead */}
      <div className="w-full relative">
        <div>
          <div>
            <div
              className="rounded-2xl p-6 border border-gray-100/50 backdrop-blur-sm shadow-sm"
              style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)' }}
            >
              <div className="flex items-start gap-6 mb-8">
                {/* Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-[130px] h-[130px] rounded-xl overflow-hidden relative shadow-sm">
                    <Image
                      src={mainImage}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  {/* Name row with badge + heart on the left, 3-dots on the right */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Left group: name + badge + heart */}
                    <div className="flex items-center gap-2">
                      <h1
                        className="text-xl font-bold tracking-tight text-gray-900 leading-tight"
                        style={{ letterSpacing: '-0.025em' }}
                      >
                        {name}
                      </h1>

                      {/* Badge (same as ListingHead) */}
                    
                        <div className="drop-shadow-sm text-white inline-flex -mr-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="26"
                            height="26"
                            fill="#60A5FA"
                          >
                            <path
                              d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M9 12.8929L10.8 14.5L15 9.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      

            
                        <HeartButton
                          listingId={listingId}
                          currentUser={currentUser ?? undefined}
                          variant="listingHead"
                          favoriteIds={currentUser?.favoriteIds || []}
                        />
                      
                    </div>

                    {/* Right group: 3-dot button */}
                    <button
                      className="p-1 rounded-full hover:bg-gray-100 transition text-neutral-600"
                      aria-label="More options"
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="stroke-current fill-current"
                      >
                        <path
                          d="M13.5 4.5C13.5 3.67157 12.8284 3 12 3C11.1716 3 10.5 3.67157 10.5 4.5C10.5 5.32843 11.1716 6 12 6C12.8284 6 13.5 5.32843 13.5 4.5Z"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M13.5 19.5C13.5 18.6716 12.8284 18 12 18C11.1716 18 10.5 18.6716 10.5 19.5C10.5 20.3284 11.1716 21 12 21C12.8284 21 13.5 20.3284 13.5 19.5Z"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Location badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-[#60A5FA] border border-[#60A5FA]">
                      {city}{state ? `, ${state}` : ''}
                    </span>
                  </div>

                  {/* Stats line */}
                  <div className="mb-3 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">4.8</span>
                    <span className="text-gray-500">(156 reviews)</span>
                    <span className="mx-2">•</span>
                    <span className="font-semibold text-gray-900">{followersCount}</span>
                    <span className="text-gray-500">followers</span>
                  </div>

                  <div className="text-gray-700 text-sm leading-relaxed">
                    {truncatedDescription}
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex items-center justify-center pt-6 border-t border-gray-100">
                <div className="flex gap-4">
                  <button
                    className="group inline-flex items-center justify-center px-24 py-3 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all duration-200"
                    onClick={() => console.log('Follow clicked')}
                    type="button"
                  >
                    <span>Follow</span>
                  </button>

                  <button
                    onClick={handleReserveClick}
                    className="group inline-flex items-center justify-center px-24 py-3 rounded-xl text-sm font-medium text-white shadow-sm hover:shadow-md transition-all duration-200 border border-[#60A5FA] hover:bg-blue-600"
                    style={{ backgroundColor: '#60A5FA' }}
                    type="button"
                  >
                    <span>Reserve</span>
                  </button>
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
              { key: 'Products', label: 'Products', icon: IconProducts },
              { key: 'Team', label: 'Team', icon: IconTeam },
              { key: 'Reviews', label: 'Reviews', icon: IconReviews },
              { key: 'Images', label: 'Images', icon: IconImages },
              { key: 'Reels', label: 'Reels', icon: IconReels },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'Products' | 'Team' | 'Reviews' | 'Images' | 'Reels')}
                className={`pb-4 pt-3 px-6 flex items-center justify-center text-sm gap-2.5 transition-all duration-200 relative group ${
                  activeTab === key ? 'font-semibold' : 'text-gray-500 hover:text-gray-700'
                }`}
                style={activeTab === key ? { color: '#60A5FA' } : {}}
                type="button"
              >
                <div className={`transition-all duration-200 ${activeTab === key ? 'transform -translate-y-px scale-105' : 'group-hover:scale-105'}`}>
                  <Icon />
                </div>
                <span className={`transition-all duration-200 ${activeTab === key ? 'transform -translate-y-px' : ''}`}>
                  {label}
                </span>
                {activeTab === key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: '#60A5FA' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-0 mt-6">
        {/* PRODUCTS */}
        {activeTab === 'Products' && (
          <>
            {Products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Products.map((p: any, idx: number) => {
                  // If it's already a SafeProduct (has id), use it
                  const isSafe = typeof p?.id === 'string';

                  // Normalize light objects like { name, image, price }
                  const productForCard = isSafe
                    ? p
                    : {
                        // Required
                        id: `placeholder-${idx}`,
                        name: p?.name || 'Product',
                        price: typeof p?.price === 'number' ? p.price : 0,

                        // Images
                        mainImage: p?.mainImage || p?.image || '/images/placeholder.jpg',
                        galleryImages: [],

                        // Inventory & misc
                        inventory: 0,
                        lowStockThreshold: 0,
                        favoritedBy: [],
                        compareAtPrice: null,
                        isFeatured: false,

                        // Category shape your ProductCard expects
                        category: p?.category?.name
                          ? { id: '', name: p.category.name }
                          : { id: '', name: 'General' },
                        categoryId: '',

                        // Dates
                        createdAt: new Date(0).toISOString(),
                        updatedAt: new Date(0).toISOString(),

                        // Optional fields
                        description: p?.description || '',
                        sku: null,
                        barcode: null,
                        weight: null,
                        options: null,
                        variants: null,
                        reviews: null,

                        // Shop ref so ProductCard can render "by {data.shop.name}"
                        shop: { id: shop.id, name: shop.name },
                        shopId: shop.id,
                      };

                  return (
                    <ProductCard
                      key={productForCard.id}
                      data={productForCard}
                      currentUser={currentUser}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <p className="font-medium">No products available</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* TEAM */}
        {activeTab === 'Team' && (shop.employees?.length ?? 0) > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(shop.employees || []).map((employee: any, index: number) => (
              <WorkerCard
                key={employee.id || index}
                employee={employee}
                listingTitle={name}
                data={{ title: name, imageSrc: mainImage, category: (shop as any)?.category }}
                listing={shop as any}
                currentUser={currentUser}
                onFollow={() => console.log('Follow clicked for:', employee.fullName)}
                onBook={() => console.log('Book clicked for:', employee.fullName)}
              />
            ))}
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'Reviews' && (
          <div className="text-center text-gray-500 py-12">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <p className="font-medium">Reviews will be displayed here</p>
            </div>
          </div>
        )}

        {/* IMAGES */}
        {activeTab === 'Images' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages && galleryImages.length > 0 ? (
              galleryImages.map((image: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  <Image
                    src={image}
                    alt={`${name} - Image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <p className="font-medium">No images available</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REELS */}
        {activeTab === 'Reels' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  categories={categories}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <p className="font-medium">No reels available</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- tiny inline icons to keep file self-contained, same as your ListingHead vibe ---
function IconProducts() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" color="currentColor" fill="none">
      <path d="M7.998 16H11.998M7.998 11H15.998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7.5 3.5C5.944 3.547 5.017 3.72 4.375 4.362C3.496 5.242 3.496 6.657 3.496 9.488V15.994C3.496 18.826 3.496 20.241 4.375 21.121C5.253 22 6.668 22 9.496 22H14.496C17.324 22 18.739 22 19.617 21.121C20.496 20.241 20.496 18.826 20.496 15.994V9.488C20.496 6.657 20.496 5.242 19.617 4.362C18.976 3.72 18.048 3.547 16.492 3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7.496 3.75C7.496 2.784 8.28 2 9.246 2H14.746C15.713 2 16.496 2.784 16.496 3.75C16.496 4.717 15.713 5.5 14.746 5.5H9.246C8.28 5.5 7.496 4.717 7.496 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
function IconTeam() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" color="currentColor" fill="none">
      <path d="M15 8C15 9.657 13.657 11 12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 4C17.657 4 19 5.343 19 7C19 8.223 18.268 9.275 17.218 9.742" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.714 14H10.286C7.919 14 6 15.919 6 18.286C6 19.233 6.767 20 7.714 20H16.286C17.233 20 18 19.233 18 18.286C18 15.919 16.081 14 13.714 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.714 13C20.081 13 22 14.919 22 17.286C22 18.233 21.233 19 20.286 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 4C6.343 4 5 5.343 5 7C5 8.223 5.732 9.275 6.782 9.742" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.714 19C2.768 19 2 18.233 2 17.286C2 14.919 3.919 13 6.286 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconReviews() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" color="currentColor" fill="none">
      <path d="M13.728 3.444L15.487 6.993C15.727 7.487 16.367 7.961 16.907 8.051L20.097 8.586C22.137 8.929 22.617 10.421 21.147 11.892L18.667 14.393C18.247 14.816 18.017 15.633 18.147 16.218L18.857 19.312C19.417 21.762 18.127 22.71 15.977 21.43L12.988 19.645C12.448 19.323 11.558 19.323 11.008 19.645L8.018 21.43C5.879 22.71 4.579 21.752 5.139 19.312L5.849 16.218C5.978 15.633 5.749 14.816 5.329 14.393L2.849 11.892C1.389 10.421 1.859 8.929 3.899 8.586L7.088 8.051C7.618 7.961 8.258 7.487 8.498 6.993L10.258 3.444C11.218 1.519 12.778 1.519 13.728 3.444Z"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconImages() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" color="currentColor" fill="none">
      <path d="M3 16L7.47 11.53C7.809 11.191 8.27 11 8.75 11C9.23 11 9.691 11.191 10.03 11.53L14 15.5M15.5 17L14 15.5M21 16L18.53 13.53C18.191 13.191 17.73 13 17.25 13C16.77 13 16.309 13.191 15.97 13.53L14 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.5 8C15.776 8 16 7.776 16 7.5C16 7.224 15.776 7 15.5 7M15.5 8C15.224 8 15 7.776 15 7.5C15 7.224 15.224 7 15.5 7M15.5 8V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.698 19.747C2.5 18.345 2.5 16.23 2.5 12C2.5 7.77 2.5 5.655 3.698 4.253C3.868 4.054 4.054 3.868 4.253 3.698C5.655 2.5 7.77 2.5 12 2.5C16.23 2.5 18.345 2.5 19.747 3.698C19.946 3.868 20.132 4.054 20.302 4.253C21.5 5.655 21.5 7.77 21.5 12C21.5 16.23 21.5 18.345 20.302 19.747C20.132 19.946 19.946 20.132 19.747 20.302C18.345 21.5 16.23 21.5 12 21.5C7.77 21.5 5.655 21.5 4.253 20.302C4.054 20.132 3.868 19.946 3.698 19.747Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconReels() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
         viewBox="0 0 24 24" color="currentColor" fill="none">
      <path d="M18.974 15.022C18.98 14.993 19.021 14.993 19.026 15.022C19.33 16.508 20.492 17.67 21.979 17.974C22.007 17.98 22.007 18.021 21.979 18.026C20.492 18.33 19.33 19.492 19.026 20.979C19.021 21.007 18.98 21.007 18.974 20.979C18.67 19.492 17.508 18.33 16.022 18.026C15.993 18.021 15.993 17.98 16.022 17.974C17.508 17.67 18.67 16.508 18.974 15.022Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14.647 12.673C15.388 12.153 15.759 11.893 15.907 11.516C16.031 11.202 16.031 10.798 15.907 10.484C15.759 10.107 15.388 9.847 14.647 9.327C14.127 8.963 13.589 8.602 13.117 8.316C12.723 8.079 12.259 7.823 11.793 7.578C11.005 7.163 10.611 6.956 10.23 7.008C9.913 7.051 9.583 7.252 9.388 7.52C9.154 7.843 9.124 8.307 9.066 9.235C9.027 9.846 9 10.466 9 11C9 11.534 9.027 12.155 9.066 12.765C9.124 13.693 9.154 14.157 9.388 14.48C9.583 14.748 9.913 14.949 10.23 14.992C10.611 15.044 11.005 14.837 11.793 14.422C12.259 14.177 12.723 13.922 13.117 13.683C13.589 13.398 14.127 13.037 14.647 12.673Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M21.872 14.836C22 13.923 22 12.728 22 11C22 8.2 22 6.8 21.455 5.73C20.976 4.789 20.211 4.024 19.27 3.545C18.2 3 16.8 3 14 3H10C7.2 3 5.8 3 4.73 3.545C3.789 4.024 3.024 4.789 2.545 5.73C2 6.8 2 8.2 2 11C2 13.8 2 15.2 2.545 16.27C3.024 17.211 3.789 17.976 4.73 18.455C5.8 19 7.2 19 10 19H13.426" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default ShopHead;

'use client';

import React, { useState } from 'react';
import ProductCard from './ProductCard';
import PostCard from '../feed/PostCard';
import { SafePost, SafeUser, SafeShop, SafeProduct } from '@/app/types';

interface ShopHeadProps {
  shop: SafeShop & { user: SafeUser };
  currentUser?: SafeUser | null;
  products: SafeProduct[];
  posts?: SafePost[];
  categories?: any[];
  isFollowing: boolean;
  onFollowToggle: () => void;
  onContactShop: () => void;
  onProductSelect: (product: SafeProduct) => void;
  cartItemCount: number;
}

const ShopHead: React.FC<ShopHeadProps> = ({ 
  shop, 
  currentUser, 
  products,
  posts = [],
  categories = [],
  isFollowing,
  onFollowToggle,
  onContactShop,
  onProductSelect,
  cartItemCount
}) => {
  const { name, description, logo, coverImage, location, galleryImages = [], user, followers = [] } = shop;
  const [activeTab, setActiveTab] = useState<'Products' | 'About' | 'Reviews' | 'Gallery' | 'Posts'>('Products');
  const [city, state] = location?.split(',').map(s => s.trim()) || [];

  // Get the main image to display
  const mainImage = coverImage || logo;

  // Truncate description
  const truncatedDescription = description && description.length > 230
    ? description.substring(0, 230) + '...'
    : description;

  // Get stats
  const followerCount = followers.length || 0;
  const productCount = products.length || 0;

  return (
    <div className="w-full">
      {/* Header with Final Design */}
      <div className="w-full relative">
        <div>
          <div>
            {/* Enhanced Background */}
            <div 
              className="rounded-2xl p-6 border border-gray-100/50 backdrop-blur-sm shadow-sm"
              style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)'
              }}
            >
              {/* Content Layout */}
              <div className="flex items-start gap-6 mb-8">
                
                {/* Left: Square Image sized to content height */}
                <div className="relative flex-shrink-0">
                  <div className="w-[130px] h-[130px] rounded-xl overflow-hidden relative shadow-sm">
                    <img
                      src={mainImage}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right: Title, Location, Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-tight" style={{ letterSpacing: '-0.025em' }}>
                      {name}
                    </h1>
                    {shop.isVerified && (
                      <div className='text-white drop-shadow-sm'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="#60A5FA">
                          <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Location badge with soft styling */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-[#60A5FA] border border-[#60A5FA]">
                      {city && state ? `${city}, ${state}` : location || 'Online Shop'}
                    </span>
                  </div>
                  
                  {/* Stats line */}
                  <div className="mb-3 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">4.8</span>
                    <span className="text-gray-500">(89 reviews)</span>
                    <span className="mx-2">•</span>
                    <span className="font-semibold text-gray-900">{followerCount}</span>
                    <span className="text-gray-500">followers</span>
                    <span className="mx-2">•</span>
                    <span className="font-semibold text-gray-900">{productCount}</span>
                    <span className="text-gray-500">products</span>
                  </div>
                  
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {truncatedDescription || "Discover amazing products from this shop."}
                  </div>
                </div>
              </div>

              {/* Bottom section - Centered action buttons */}
              <div className="flex items-center justify-center pt-6 border-t border-gray-100">
                {/* Action buttons - centered and balanced */}
                <div className="flex gap-4">
                  <button 
                    onClick={onFollowToggle}
                    className={`group inline-flex items-center justify-center px-24 py-3 rounded-xl text-sm font-medium border shadow-sm transition-all duration-200 ${
                      isFollowing 
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>

                  <button 
                    onClick={onContactShop}
                    className="group inline-flex items-center justify-center px-24 py-3 rounded-xl text-sm font-medium text-white shadow-sm hover:shadow-md transition-all duration-200 border border-[#60A5FA] hover:bg-blue-600" 
                    style={{ backgroundColor: '#60A5FA' }}
                  >
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="mt-6">
        <div className="flex border-b border-gray-200 relative justify-center">
          <div className="flex gap-8">
            {[
              { 
                key: 'Products', 
                label: 'Products', 
                icon: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
                    <path d="M3.06164 15.1933L3.42688 13.1219C3.85856 10.6736 4.0744 9.44952 4.92914 8.72476C5.78389 8 7.01171 8 9.46734 8H14.5327C16.9883 8 18.2161 8 19.0709 8.72476C19.9256 9.44952 20.1414 10.6736 20.5731 13.1219L20.9384 15.1933C21.5357 18.5811 21.8344 20.275 20.9147 21.3875C19.995 22.5 18.2959 22.5 14.8979 22.5H9.1021C5.70406 22.5 4.00504 22.5 3.08533 21.3875C2.16562 20.275 2.4643 18.5811 3.06164 15.1933Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7.5 8L7.66782 5.98618C7.85558 3.73306 9.73907 2 12 2C14.2609 2 16.1444 3.73306 16.3322 5.98618L16.5 8" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M15 11C14.87 12.4131 13.5657 13.5 12 13.5C10.4343 13.5 9.13002 12.4131 9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )
              },
              { 
                key: 'About', 
                label: 'About', 
                icon: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
                    <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.992 8H12.001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              },
              { 
                key: 'Reviews', 
                label: 'Reviews', 
                icon: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
                    <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              },
              { 
                key: 'Gallery', 
                label: 'Gallery', 
                icon: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
                    <path d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M15.5 17L14 15.5M21 16L18.5303 13.5303C18.1908 13.1908 17.7302 13 17.25 13C16.7698 13 16.3092 13.1908 15.9697 13.5303L14 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15.5 8C15.7761 8 16 7.77614 16 7.5C16 7.22386 15.7761 7 15.5 7M15.5 8C15.2239 8 15 7.77614 15 7.5C15 7.22386 15.2239 7 15.5 7M15.5 8V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.69797 19.7472C2.5 18.3446 2.5 16.2297 2.5 12C2.5 7.77027 2.5 5.6554 3.69797 4.25276C3.86808 4.05358 4.05358 3.86808 4.25276 3.69797C5.6554 2.5 7.77027 2.5 12 2.5C16.2297 2.5 18.3446 2.5 19.7472 3.69797C19.9464 3.86808 20.1319 4.05358 20.302 4.25276C21.5 5.6554 21.5 7.77027 21.5 12C21.5 16.2297 21.5 18.3446 20.302 19.7472C20.1319 19.9464 19.9464 20.1319 19.7472 20.302C18.3446 21.5 16.2297 21.5 12 21.5C7.77027 21.5 5.6554 21.5 4.25276 20.302C4.05358 20.1319 3.86808 19.9464 3.69797 19.7472Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              },
              { 
                key: 'Posts', 
                label: 'Posts', 
                icon: () => (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
                    <path d="M18.9737 15.0215C18.9795 14.9928 19.0205 14.9928 19.0263 15.0215C19.3302 16.5081 20.4919 17.6698 21.9785 17.9737C22.0072 17.9795 22.0072 18.0205 21.9785 18.0263C20.4919 18.3302 19.3302 19.4919 19.0263 20.9785C19.0205 21.0072 18.9795 21.0072 18.9737 20.9785C18.6698 19.4919 17.5081 18.3302 16.0215 18.0263C15.9928 18.0205 15.9928 17.9795 16.0215 17.9737C17.5081 17.6698 18.6698 16.5081 18.9737 15.0215Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M14.6469 12.6727C15.3884 12.1531 15.7591 11.8934 15.9075 11.5158C16.0308 11.2021 16.0308 10.7979 15.9075 10.4842C15.7591 10.1066 15.3884 9.84685 14.6469 9.3273C14.1274 8.9633 13.5894 8.60214 13.1167 8.3165C12.7229 8.07852 12.2589 7.82314 11.7929 7.57784C11.005 7.16312 10.6111 6.95576 10.2297 7.00792C9.91348 7.05115 9.58281 7.25237 9.38829 7.5199C9.1536 7.84266 9.12432 8.30677 9.06577 9.23497C9.02725 9.84551 9 10.4661 9 11C9 11.5339 9.02725 12.1545 9.06577 12.765C9.12432 13.6932 9.1536 14.1573 9.38829 14.4801C9.58281 14.7476 9.91348 14.9489 10.2297 14.9921C10.6111 15.0442 11.005 14.8369 11.7929 14.4221C12.2589 14.1768 12.7229 13.9215 13.1167 13.6835C13.5894 13.3978 14.1274 13.0367 14.6469 12.6727Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M21.872 14.8357C22 13.9227 22 12.7279 22 11C22 8.19974 22 6.79961 21.455 5.73005C20.9757 4.78924 20.2108 4.02433 19.27 3.54497C18.2004 3 16.8003 3 14 3H10C7.19974 3 5.79961 3 4.73005 3.54497C3.78924 4.02433 3.02433 4.78924 2.54497 5.73005C2 6.79961 2 8.19974 2 11C2 13.8003 2 15.2004 2.54497 16.27C3.02433 17.2108 3.78924 17.9757 4.73005 18.455C5.79961 19 7.19974 19 10 19H13.4257" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'Products' | 'About' | 'Reviews' | 'Gallery' | 'Posts')}
                className={`pb-4 pt-3 px-6 flex items-center justify-center text-sm gap-2.5 transition-all duration-200 relative group ${
                  activeTab === key 
                    ? 'font-semibold' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={activeTab === key ? { color: '#60A5FA' } : {}}
              >
                <div className={`transition-all duration-200 ${
                  activeTab === key ? 'transform -translate-y-px scale-105' : 'group-hover:scale-105'
                }`}>
                  <Icon />
                </div>
                <span className={`transition-all duration-200 ${
                  activeTab === key ? 'transform -translate-y-px' : ''
                }`}>{label}</span>
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

      {/* Enhanced Tab Content */}
      <div className="px-4 sm:px-0 mt-6">
        {activeTab === 'Products' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products && products.length > 0 ? (
              products.map(product => (
                <ProductCard
                  key={product.id}
                  data={product}
                  currentUser={currentUser}
                  onAction={(productId) => {
                    const selectedProduct = products.find(p => p.id === productId);
                    if (selectedProduct) {
                      onProductSelect(selectedProduct);
                    }
                  }}
                  actionId={product.id}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" className="text-gray-300 mx-auto mb-4" fill="none">
                    <path d="M3.06164 15.1933L3.42688 13.1219C3.85856 10.6736 4.0744 9.44952 4.92914 8.72476C5.78389 8 7.01171 8 9.46734 8H14.5327C16.9883 8 18.2161 8 19.0709 8.72476C19.9256 9.44952 20.1414 10.6736 20.5731 13.1219L20.9384 15.1933C21.5357 18.5811 21.8344 20.275 20.9147 21.3875C19.995 22.5 18.2959 22.5 14.8979 22.5H9.1021C5.70406 22.5 4.00504 22.5 3.08533 21.3875C2.16562 20.275 2.4643 18.5811 3.06164 15.1933Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7.5 8L7.66782 5.98618C7.85558 3.73306 9.73907 2 12 2C14.2609 2 16.1444 3.73306 16.3322 5.98618L16.5 8" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M15 11C14.87 12.4131 13.5657 13.5 12 13.5C10.4343 13.5 9.13002 12.4131 9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p className="font-medium">No products available</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'About' && (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About {name}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {description || "This shop hasn't provided a description yet."}
                </p>
              </div>
              
              {shop.storeUrl && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Website</h4>
                  <a 
                    href={shop.storeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#60A5FA] hover:underline"
                  >
                    {shop.storeUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Reviews' && (
          <div className="text-center text-gray-500 py-12">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" className="text-gray-300 mx-auto mb-4" fill="none">
                <path d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="font-medium">Reviews will be displayed here</p>
            </div>
          </div>
        )}

        {activeTab === 'Gallery' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages && galleryImages.length > 0 ? (
              galleryImages.map((image, index) => (
                <div key={index} className="aspect-square relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                  <img
                    src={image}
                    alt={`${name} - Image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" className="text-gray-300 mx-auto mb-4" fill="none">
                    <path d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M15.5 17L14 15.5M21 16L18.5303 13.5303C18.1908 13.1908 17.7302 13 17.25 13C16.7698 13 16.3092 13.1908 15.9697 13.5303L14 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15.5 8C15.7761 8 16 7.77614 16 7.5C16 7.22386 15.7761 7 15.5 7M15.5 8C15.2239 8 15 7.77614 15 7.5C15 7.22386 15.2239 7 15.5 7M15.5 8V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.69797 19.7472C2.5 18.3446 2.5 16.2297 2.5 12C2.5 7.77027 2.5 5.6554 3.69797 4.25276C3.86808 4.05358 4.05358 3.86808 4.25276 3.69797C5.6554 2.5 7.77027 2.5 12 2.5C16.2297 2.5 18.3446 2.5 19.7472 3.69797C19.9464 3.86808 20.1319 4.05358 20.302 4.25276C21.5 5.6554 21.5 7.77027 21.5 12C21.5 16.2297 21.5 18.3446 20.302 19.7472C20.1319 19.9464 19.9464 20.1319 19.7472 20.302C18.3446 21.5 16.2297 21.5 12 21.5C7.77027 21.5 5.6554 21.5 4.25276 20.302C4.05358 20.1319 3.86808 19.9464 3.69797 19.7472Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="font-medium">No gallery images available</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Posts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts && posts.length > 0 ? (
              posts.map(post => (
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" className="text-gray-300 mx-auto mb-4" fill="none">
                    <path d="M18.9737 15.0215C18.9795 14.9928 19.0205 14.9928 19.0263 15.0215C19.3302 16.5081 20.4919 17.6698 21.9785 17.9737C22.0072 17.9795 22.0072 18.0205 21.9785 18.0263C20.4919 18.3302 19.3302 19.4919 19.0263 20.9785C19.0205 21.0072 18.9795 21.0072 18.9737 20.9785C18.6698 19.4919 17.5081 18.3302 16.0215 18.0263C15.9928 18.0205 15.9928 17.9795 16.0215 17.9737C17.5081 17.6698 18.6698 16.5081 18.9737 15.0215Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M14.6469 12.6727C15.3884 12.1531 15.7591 11.8934 15.9075 11.5158C16.0308 11.2021 16.0308 10.7979 15.9075 10.4842C15.7591 10.1066 15.3884 9.84685 14.6469 9.3273C14.1274 8.9633 13.5894 8.60214 13.1167 8.3165C12.7229 8.07852 12.2589 7.82314 11.7929 7.57784C11.005 7.16312 10.6111 6.95576 10.2297 7.00792C9.91348 7.05115 9.58281 7.25237 9.38829 7.5199C9.1536 7.84266 9.12432 8.30677 9.06577 9.23497C9.02725 9.84551 9 10.4661 9 11C9 11.5339 9.02725 12.1545 9.06577 12.765C9.12432 13.6932 9.1536 14.1573 9.38829 14.4801C9.58281 14.7476 9.91348 14.9489 10.2297 14.9921C10.6111 15.0442 11.005 14.8369 11.7929 14.4221C12.2589 14.1768 12.7229 13.9215 13.1167 13.6835C13.5894 13.3978 14.1274 13.0367 14.6469 12.6727Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M21.872 14.8357C22 13.9227 22 12.7279 22 11C22 8.19974 22 6.79961 21.455 5.73005C20.9757 4.78924 20.2108 4.02433 19.27 3.54497C18.2004 3 16.8003 3 14 3H10C7.19974 3 5.79961 3 4.73005 3.54497C3.78924 4.02433 3.02433 4.78924 2.54497 5.73005C2 6.79961 2 8.19974 2 11C2 13.8003 2 15.2004 2.54497 16.27C3.02433 17.2108 3.78924 17.9757 4.73005 18.455C5.79961 19 7.19974 19 10 19H13.4257" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="font-medium">No posts available</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopHead;
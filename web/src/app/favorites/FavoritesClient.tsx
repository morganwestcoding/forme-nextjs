'use client';

import React, { useState, useMemo } from 'react';
import Container from '@/components/Container';
import ListingCard from '@/components/listings/ListingCard';
import WorkerCard from '@/components/listings/WorkerCard';
import ShopCard from '@/components/shop/ShopCard';
import PostCard from '@/components/feed/PostCard';
import { categories } from '@/components/Categories';
import { SafeListing, SafeUser, SafeEmployee, SafeShop, SafePost } from '@/app/types';
import PageHeader from '@/components/PageHeader';
import { useSidebarState } from '@/app/hooks/useSidebarState';

type FavoriteTab = 'all' | 'businesses' | 'professionals' | 'shops' | 'posts';

interface FavoritesClientProps {
  listings: SafeListing[];
  workers: SafeEmployee[];
  shops: SafeShop[];
  posts: SafePost[];
  currentUser?: SafeUser | null;
}

const FavoritesClient: React.FC<FavoritesClientProps> = ({
  listings,
  workers,
  shops,
  posts,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<FavoriteTab>('all');
  const isSidebarCollapsed = useSidebarState();

  const safeListings = listings || [];
  const safeWorkers = workers || [];
  const safeShops = shops || [];
  const safePosts = posts || [];

  const totalCount = safeListings.length + safeWorkers.length + safeShops.length + safePosts.length;

  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3';

  const tabs: { key: FavoriteTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'businesses', label: 'Businesses', count: safeListings.length },
    { key: 'professionals', label: 'Professionals', count: safeWorkers.length },
    { key: 'shops', label: 'Shops', count: safeShops.length },
    { key: 'posts', label: 'Posts', count: safePosts.length },
  ];

  const getAssociatedListing = (worker: SafeEmployee) => {
    return safeListings.find(listing =>
      listing.employees?.some(emp => emp.id === worker.id)
    ) || safeListings[0];
  };

  // Build content items based on active tab
  const contentItems = useMemo(() => {
    const items: Array<{ type: 'listing' | 'worker' | 'shop' | 'post'; data: any; listing?: any }> = [];

    if (activeTab === 'all' || activeTab === 'businesses') {
      safeListings.forEach(l => items.push({ type: 'listing', data: l }));
    }
    if (activeTab === 'all' || activeTab === 'professionals') {
      safeWorkers.forEach(w => items.push({ type: 'worker', data: w, listing: getAssociatedListing(w) }));
    }
    if (activeTab === 'all' || activeTab === 'shops') {
      safeShops.forEach(s => items.push({ type: 'shop', data: s }));
    }
    if (activeTab === 'all' || activeTab === 'posts') {
      safePosts.forEach(p => items.push({ type: 'post', data: p }));
    }

    return items;
  }, [activeTab, safeListings, safeWorkers, safeShops, safePosts]);

  return (
    <Container>
      <PageHeader currentUser={currentUser} currentPage="Favorites" />

      <div className="mt-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Favorites</h1>
          <p className="text-[14px] text-stone-400 mt-1">{totalCount} saved {totalCount === 1 ? 'item' : 'items'}</p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-gradient-to-br from-stone-800 to-black text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]'
              }`}
            >
              {tab.label}
              <span className={`text-[11px] tabular-nums ${
                activeTab === tab.key ? 'text-white/60' : 'text-stone-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {contentItems.length > 0 ? (
          <>
            {/* Non-post items */}
            {contentItems.some(i => i.type !== 'post') && (
              <div className={`grid ${gridColsClass} gap-x-6 gap-y-2`}>
                {contentItems.filter(i => i.type !== 'post').map((item, idx) => (
                  <div
                    key={`${item.type}-${item.data.id}`}
                    style={{
                      opacity: 0,
                      animation: 'fadeInUp 520ms ease-out both',
                      animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                    }}
                  >
                    {item.type === 'listing' && (
                      <ListingCard
                        categories={categories}
                        data={item.data}
                        currentUser={currentUser}
                      />
                    )}
                    {item.type === 'worker' && item.listing && (
                      <WorkerCard
                        employee={item.data}
                        listingTitle={item.listing?.title || ''}
                        data={{
                          title: item.listing?.title || '',
                          imageSrc: item.listing?.imageSrc || '',
                          category: (item.listing as any)?.category || '',
                        }}
                        listing={item.listing}
                        currentUser={currentUser}
                      />
                    )}
                    {item.type === 'shop' && (
                      <ShopCard data={item.data} currentUser={currentUser} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Posts — denser grid */}
            {contentItems.some(i => i.type === 'post') && (
              <>
                {activeTab === 'all' && contentItems.some(i => i.type !== 'post') && (
                  <div className="mt-10 mb-6 flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Posts</h2>
                    <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full tabular-nums">
                      {contentItems.filter(i => i.type === 'post').length}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5 rounded-xl overflow-hidden">
                  {contentItems.filter(i => i.type === 'post').map((item, idx) => (
                    <div
                      key={`post-${item.data.id}`}
                      style={{
                        opacity: 0,
                        animation: 'fadeInUp 520ms ease-out both',
                        animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                      }}
                    >
                      <PostCard post={item.data} currentUser={currentUser} categories={categories} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-stone-700 mb-1">
              {activeTab === 'all' ? 'No favorites yet' : `No favorite ${activeTab}`}
            </p>
            <p className="text-[13px] text-stone-400 max-w-xs">
              Save listings, professionals, shops, and posts to find them here.
            </p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default FavoritesClient;

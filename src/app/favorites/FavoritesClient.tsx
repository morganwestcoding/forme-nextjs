'use client';

import React, { useState } from 'react';
import Container from '@/components/Container';
import ListingCard from '@/components/listings/ListingCard';
import WorkerCard from '@/components/listings/WorkerCard';
import ShopCard from '@/components/shop/ShopCard';
import PostCard from '@/components/feed/PostCard';
import { categories } from '@/components/Categories';
import { SafeListing, SafeUser, SafeEmployee, SafeShop, SafePost } from '@/app/types';
import FavoritesExplorer from '@/components/favorites/FavoritesExplorer';
import EmptyState from '@/components/EmptyState';
import SectionHeader from '../market/SectionHeader';
type FavoriteTab = 'Market' | 'Workers' | 'Shops' | 'Posts';

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
  const [viewState, setViewState] = React.useState<{ mode: 'grid' | 'list' }>({
    mode: 'grid',
  });
  const [activeTab, setActiveTab] = React.useState<FavoriteTab | null>(null);

  // Safely handle potentially undefined arrays
  const safeListings = listings || [];
  const safeWorkers = workers || [];
  const safeShops = shops || [];
  const safePosts = posts || [];

  const emptyCopy: Record<string, { title: string; subtitle: string }> = {
    All:     { title: 'No favorites yet',         subtitle: 'Start hearting content to build your collection.' },
    Market:  { title: 'No favorite listings yet', subtitle: 'Tap the heart on a listing to favorite it.' },
    Workers: { title: 'No favorite workers yet',  subtitle: 'Heart workers to add them to favorites.' },
    Shops:   { title: 'No favorite shops yet',    subtitle: 'Heart shops to see them here.' },
    Posts:   { title: 'No favorite posts yet',    subtitle: 'Save posts you love here.' },
  };

  const gridClasses = viewState.mode === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    : 'space-y-3';

  const renderContent = () => {
    switch (activeTab) {
      case 'Market':
        return safeListings.length === 0 ? (
          <EmptyState title={emptyCopy.Market.title} subtitle={emptyCopy.Market.subtitle} />
        ) : (
          <div className={gridClasses}>
            {safeListings.map((listing) => (
              <ListingCard
                key={listing.id}
                categories={categories}
                currentUser={currentUser}
                data={listing}
              />
            ))}
          </div>
        );

      case 'Workers':
        return safeWorkers.length === 0 ? (
          <EmptyState title={emptyCopy.Workers.title} subtitle={emptyCopy.Workers.subtitle} />
        ) : (
          <div className={gridClasses}>
            {safeWorkers.map((worker) => {
              const associatedListing = safeListings.find(listing => 
                listing.employees?.some(emp => emp.id === worker.id)
              ) || safeListings[0];

              return (
                <WorkerCard
                  key={worker.id}
                  employee={worker}
                  listingTitle={associatedListing?.title || 'Professional'}
                  data={{
                    title: associatedListing?.title || '',
                    imageSrc: associatedListing?.imageSrc || '',
                    category: associatedListing?.category || ''
                  }}
                  listing={associatedListing}
                  currentUser={currentUser}
                />
              );
            })}
          </div>
        );

      case 'Shops':
        return safeShops.length === 0 ? (
          <EmptyState title={emptyCopy.Shops.title} subtitle={emptyCopy.Shops.subtitle} />
        ) : (
          <div className={gridClasses}>
            {safeShops.map((shop) => (
              <ShopCard
                key={shop.id}
                data={shop}
                currentUser={currentUser}
              />
            ))}
          </div>
        );

      case 'Posts':
        return safePosts.length === 0 ? (
          <EmptyState title={emptyCopy.Posts.title} subtitle={emptyCopy.Posts.subtitle} />
        ) : (
          <div className={gridClasses}>
            {safePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                categories={categories}
              />
            ))}
          </div>
        );

      default:
        // Show all items when no tab is selected
        const totalItems = safeListings.length + safeWorkers.length + safeShops.length + safePosts.length;
        return totalItems === 0 ? (
          <EmptyState title={emptyCopy.All.title} subtitle={emptyCopy.All.subtitle} />
        ) : (
          <div className={gridClasses}>
            {safeListings.map((listing) => (
              <ListingCard key={`listing-${listing.id}`} categories={categories} currentUser={currentUser} data={listing} />
            ))}
            {safeWorkers.map((worker) => {
              const associatedListing = safeListings.find(listing => 
                listing.employees?.some(emp => emp.id === worker.id)
              ) || safeListings[0];
              return (
                <WorkerCard
                  key={`worker-${worker.id}`}
                  employee={worker}
                  listingTitle={associatedListing?.title || 'Professional'}
                  data={{
                    title: associatedListing?.title || '',
                    imageSrc: associatedListing?.imageSrc || '',
                    category: associatedListing?.category || ''
                  }}
                  listing={associatedListing}
                  currentUser={currentUser}
                />
              );
            })}
            {safeShops.map((shop) => (
              <ShopCard key={`shop-${shop.id}`} data={shop} currentUser={currentUser} />
            ))}
            {safePosts.map((post) => (
              <PostCard key={`post-${post.id}`} post={post} currentUser={currentUser} categories={categories} />
            ))}
          </div>
        );
    }
  };

  return (
    <Container>
      <div className="pt-2 mb-4">
        <h1 className="text-3xl md:text-3xl font-bold text-black leading-tight tracking-wide">Favorites</h1>
        <p className="text-gray-600">A one stop shop for all of your favorite things</p>
      </div>

      <FavoritesExplorer
        viewState={viewState}
        setViewState={setViewState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div>
        <SectionHeader title="Your Favorite Picks" />
        <div className="flex flex-col">
          {renderContent()}
        </div>
      </div>
    </Container>
  );
};

export default FavoritesClient;
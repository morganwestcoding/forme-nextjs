'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Container from '@/components/Container';
import ListingCard from '@/components/listings/ListingCard';
import WorkerCard from '@/components/listings/WorkerCard';
import ShopCard from '@/components/shop/ShopCard';
import PostCard from '@/components/feed/PostCard';
import { categories } from '@/components/Categories';
import { SafeListing, SafeUser, SafeEmployee, SafeShop, SafePost } from '@/app/types';
import FavoritesSearch from '@/components/favorites/FavoritesSearch';
import CategoryNav from '@/components/favorites/CategoryNav';
import EmptyState from '@/components/EmptyState';
import SectionHeader from '../market/SectionHeader';
import PropagateLoaderWrapper from '@/components/loaders/PropagateLoaderWrapper';

type FavoriteTab = 'Market' | 'Professionals' | 'Shops' | 'Posts';

interface FavoritesClientProps {
  listings: SafeListing[];
  workers: SafeEmployee[];
  shops: SafeShop[];
  posts: SafePost[];
  currentUser?: SafeUser | null;
}

/** Animation timing */
const MIN_LOADER_MS = 1200;
const FADE_DURATION_MS = 520;
const FADE_STAGGER_BASE_MS = 140;
const FADE_STAGGER_STEP_MS = 30;
const CONTAINER_FADE_MS = 700;

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
  const [isLoading, setIsLoading] = useState(true);
  const [animatedItems, setAnimatedItems] = useState<JSX.Element[]>([]);

  // Safely handle potentially undefined arrays
  const safeListings = listings || [];
  const safeWorkers = workers || [];
  const safeShops = shops || [];
  const safePosts = posts || [];

  // Initialize loader
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), MIN_LOADER_MS);
    return () => clearTimeout(t);
  }, []);

  const emptyCopy: Record<string, { title: string;  }> = {
    All:     { title: 'No favorites yet, start hearting items to start your collection'},
    Market:  { title: 'No favorite listings yet',  },
    Professionals: { title: 'No favorite professionals yet' },
    Shops:   { title: 'No favorite shops yet' },
    Posts:   { title: 'No favorite posts yet'},
  };

  const gridClasses = viewState.mode === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start'
    : 'space-y-3';

  // Build content items based on active tab
  const buildContentItems = (): JSX.Element[] => {
    const items: JSX.Element[] = [];

    switch (activeTab) {
      case 'Market':
        safeListings.forEach((listing) => {
          items.push(
            <ListingCard
              key={listing.id}
              categories={categories}
              currentUser={currentUser}
              data={listing}
            />
          );
        });
        break;

      case 'Professionals':
        safeWorkers.forEach((worker) => {
          const associatedListing = safeListings.find(listing => 
            listing.employees?.some(emp => emp.id === worker.id)
          ) || safeListings[0];

          items.push(
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
        });
        break;

      case 'Shops':
        safeShops.forEach((shop) => {
          items.push(
            <ShopCard
              key={shop.id}
              data={shop}
              currentUser={currentUser}
            />
          );
        });
        break;

      case 'Posts':
        safePosts.forEach((post) => {
          items.push(
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              categories={categories}
            />
          );
        });
        break;

      default:
        // Show all items when no tab is selected
        safeListings.forEach((listing) => {
          items.push(
            <ListingCard 
              key={`listing-${listing.id}`} 
              categories={categories} 
              currentUser={currentUser} 
              data={listing} 
            />
          );
        });

        safeWorkers.forEach((worker) => {
          const associatedListing = safeListings.find(listing => 
            listing.employees?.some(emp => emp.id === worker.id)
          ) || safeListings[0];
          
          items.push(
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
        });

        safeShops.forEach((shop) => {
          items.push(
            <ShopCard 
              key={`shop-${shop.id}`} 
              data={shop} 
              currentUser={currentUser} 
            />
          );
        });

        safePosts.forEach((post) => {
          items.push(
            <PostCard 
              key={`post-${post.id}`} 
              post={post} 
              currentUser={currentUser} 
              categories={categories} 
            />
          );
        });
        break;
    }

    return items;
  };

  // Check if we have any content for the current tab
  const hasContent = useMemo(() => {
    switch (activeTab) {
      case 'Market':
        return safeListings.length > 0;
      case 'Professionals':
        return safeWorkers.length > 0;
      case 'Shops':
        return safeShops.length > 0;
      case 'Posts':
        return safePosts.length > 0;
      default:
        return safeListings.length + safeWorkers.length + safeShops.length + safePosts.length > 0;
    }
  }, [activeTab, safeListings.length, safeWorkers.length, safeShops.length, safePosts.length]);

  // Get empty state message for current tab
  const getEmptyStateMessage = () => {
    const key = activeTab || 'All';
    return emptyCopy[key] || emptyCopy.All;
  };

  // Build animated items with staggered fade-in
  const buildAnimatedItems = () => {
    const contentItems = buildContentItems();
    return contentItems.map((item, idx) => {
      const delay = FADE_STAGGER_BASE_MS + (idx % 12) * FADE_STAGGER_STEP_MS;
      return (
        <div
          key={`animated-${idx}`}
          style={{
            opacity: 0,
            animation: `fadeInUp ${FADE_DURATION_MS}ms ease-out forwards`,
            animationDelay: `${delay}ms`,
            willChange: 'transform, opacity',
          }}
        >
          {item}
        </div>
      );
    });
  };

  // Update animated items when content changes and loading is done
  useEffect(() => {
    if (!isLoading) {
      setAnimatedItems(buildAnimatedItems());
    }
  }, [isLoading, activeTab, safeListings, safeWorkers, safeShops, safePosts]);

  const renderContent = () => {
    if (!hasContent) {
      const emptyState = getEmptyStateMessage();
      return (
        <div className="px-8 pt-32 text-center text-gray-500">
          <div>{emptyState.title}</div>
      
        </div>
      );
    }

    return (
      <div className={gridClasses}>
        {animatedItems}
      </div>
    );
  };

  return (
    <Container>
      {/* Hero Section - Frosted Glass Effect */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
      <div
        className="relative px-6 md:px-24 pt-10 overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #FFFFFF 0%, #F8F8F8 100%)'
        }}
      >

        {/* Content */}
        <div className="relative z-10 pb-6">
          {/* Main Favorites Title */}
          <div className="">
            <h1 className="text-4xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Favorites
            </h1>
            <p className="text-gray-600 text-lg mt-1">A one stop shop for all of your favorite things</p>
          </div>

          {/* Search and Controls */}
          <div className="mt-5">
            <FavoritesSearch
              viewState={viewState}
              setViewState={setViewState}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
                {/* Category Navigation */}

        </div>
          <CategoryNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>



      <div className="relative">
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center">
            <div className="mt-40 md:mt-40">
              <PropagateLoaderWrapper size={12} speedMultiplier={1.15} />
            </div>
          </div>
        )}

        <div
          className={`transition-opacity ease-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ transitionDuration: `${CONTAINER_FADE_MS}ms` }}
        >
          {/* Only show section header when we have content */}
          {hasContent && (
            <SectionHeader title="Your Favorite Picks" />
          )}
          
          <div className="flex flex-col">
            {renderContent()}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default FavoritesClient;
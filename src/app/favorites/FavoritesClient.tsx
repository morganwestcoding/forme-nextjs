'use client';

import React from 'react';
import Container from '@/components/Container';
import ListingCard from '@/components/listings/ListingCard';
import { categories } from '@/components/Categories';
import { SafeListing, SafeUser } from '@/app/types';
import FavoritesExplorer from '@/components/favorites/FavoritesExplorer';
import EmptyState from '@/components/EmptyState';

interface FavoritesClientProps {
  listings: SafeListing[];
  currentUser?: SafeUser | null;
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

type FavoriteTab = 'Reels' | 'Stores' | 'Listings' | 'Shops' | 'Products';

const FavoritesClient: React.FC<FavoritesClientProps> = ({
  listings,
  currentUser,
}) => {
  const [viewState, setViewState] = React.useState<{ mode: 'grid' | 'list' }>({
    mode: 'grid',
  });
  const [activeTab, setActiveTab] = React.useState<FavoriteTab>('Listings');

  return (
    <Container>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorites</h1>
        <p className="text-gray-600">A one stop shop for all of your favorite things</p>
      </div>

      {/* NEW: Favorites Explorer (tabs + search + view toggle) */}
      <FavoritesExplorer
        viewState={viewState}
        setViewState={setViewState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Content */}
      <div className="pt-4 flex flex-col">
        {activeTab === 'Listings' && (
          <div
            className={`
              ${viewState.mode === 'grid'
                ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4'
                : 'space-y-3'}
            `}
          >
            {listings.length ? (
              listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  categories={categories}
                  currentUser={currentUser}
                  data={listing}
                />
              ))
            ) : (
              <EmptyState title="No favorite listings yet" subtitle="Tap the heart on a listing to favorite it." />
            )}
          </div>
        )}

        {activeTab === 'Reels' && (
          <EmptyState title="No favorite reels yet" subtitle="Save reels you love and they’ll appear here." />
        )}
        {activeTab === 'Stores' && (
          <EmptyState title="No favorite stores yet" subtitle="Follow stores to see them in your favorites." />
        )}
        {activeTab === 'Shops' && (
          <EmptyState title="No favorite shops yet" subtitle="Follow shops to see them in your favorites." />
        )}
        {activeTab === 'Products' && (
          <EmptyState title="No favorite products yet" subtitle="Favorite products to find them quickly here." />
        )}
      </div>
    </Container>
  );
};

export default FavoritesClient;

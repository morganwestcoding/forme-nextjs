'use client';

import React from 'react';
import Container from '@/components/Container';
import ListingCard from '@/components/listings/ListingCard';
import { categories } from '@/components/Categories';
import { SafeListing, SafeUser } from '@/app/types';
import FavoritesExplorer from '@/components/favorites/FavoritesExplorer';
import EmptyState from '@/components/EmptyState';

type FavoriteTab = 'Reels' | 'Stores' | 'Market' | 'Shops' | 'Vendors';

interface FavoritesClientProps {
  listings: SafeListing[];
  currentUser?: SafeUser | null;
}

const FavoritesClient: React.FC<FavoritesClientProps> = ({
  listings,
  currentUser,
}) => {
  const [viewState, setViewState] = React.useState<{ mode: 'grid' | 'list' }>({
    mode: 'grid',
  });
  const [activeTab, setActiveTab] = React.useState<FavoriteTab>('Market');

  const emptyCopy: Record<FavoriteTab, { title: string; subtitle: string }> = {
    Reels:   { title: 'No favorite reels yet',    subtitle: 'Save reels you love and they’ll appear here.' },
    Stores:  { title: 'No favorite stores yet',   subtitle: 'Follow stores to see them in your favorites.' },
    Market:  { title: 'No favorite listings yet', subtitle: 'Tap the heart on a listing to favorite it.' },
    Shops:   { title: 'No favorite shops yet',    subtitle: 'Follow shops to see them in your favorites.' },
    Vendors: { title: 'No favorite vendors yet',  subtitle: 'Favorite vendors to find them quickly here.' },
  };

  return (
    <Container>
      {/* Header */}
      <div className="pt-4 mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Favorites</h1>
        <p className="text-gray-600">A one stop shop for all of your favorite things</p>
      </div>

      {/* Always show the explorer */}
      <FavoritesExplorer
        viewState={viewState}
        setViewState={setViewState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Content */}
      <div className="pt-4 flex flex-col">
        {activeTab === 'Market' && (
          listings.length === 0 ? (
            <EmptyState
              title={emptyCopy.Market.title}
              subtitle={emptyCopy.Market.subtitle}
            />
          ) : (
            <div
              className={
                viewState.mode === 'grid'
                  ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4'
                  : 'space-y-3'
              }
            >
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  categories={categories}
                  currentUser={currentUser}
                  data={listing}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'Reels'   && <EmptyState title={emptyCopy.Reels.title}   subtitle={emptyCopy.Reels.subtitle} />}
        {activeTab === 'Stores'  && <EmptyState title={emptyCopy.Stores.title}  subtitle={emptyCopy.Stores.subtitle} />}
        {activeTab === 'Shops'   && <EmptyState title={emptyCopy.Shops.title}   subtitle={emptyCopy.Shops.subtitle} />}
        {activeTab === 'Vendors' && <EmptyState title={emptyCopy.Vendors.title} subtitle={emptyCopy.Vendors.subtitle} />}
      </div>
    </Container>
  );
};

export default FavoritesClient;

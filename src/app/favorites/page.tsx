// app/favorites/page.tsx
import React from 'react';
import ClientOnly from '@/components/ClientOnly';
import getFavoriteListings from '@/app/actions/getFavoriteListings';
import getCurrentUser from '@/app/actions/getCurrentUser';
import FavoritesClient from './FavoritesClient';

const FavoritesPage = async () => {
  const [listings, currentUser] = await Promise.all([
    getFavoriteListings(),
    getCurrentUser(),
  ]);

  return (
    <ClientOnly>
      <FavoritesClient
        listings={listings}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
};

export default FavoritesPage;
// app/favorites/page.tsx
import React from 'react';
import ClientOnly from '@/components/ClientOnly';
import getFavoriteListings from '@/app/actions/getFavoriteListings';
import getFavoritePosts from '../actions/getFavoritePost';
import getFavoriteShops from '@/app/actions/getFavoriteShops';
import getFavoriteWorkers from '@/app/actions/getFavoriteWorkers';
import getCurrentUser from '@/app/actions/getCurrentUser';
import FavoritesClient from './FavoritesClient';

const FavoritesPage = async () => {
  const currentUser = await getCurrentUser();
  
  const [listings, workers, shops, posts] = await Promise.all([
    getFavoriteListings(),
    getFavoriteWorkers(),
    getFavoriteShops(),
    getFavoritePosts(),
  ]);

  return (
    <ClientOnly>
      <FavoritesClient
        listings={listings}
        workers={workers}
        shops={shops}
        posts={posts}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
};

export default FavoritesPage;
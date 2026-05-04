// app/favorites/page.tsx
import React from 'react';
import ClientOnly from '@/components/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import FavoritesClient from './FavoritesClient';

export const metadata = {
  title: 'Favorites',
  description: 'Listings, shops and posts you have saved',
  robots: { index: false, follow: false },
};

const FavoritesPage = async () => {
  const currentUser = await getCurrentUser();

  return (
    <ClientOnly>
      <FavoritesClient currentUser={currentUser} />
    </ClientOnly>
  );
};

export default FavoritesPage;

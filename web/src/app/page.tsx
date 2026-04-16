import React from 'react';
import getCurrentUser from './actions/getCurrentUser';
import DiscoverClient from '@/components/DiscoverClient';

export const dynamic = 'force-dynamic';

const Discover = async () => {
  const currentUser = await getCurrentUser();

  return (
    <DiscoverClient
      currentUser={currentUser}
    />
  );
};

export default Discover;

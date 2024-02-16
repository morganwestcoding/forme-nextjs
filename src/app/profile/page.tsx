// File: src/app/profile/page.tsx

import React from 'react';
import { useRouter } from 'next/router';
import ClientProviders from '@/components/ClientProviders';
import EmptyState from '@/components/EmptyState';
import ProfileClient from './ProfileClient';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { getProfileId } from '../actions/getProfileId'; // Adjust the import path as necessary
import getListings from '@/app/actions/getListings';

const ProfilePage = async () => {
  const router = useRouter();
  const { userId } = router.query; // Adjust according to your routing and fetching logic

  const currentUser = await getCurrentUser();
  const user = userId ? await getProfileId(userId as string) : null; // Use the new function if userId is present
  const listings = userId ? await getListings({ userId: userId as string }) : []; // Adjust getListings call as necessary

  if (!user) {
    return (
      <ClientProviders>
        <EmptyState />
      </ClientProviders>
    );
  }

  return (
    <ClientProviders>
      <ProfileClient
        user={user}
        listings={listings}
        currentUser={currentUser}
      />
    </ClientProviders>
  );
};

export default ProfilePage;

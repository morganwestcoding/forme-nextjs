import React from 'react';
import EmptyState from "@/components/EmptyState";
import ProfileClient from "./ProfileClient"; // Ensure this component is implemented
import getProfileById from '@/app/actions/getProfileById';
import getListings from '@/app/actions/getListings';
import getPosts from '@/app/actions/getPost';
import ClientOnly from '@/components/ClientOnly';

import getCurrentUser from '@/app/actions/getCurrentUser';
 


export const dynamic = 'force-dynamic';
  
const ProfilePage = async ({ params }: any) => {

  const currentUser = await getCurrentUser();
  const user = await getProfileById(params);
  const listings = await getListings(params); 
  const posts = await getPosts(params);

  if (!user) {
    return (
      <ClientOnly>
        <EmptyState />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ProfileClient
        posts={posts}
        listings={listings}
        currentUser={currentUser}
        user={user as any} // no need to change SafeUser or types.ts
      />
    </ClientOnly>
  );
};

export default ProfilePage;

import React from 'react';
import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import ProfileClient from "./ProfileClient"; // Ensure this component is implemented
import getProfileById from '@/app/actions/getProfileById';
import getListings from '@/app/actions/getListings';
import getPosts from '@/app/actions/getPost';
import { SafeUser } from '@/app/types';
import ClientOnly from '@/components/ClientOnly';
 
interface IParams {
  userId?: string;
}

export const dynamic = 'force-dynamic';
  
  const ProfilePage = async ({ params }: { params: IParams }) => {
   
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
        user={user} 
      />
    </ClientOnly>
  );
};

export default ProfilePage;

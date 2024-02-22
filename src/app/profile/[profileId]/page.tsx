import React from 'react';
import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import ProfileClient from "./ProfileClient"; // Ensure this component is implemented
import getProfileById from '@/app/actions/getProfileById';
import getListings from '@/app/actions/getListings';
import getPosts from '@/app/actions/getPost';

interface IParams {
  profileId?: string;
 
}



const ProfilePage = async ({ params }: { params: IParams }) => {
  
  const profile = await getProfileById(params);
  // Adjust params as needed for getPosts
  const posts = await getPosts({ userId: profile?.userId });
  if (!profile) {
    return (
      <ClientProviders>
        <EmptyState />
      </ClientProviders>
    );
  }

  return (
    <ClientProviders>
      <ProfileClient
// currentUser now represents the profile being viewed
        posts={posts}
    
        user={profile} // Pass the currentUser as a prop if needed elsewhere
      />
    </ClientProviders>
  );
};

export default ProfilePage;

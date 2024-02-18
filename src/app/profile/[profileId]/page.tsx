import React from 'react';
import getCurrentUser from "@/app/actions/getCurrentUser";
import getPost from "@/app/actions/getPost";
import getProfile from "@/app/actions/getProfile";
import getListings from "@/app/actions/getListings";
import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import ProfileClient from "./ProfileClient"; // Ensure this component is implemented
import { ExtendedSafeUser, SafePost,SafeListing,SafeUser } from "@/app/types"; // Assuming this is correctly defined

interface IParams {
  userId?: string;
}

const ProfilePage = async ({ params }: { params: IParams }) => {
  const currentUserData = await getCurrentUser();

  if (!currentUserData) {
    return <ClientProviders><EmptyState /></ClientProviders>;
  }

  const currentUser: ExtendedSafeUser = {
    ...currentUserData,
    userImage: currentUserData.image || "/people/chicken-headshot.jpeg",
    imageSrc: currentUserData.image || "/assets/hero-background.jpeg",
    profileId: currentUserData.profileId || 'default-profile-id', // Provide a default or fallback value
  };
  
  const posts = await getPost({ userId: params.userId || currentUser.id });
  const listings = await getListings({ userId: params.userId || currentUser.id });

  // Render ProfileClient with fetched data
  return (
    <ClientProviders>
      <ProfileClient
        user={currentUser}
        posts={posts}
        listings={listings}
        currentUser={currentUser}
      />
    </ClientProviders>
  );
};

export default ProfilePage;

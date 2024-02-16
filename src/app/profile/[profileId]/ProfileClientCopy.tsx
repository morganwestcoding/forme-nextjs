// Assuming 'use client' means this is for Next.js or a similar SSR framework.
import React, { useEffect, useState } from 'react';
import ClientProviders from '@/components/ClientProviders';
import Post from '@/components/feed/Post';
import getPosts,  { IPostsParams }  from '../actions/getPost'; // Adjust the import path as needed
import { SafeUser, SafePost } from '../types'; // Ensure these are imported correctly
import ProfileHead from '@/components/profile/ProfileHead';
import ProfileRightbar from '@/components/rightbar/ProfileRightBar';
import { categories } from "@/components/Categories";
import getCurrentUser from '../actions/getCurrentUser';
import useLoginModal from '../hooks/useLoginModal';

interface ProfileClientProps {
  currentUser?: SafeUser | null;
}


const ProfileClient: React.FC<ProfileClientProps> = ({
  currentUser
}) => {
  const loginModal = useLoginModal();


  return (
    <ClientProviders>
     
        <ProfileHead
        currentUser={currentUser} 
          onImageChange={(newImageUrl: string) => {
            // Assuming you have a method to update the user's image
            console.log("Image URL changed to:", newImageUrl);
            // Update the user's image in the state/store if needed
          }}
        />
      
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-20 mt-2">
        {posts.map((post) => (
            <Post key={post.id} post={post} currentUser={currentUser} categories={categories} />
          ))}
        </div>
        <div className="flex-grow w-[45%] ml-4">
          <ProfileRightbar />
        </div>
      </div>
    </ClientProviders>
  );
};


export default ProfileClient;
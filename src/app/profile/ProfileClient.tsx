'use client';

import React from 'react';
import ProfileHead from '@/components/profile/ProfileHead';

import { useState } from 'react';
import ClientProviders from '@/components/ClientProviders';
import Post from '@/components/feed/Post';
import getPosts from '../actions/getPost';
import getCurrentUser from '../actions/getCurrentUser';
import { useEffect } from 'react';
import { categories } from "@/components/Categories";
import ProfileRightbar from '@/components/rightbar/ProfileRightBar';


import { SafeUser, SafePost } from '../types'; // Ensure these are imported correctly
import ProfilePage from './page';

interface ProfileClientProps {
    initialUser: SafeUser | null;
    posts: SafePost[]; // Add this line
    currentUser: SafeUser | null; // Add this line, if different from initialUser
    categories: typeof categories; // Add this line
}

const ProfileClient: React.FC<ProfileClientProps> = ({ initialUser }) => {
    const [posts, setPosts] = useState<SafePost[]>([]);
    const [currentUser, setCurrentUser] = useState<SafeUser | null>(initialUser);
    const [userImage, setUserImage] = useState<string>(initialUser?.image || '');

    // Function to handle image URL updates
    const handleImageChange = (newImageUrl: string) => {
        setUserImage(newImageUrl); // Update local state with new image URL
    };

    useEffect(() => {
        const fetchPosts = async () => {
            // Check if initialUser exists and has an id
            if (initialUser && initialUser.id) {
                try {
                    const postsData = await getPosts({ userId: initialUser.id });
                    console.log("Fetched posts:", postsData); 
                    setPosts(postsData);
                } catch (error) {
                    console.error("Failed to fetch posts:", error);
                    // Optionally, handle the error state in the UI
                }
            }
        };
    
        fetchPosts();
    
        // Existing code to update currentUser if necessary
        if (!currentUser) {
            const fetchCurrentUser = async () => {
                const userData = await getCurrentUser();
                setCurrentUser(userData);
            };
    
            fetchCurrentUser();
        }
    }, [initialUser]); // Dependency array - it runs the effect when initialUser changes
    // Dependency array includes currentUser to refetch if it changes
   
  
   
  return (
    <ClientProviders>
 {initialUser && (
      <ProfileHead
        user={{
          ...initialUser,
          image: userImage, // Ensure this is a string; you've already provided a default above
          // Consider adding defaults here if any other SafeUser properties could be missing/undefined
        }}
        onImageChange={handleImageChange}
      />
    )}
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
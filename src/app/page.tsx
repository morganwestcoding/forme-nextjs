import React from 'react';
import Rightbar from '../components/rightbar/Rightbar';
import Share from '@/components/feed/Share';
import ClientProviders from '@/components/ClientProviders';
import getCurrentUser from './actions/getCurrentUser';
import Post from '@/components/feed/Post';
import { SafeUser } from './types';

export default async function Home() {
  const currentUser = await getCurrentUser(); // Fetch currentUser

  const postData = currentUser ? {
    user: currentUser, // Assuming currentUser has the required fields
    createdAt: new Date().toISOString(), // Sample date
    content: 'This is a sample post content.', // Sample content
    imageSrc: '/assets/skyline.jpg', // Replace with actual image path
    category: 'Category', // Sample category
    location: 'Location'
  } : null;
  
  return (
    <ClientProviders>
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-20 mt-8">
          <Share currentUser={currentUser} />
          {/* Render Post only if postData and currentUser are not null */}
          {postData && currentUser && <Post post={postData} currentUser={currentUser} />}
        </div>
        <div className="flex-grow w-[45%] ml-4">
          <Rightbar />
        </div>
      </div>
    </ClientProviders>
  );
};

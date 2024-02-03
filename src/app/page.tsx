// src/app/page.tsx
import React from 'react';
import Rightbar from '../components/rightbar/Rightbar';
import Share from '@/components/feed/Share';
import ClientProviders from '@/components/ClientProviders';
import getCurrentUser from './actions/getCurrentUser';
import Post from '@/components/feed/Post';
import getPosts, { IPostsParams }  from './actions/getPost';
import EmptyState from '@/components/EmptyState';
import { SafePost, SafeUserImage } from '@/app/types';

export default async function Home() {
  const currentUser = await getCurrentUser();
  const searchParams: IPostsParams = {};
  const posts = await getPosts(searchParams);

  const transformedPosts = posts.map((post): any => {
    return {
      ...post,
      imageSrc: post.imageSrc || undefined, // Convert null to undefined
      // Assuming post.user is always present. If it's optional, handle accordingly
      user: post.user as SafeUserImage,
    };
  });

  return (
    <ClientProviders>
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-20 mt-8">
          <Share currentUser={currentUser} />
          {transformedPosts.map((post) => (
            <Post key={post.id} post={post} currentUser={currentUser} />
          ))}
        </div>
        <div className="flex-grow w-[45%] ml-4">
          <Rightbar />
        </div>
      </div>
    </ClientProviders>
  );
};

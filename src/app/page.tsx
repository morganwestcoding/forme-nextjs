// src/app/page.tsx
import React from 'react';
import Rightbar from '../components/rightbar/Rightbar';
import Share from '@/components/feed/Share';
import ClientProviders from '@/components/ClientProviders';
import getCurrentUser from './actions/getCurrentUser';
import Post from '@/components/feed/Post';
import getPosts, { IPostsParams }  from './actions/getPost';
import EmptyState from '@/components/EmptyState';

export default async function Home() {
  const currentUser = await getCurrentUser();
  const searchParams: IPostsParams = {};
  const posts = await getPosts(searchParams);

  return (
    <ClientProviders>
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-20 mt-8">
          <Share currentUser={currentUser} />
          {posts.map(post => (
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

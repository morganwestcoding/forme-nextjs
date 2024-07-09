
import React from 'react';
import Rightbar from '../components/rightbar/Rightbar';
import Share from '@/components/feed/Share';
import ClientProviders from '@/components/ClientProviders';
import getCurrentUser from './actions/getCurrentUser';
import Post from '@/components/feed/Post';
import {categories} from '@/components/Categories';
import getPosts, 
{ IPostsParams }  from './actions/getPost';

interface PostProps {
  searchParams: IPostsParams
}

export const dynamic = 'force-dynamic';

const Newsfeed = async ({ searchParams }: PostProps) => {
  const posts = await getPosts(searchParams)
  const currentUser = await getCurrentUser();

  return (
    <ClientProviders>
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-28 mt-8 mr-1">
          <Share currentUser={currentUser} />
          {posts.map((post) => (
            <Post key={post.id} post={post} currentUser={currentUser} categories={categories} />
          ))}
        </div>
        <div className="flex-grow w-[55%] ml-4">
          <Rightbar />
        </div>
      </div>
    </ClientProviders>
  );
};

export default Newsfeed;
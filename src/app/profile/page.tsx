import React from 'react';
import Post from '@/components/feed/Post'; // Adjust the import path as necessary
import getCurrentUser from '../actions/getCurrentUser';
import getPosts, { IPostsParams } from '../actions/getPost';
import Rightbar from '@/components/rightbar/Rightbar';

export default async function Page() {
  const currentUser = await getCurrentUser();

  const searchParams: IPostsParams = {};
  const posts = await getPosts(searchParams);

  return (
    <div>
      <div className="relative mx-auto bg-gray-800 text-white text-center h-56 py-8 w-10/12 mt-6 rounded-lg">
        <div className="Header title">Header Title</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gray-600 rounded-full"></div>
      </div>
      {/* Rest of the page content */}
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-20 mt-8">
        {posts.map(post => (
          <Post key={post.id} post={post} currentUser={currentUser} />
        ))}
      </div>
      
      <div className="flex-grow w-[45%] ml-4">
          <Rightbar />
        </div>
        </div>
    </div>
  );
}

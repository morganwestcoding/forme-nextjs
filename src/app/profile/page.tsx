import React from 'react';
import Post from '@/components/feed/Post'; // Adjust the import path as necessary
import getCurrentUser from '../actions/getCurrentUser';
import getPosts, { IPostsParams } from '../actions/getPost';
import ProfileRightbar
 from '@/components/rightbar/ProfileRightBar';
 
export default async function Page() {
  const currentUser = await getCurrentUser();

  const searchParams: IPostsParams = {};
  const posts = await getPosts(searchParams);

  return (
    <div>
      <div className="flex justify-between w-full mt-8 px-20">
        <div className="w-[0%]"></div> {/* This empty div helps in aligning the header with the Post component */}
        <div className="bg-white bg-opacity-70 text-white text-center h-56 py-8 w-[100%] rounded-lg">
          <div className="Header title">Header Title</div>
        </div>
        <div className="w-[2%]"></div> {/* This empty div helps in aligning the header with the Rightbar component */}
      </div>
      {/* Rest of the page content */}
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-20 mt-2">
          {posts.map(post => (
            <Post key={post.id} post={post} currentUser={currentUser} />
          ))}
        </div>
        
        <div className="flex-grow w-[45%] ml-4">
          <ProfileRightbar />
        </div>
      </div>
    </div>
  );
}

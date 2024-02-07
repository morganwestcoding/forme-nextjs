import React from 'react';
import Post from '@/components/feed/Post'; // Adjust the import path as necessary
import getCurrentUser from '../actions/getCurrentUser';
import getPosts, { IPostsParams } from '../actions/getPost';
import ProfileRightbar
 from '@/components/rightbar/ProfileRightBar';
 import { SafePost, SafeUserImage } from '@/app/types';
 
export default async function Page() {
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
    <div>
      <div className="flex justify-between w-full mt-8 px-20">
        <div className="w-[0%]"></div>

               {/*Header Banner*/}
        <div className="bg-white bg-opacity-70 text-white text-center h-56 py-8 w-[100%] rounded-lg flex justify-center items-center">
          {/* Rectangle inside the header */}
          <div className="w-5/12 h-40 bg-white bg-opacity-80 rounded-lg flex shadow-md">
            {/* Image Placeholder */}
            <div className="w-1/2 h-full bg-gray-300 rounded-l-lg flex justify-center items-center">
              <span className="text-gray-700">Image Placeholder</span>
            </div>

            {/* Bio Section */}
            <div className="w-1/2 h-full bg-white bg-opacity-90 rounded-r-lg flex flex-col justify-center items-center p-4">
              <span className="text-gray-800 text-lg font-semibold">Bio</span>
              <p className="text-sm text-gray-600 mt-2">Short bio or description goes here, detailing the subject or purpose of the banner.</p>
            </div>
          </div>
        </div>


        <div className="w-[2%]"></div> {/* This empty div helps in aligning the header with the Rightbar component */}
      </div>
      {/* Rest of the page content */}
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-20 mt-2">
        {transformedPosts.map((post) => (
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

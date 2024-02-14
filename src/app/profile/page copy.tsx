import React from 'react';
import Post from '@/components/feed/Post'; // Adjust the import path as necessary
import getCurrentUser from '../actions/getCurrentUser';
import getPosts, { IPostsParams } from '../actions/getPost';
import Image from 'next/image';
import ProfileRightbar
 from '@/components/rightbar/ProfileRightBar';
 import { SafePost, SafeUserImage } from '@/app/types';
import { Button } from '@/components/ui/button';
import { categories } from '@/components/Categories';
import Avatar from '@/components/ui/avatar';


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
      {/*ProfileHead*/}
      <div className="flex justify-between w-full mt-8 px-20">
        <div className="w-[0%]"></div>   
               <div className="relative text-white text-center h-56 py-8 w-full rounded-lg flex justify-center items-center">
              <Image
                src="/assets/hero-background.jpeg"
                layout="fill"
                objectFit="cover"
                className="rounded-lg" // To match the container's border-radius
                alt="Background"
              />
              {/* Overlay */}
  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div> {/* Adjust color and opacity as needed */}
          {/* Rectangle inside the header */}
          <div className="w-5/12 h-40 bg-white bg-opacity-95 rounded-lg flex shadow-md z-50">
  {/* User Profile Picture */}
  <div className="w-48 h-full flex justify-center items-center z-50 relative">
    <Image
      src={currentUser?.image || "/people/rooster.jpg"} // Use user's image or placeholder
      alt="User Avatar"
      layout="fill"
      objectFit="cover"
      className="rounded-l-lg"
    />
  </div>

                        {/* Bio Section */}
            <div className="w-1/2 h-full rounded-r-lg flex flex-col justify-center items-center p-4 z-50">
            <span className="text-gray-800 font-semibold ml-3 justify-start">{currentUser?.name || 'Username'}</span>
              {/* Friends and Followers Placeholder Container */}
              <div className="mt-2 w-full ml-5 flex justify-around items-center">
                {/* Friends Placeholder */}
                <div className="flex justify-center items-center">
                  <span className="text-gray-700 text-sm"><b>0</b> Following</span>
                </div>

                {/* Followers Placeholder */}
                <div className="flex justify-center items-center">
                  <span className="text-gray-700 text-sm"><b>0</b> Followers</span>
                </div>
              </div>

             {/* Adjusted button order here for visual layout */}
             <div className="flex mt-4 gap-0.5 -mb-2 ml-6">
                <button className='rounded-l-md text-sm drop-shadow-sm bg-[#ffffff] w-28 p-2 text-black'>
                  Follow
                </button>
                <button className='rounded-r-md bg-[#ffffff] drop-shadow-sm p-2 text-black'>
                  <Image src="/icons/sms.svg" alt="Message" width={24} height={24} className='drop-shadow-sm' />
                </button>
              </div>
            </div>
          </div>
        </div>


        <div className="w-[2%]"></div> {/* This empty div helps in aligning the header with the Rightbar component */}
      </div>
       {/*ProfileHeadEnd*/}


      {/* Rest of the page content */}
      <div className="flex w-full">
        <div className="flex-none w-[45%] ml-20 mt-2">
        {transformedPosts.map((post) => (
            <Post key={post.id} post={post} currentUser={currentUser} categories={categories} />
          ))}
        </div>
        
        <div className="flex-grow w-[45%] ml-4">
          <ProfileRightbar />
        </div>
      </div>
    </div>
  );
}

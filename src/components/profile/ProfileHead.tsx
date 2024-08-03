'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ProfileHeadProps {
  user: SafeUser;
  currentUser: SafeUser | null;
}

const ProfileHead: React.FC<ProfileHeadProps> = ({ user, currentUser }) => {
  const { name, imageSrc, image, following, followers } = user;
  const [isFollowing, setIsFollowing] = useState(currentUser?.following?.includes(user.id) || false);
  const [followersCount, setFollowersCount] = useState(followers?.length || 0);

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to follow users');
      return;
    }

    try {
      const response = await axios.post(`/api/follow/${user.id}`);
      setIsFollowing(!isFollowing);
      setFollowersCount(response.data.followers.length);
      toast.success(isFollowing ? 'Unfollowed successfully' : 'Followed successfully');
    } catch (error) {
      toast.error('Something went wrong');
    }
  };
  
  return (
    <div className="flex justify-between w-full mt-8 px-20">
      <div className="w-[3.1%]"></div>
      <div className="relative text-white text-center h-56 py-8 w-full flex justify-center items-center">
        <Image src={imageSrc || "/assets/hero-background.jpeg"}
         layout="fill" 
         objectFit="cover" 
         className="rounded-2xl" 
         alt="Background" />
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-2xl"></div>

        <div className="relative w-48 h-full flex justify-center items-center z-50">
          <Image
            src={image || "/people/chicken-headshot.jpeg"}
            alt="currentUser Avatar"
            layout="fill"
            objectFit="cover"
            className="rounded-l-xl"
          />
        </div>
        <div className="w-68 h-40 bg-white rounded-r-xl flex shadow-sm z-50">
          {/* Bio Section */}
          <div className=" h-full rounded-r-2xl flex flex-col justify-center items-center p-4 z-50">
            <span className="text-gray-800 font-semibold flex justify-center items-center">{name}</span>
            {/* Friends and Followers */}
            <div className="mt-2 w-full flex justify-center items-center gap-2">
              <div className="flex justify-center items-center">
                <span className="text-gray-700 text-sm"><b>{following?.length || 0}</b> Following</span>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-gray-700 text-sm"><b>{followersCount}</b> Followers</span>
              </div>
            </div>

            {/* Follow and Message Buttons */}
            <div className="flex justify-center w-full mt-4 gap-1 ">
              <div className='flex gap-2 w-[200px]'>
              {currentUser && currentUser.id !== user.id ? (
                <>
                <button 
                  onClick={handleFollow}
                  className='font-light text-[#717171] rounded-lg text-xs bg-[#ffffff] border p-2.5 px-8 mr-1 shadow-sm ml-4'
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              
              <button className='flex items-center justify-center rounded-full p-3 cursor-pointer shadow-sm border'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={"#a2a2a2"} fill={"none"}>
    <path d="M7 8.5L9.94202 10.2394C11.6572 11.2535 12.3428 11.2535 14.058 10.2394L17 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.01576 13.4756C2.08114 16.5411 2.11382 18.0739 3.24495 19.2093C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.755 19.2093C21.8862 18.0739 21.9189 16.5411 21.9842 13.4756C22.0053 12.4899 22.0053 11.51 21.9842 10.5244C21.9189 7.45883 21.8862 5.92606 20.755 4.79063C19.6239 3.6552 18.0497 3.61565 14.9012 3.53654C12.9607 3.48778 11.0393 3.48778 9.09882 3.53653C5.95033 3.61563 4.37608 3.65518 3.24495 4.79062C2.11382 5.92605 2.08113 7.45882 2.01576 10.5243C1.99474 11.51 1.99474 12.4899 2.01576 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
</svg>
              </button>
              </>
            ) : (
                  <button className='font-light text-[#717171] rounded-lg text-xs bg-[#ffffff] border p-2.5 px-6 ml-5 shadow-sm w-40'>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[1.5%]"></div>
    </div>
  );
};

export default ProfileHead;
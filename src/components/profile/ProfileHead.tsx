'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CreateChatButton from '@/components/profile/CreateChatButton';

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
    <div className="flex justify-between w-full mt-8">
      <div className="relative text-white text-center h-56 py-8 w-full flex justify-center items-center z-5">
        <Image src={imageSrc || "/assets/hero-background.jpeg"}
         layout="fill" 
         objectFit="cover" 
         className="rounded-2xl" 
         alt="Background" />
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-2xl"></div>

        <div className="relative w-48 h-full flex justify-center items-center">
          <Image
            src={image || "/people/chicken-headshot.jpeg"}
            alt="currentUser Avatar"
            layout="fill"
            objectFit="cover"
            className="rounded-l-xl"
          />
        </div>
        <div className="w-68 h-40 bg-white rounded-r-xl flex shadow-sm z-10">
          {/* Bio Section */}
          <div className=" h-full rounded-r-2xl flex flex-col justify-center items-center p-4">
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
                {/* Replace the Message Button with CreateChatButton */}
                <CreateChatButton currentUser={currentUser} otherUserId={user.id} />
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
    </div>
  );
};

export default ProfileHead;
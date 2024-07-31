
'use client';
import React from 'react';
import Image from 'next/image';
import { SafeUser } from '@/app/types';

interface ProfileHeadProps {
  user: SafeUser;
}

const ProfileHead: React.FC<ProfileHeadProps> = ({ user }) => {
  const { name, imageSrc, image } = user;
  
  return (
    <div className="flex justify-between w-full mt-8 px-20 mb-2">
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
            {/* Friends and Followers Placeholder */}
            <div className="mt-2 w-full flex justify-center items-center gap-2">
    <div className="flex justify-center items-center">
      <span className="text-gray-700 text-sm"><b>0</b> Following</span>
    </div>
    <div className="flex justify-center items-center">
      <span className="text-gray-700 text-sm"><b>0</b> Followers</span>
    </div>
  </div>

            {/* Follow and Message Buttons */}
            <div className="flex justify-center w-full mt-4 gap-1 ">
              <button className='font-light text-[#717171] rounded-lg text-xs bg-[#ffffff] border p-2.5 px-8 mr-1 shadow-sm ml-1'>
                Follow
              </button>
            
              <button className='font-light text-[#717171] rounded-lg text-xs bg-[#ffffff] border p-2.5 px-6 mr-1 shadow-sm'>
                Message
              </button>

            </div>
          </div>
        </div>
      </div>

      <div className="w-[1.5%]"></div> {/* This empty div helps in aligning the header with the Rightbar component */}
    </div>
  );
};

export default ProfileHead;
// ProfileHead.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import HeaderUpload from '../inputs/HeaderUpload';
import { SafeProfile } from '@/app/types';

interface ProfileHeadProps {
  user: SafeProfile;

}

const ProfileHead: React.FC<ProfileHeadProps> = ({ user }) => {
  const { name, imageSrc, image } = user;
  

  return (
    <div className="flex justify-between w-full mt-8 px-20">
      <div className="w-[0%]"></div>
      <div className="relative text-white text-center h-56 py-8 w-full rounded-lg flex justify-center items-center">
        <Image src={imageSrc || "/assets/hero-background.jpeg"}
         layout="fill" 
         objectFit="cover" 
         className="rounded-lg" 
         alt="Background" />
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>

        <div className="w-5/12 h-40 bg-white bg-opacity-95 rounded-lg flex shadow-md z-50">
          <div className="relative w-48 h-full flex justify-center items-center z-50">
            <Image
              src={image || "/people/chicken-headshot.jpeg"}
              alt="currentUser Avatar"
              layout="fill"
              objectFit="cover"
              className="rounded-l-lg"
            />
          </div>

          {/* Bio Section */}
          <div className="w-1/2 h-full rounded-r-lg flex flex-col justify-center items-center p-4 z-50">
            <span className="text-gray-800 font-semibold ml-3 justify-start">{name}</span>
            {/* Friends and Followers Placeholder */}
            <div className="mt-2 w-full ml-5 flex justify-around items-center">
              <div className="flex justify-center items-center">
                <span className="text-gray-700 text-sm"><b>0</b> Following</span>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-gray-700 text-sm"><b>0</b> Followers</span>
              </div>
            </div>

            {/* Follow and Message Buttons */}
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
  );
};

export default ProfileHead;
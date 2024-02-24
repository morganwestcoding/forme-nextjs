// ProfileHead.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import HeaderUpload from '../inputs/HeaderUpload';
import { SafeProfile } from '@/app/types';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';

interface ProfileHeadProps {
  user: SafeProfile;

}

const ProfileHead: React.FC<ProfileHeadProps> = ({ user }) => {
  const { name, imageSrc, image } = user;
  

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

        <div className="w-5/12 h-40 bg-white rounded-2xl flex shadow-md z-50">
          <div className="relative w-48 h-full flex justify-center items-center z-50">
            <Image
              src={image || "/people/chicken-headshot.jpeg"}
              alt="currentUser Avatar"
              layout="fill"
              objectFit="cover"
              className="rounded-l-2xl"
            />
          </div>

          {/* Bio Section */}
          <div className="w-1/2 h-full rounded-r-2xl flex flex-col justify-center items-center p-4 z-50">
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
              <button className='rounded-l-2xl text-sm drop-shadow-sm bg-[#ffffff] w-28 p-2 text-black'>
                Follow
              </button>
              <button className='rounded-r-2xl bg-[#ffffff] drop-shadow-sm p-2 text-black'>
                <EmailRoundedIcon width={24} height={24} className='drop-shadow-sm' />
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
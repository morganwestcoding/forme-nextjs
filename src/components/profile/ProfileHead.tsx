// ProfileHead.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';// Ensure this path matches your project structure
import { TbPhotoPlus } from 'react-icons/tb'; // Assuming you're using react-icons for icons
import { ExtendedSafeUser } from '@/app/types';
import axios from 'axios';
import { useCallback } from 'react';



interface ProfileHeadProps {
  user: ExtendedSafeUser;
  onUpdateUserImage: (newUserImage: string, newImageSrc: string) => void;// Prop to update user image in parent component
}


const ProfileHead: React.FC<ProfileHeadProps> = ({ user, onUpdateUserImage }) => {
  const { name, imageSrc, id, userImage } = user;
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc);
  const [currentUserImage, setCurrentUserImage] = useState(userImage);

  const handleUpload = useCallback(async (result: any) => {
    if (result.info && result.info.secure_url) {
      const imageUrl = result.info.secure_url;

      try {
        const response = await axios.post('/api/profile', {
          userId: id,
          userImage: imageUrl,
          imageSrc: imageUrl, // Assuming the same image is used for both userImage and imageSrc
        });
        console.log("Profile updated successfully", response.data);
        setCurrentUserImage(imageUrl);
        setCurrentImageSrc(imageUrl);
        onUpdateUserImage(imageUrl, imageUrl); // Pass both as potentially they could be handled differently
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  }, [id, onUpdateUserImage]);

  return (
    <div className="flex justify-between w-full mt-8 px-20">
      <div className="w-[0%]"></div>
      <div className="relative text-white text-center h-56 py-8 w-full rounded-lg flex justify-center items-center">
        <Image src={currentImageSrc || "/assets/hero-background.jpeg"} layout="fill" objectFit="cover" className="rounded-lg" alt="Background" />
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>
        <div className="w-5/12 h-40 bg-white bg-opacity-95 rounded-lg flex shadow-md z-50">
          <div className="relative w-48 h-full flex justify-center items-center z-50">
            <Image
               src={currentUserImage || "/people/chicken-headshot.jpeg"} 
              alt="currentUser Avatar"
              layout="fill"
              objectFit="cover"
              className="rounded-l-lg"
            />
            <CldUploadWidget uploadPreset="cs0am6m7" onUpload={handleUpload}>
              {({ open }) => (
                <div className="absolute bottom-0 right-0 p-2 cursor-pointer" onClick={() => open()}>
                  <TbPhotoPlus size={24} className="text-white bg-gray-700 rounded-full" />
                </div>
              )}
            </CldUploadWidget>
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

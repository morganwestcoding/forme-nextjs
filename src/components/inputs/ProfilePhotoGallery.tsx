'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useProfileGalleryModal from '@/app/hooks/useProfileGalleryModal';
import { SafeUser } from '@/app/types';
import axios from 'axios';

interface ProfilePhotoGalleryProps {
  currentUser: SafeUser | null;
}

const ProfilePhotoGallery: React.FC<ProfilePhotoGalleryProps> = ({ currentUser }) => {
  const [images, setImages] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const profileGalleryModal = useProfileGalleryModal();

  useEffect(() => {
    if (currentUser && currentUser.galleryImages) {
      setImages(currentUser.galleryImages);
    }
  }, [currentUser]);

  const handleAddImage = useCallback(async (imageSrc: string) => {
    try {
      const response = await axios.post('/api/profile', {
        action: 'addGalleryImage',
        galleryImage: imageSrc
      });
      
      if (response.data && response.data.galleryImages) {
        const newImage = response.data.galleryImages[0];
        setImages(prevImages => [newImage, ...prevImages]);
      }
      
      profileGalleryModal.onClose();
    } catch (error) {
      console.error('Error adding image:', error);
    }
  }, [profileGalleryModal]);

  const handleDeleteImage = async (index: number) => {
    try {
      await axios.delete(`/api/profile?imageIndex=${index}`);
      setImages(prevImages => prevImages.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden pb-[2rem] relative">
      <div className="px-8 md:px-6 pt-6 flex justify-between items-center">
        <h2 className="text-xl font-bold mb-3">Gallery</h2>
        <div className="relative">
          <button onClick={toggleDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#a2a2a2" fill="none">
    <path d="M11.9959 12H12.0049" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M17.9998 12H18.0088" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M5.99981 12H6.00879" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
</svg>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={() => profileGalleryModal.onOpen()}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Add Photo
              </button>
              <button
                onClick={() => handleDeleteImage(images.length - 1)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Delete Last Photo
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 px-8 md:px-6 max-w-2xl mx-auto">
        {images.map((image, index) => (
          <div key={index} className={`relative ${index === 0 ? 'col-span-2 row-span-2' : ''}`}>
            <div className="aspect-w-1 aspect-h-1 w-full">
              <Image
                src={image}
                layout="fill"
                objectFit="cover"
                alt={`Gallery image ${index + 1}`}
                className="rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePhotoGallery;
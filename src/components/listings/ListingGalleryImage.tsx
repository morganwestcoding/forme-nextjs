// components/listings/ListingGalleryImage.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useListingGalleryModal from '@/app/hooks/useListingGalleryModal';
import AddListingImageButton from '../inputs/AddListingImageButton';
import { SafeListing, SafeUser } from '@/app/types';
import axios from 'axios';

interface ListingGalleryImageProps {
  listing: SafeListing | null;
  currentUser: SafeUser | null | undefined;
}

const ListingGalleryImage: React.FC<ListingGalleryImageProps> = ({ listing, currentUser }) => {
  const [images, setImages] = useState<string[]>(listing?.galleryImages || []);
  const [isEditMode, setIsEditMode] = useState(false);
  const listingGalleryModal = useListingGalleryModal();

  useEffect(() => {
    if (listing && listing.galleryImages) {
      setImages(listing.galleryImages);
    }
  }, [listing]);

  const handleAddImage = useCallback(async (newImage: string) => {
    if (!listing) return;
    try {
      const response = await axios.patch(`/api/listings/${listing.id}`, {
        action: "addImage",
        image: newImage
      });
      const updatedListing = response.data;
      setImages(updatedListing.galleryImages);
    } catch (error) {
      console.error('Failed to add image:', error);
    }
  }, [listing]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleDeleteImage = async (index: number) => {
    if (!listing) return;
    try {
      const response = await axios.patch(`/api/listings/${listing.id}`, {
        action: "removeImage",
        imageIndex: index
      });
      const updatedListing = response.data;
      setImages(updatedListing.galleryImages);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  return (
    <div className="w-full pl-4 pr-[1.5%]">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative">
        <div className="px-6 pt-6 flex justify-between items-center">
        </div>
        <div className="grid grid-cols-4 gap-2 px-6 pb-6">
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
              {isEditMode && (
                <button 
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-2 right-2 shadow-inner"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffffff" fill="#ffffff">
                    <path d="M10.2471 6.7402C11.0734 7.56657 11.4866 7.97975 12.0001 7.97975C12.5136 7.97975 12.9268 7.56658 13.7531 6.74022L13.7532 6.7402L15.5067 4.98669L15.5067 4.98668C15.9143 4.5791 16.1182 4.37524 16.3302 4.25283C17.3966 3.63716 18.2748 4.24821 19.0133 4.98669C19.7518 5.72518 20.3628 6.60345 19.7472 7.66981C19.6248 7.88183 19.421 8.08563 19.0134 8.49321L17.26 10.2466C16.4336 11.073 16.0202 11.4864 16.0202 11.9999C16.0202 12.5134 16.4334 12.9266 17.2598 13.7529L19.0133 15.5065C19.4209 15.9141 19.6248 16.1179 19.7472 16.3299C20.3628 17.3963 19.7518 18.2746 19.0133 19.013C18.2749 19.7516 17.3965 20.3626 16.3302 19.7469C16.1182 19.6246 15.9143 19.4208 15.5067 19.013L13.7534 17.2598L13.7533 17.2597C12.9272 16.4336 12.5136 16.02 12.0001 16.02C11.4867 16.02 11.073 16.4336 10.2469 17.2598L10.2469 17.2598L8.49353 19.013C8.0859 19.4208 7.88208 19.6246 7.67005 19.7469C6.60377 20.3626 5.72534 19.7516 4.98693 19.013C4.2484 18.2746 3.63744 17.3963 4.25307 16.3299C4.37549 16.1179 4.5793 15.9141 4.98693 15.5065L6.74044 13.7529C7.56681 12.9266 7.98 12.5134 7.98 11.9999C7.98 11.4864 7.5666 11.073 6.74022 10.2466L4.98685 8.49321C4.57928 8.08563 4.37548 7.88183 4.25307 7.66981C3.63741 6.60345 4.24845 5.72518 4.98693 4.98669C5.72542 4.24821 6.60369 3.63716 7.67005 4.25283C7.88207 4.37524 8.08593 4.5791 8.49352 4.98668L8.49353 4.98669L10.2471 6.7402Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        {currentUser?.id === listing?.userId && (
          <div className="absolute bottom-6 left-6 flex space-x-3">
            <AddListingImageButton listing={listing} onImageAdded={handleAddImage} />
            <div 
              onClick={toggleEditMode}
              className="flex items-center justify-center bg-[#ffffff] rounded-full p-3 cursor-pointer shadow-sm border"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#a2a2a2" fill="none">
                <path d="M3 12C3 11.4188 3 11.1282 3.0575 10.8897C3.21354 10.2427 3.6684 9.73726 4.25074 9.56389C4.46534 9.5 4.72689 9.5 5.25 9.5H18.75C19.2731 9.5 19.5347 9.5 19.7493 9.56389C20.3316 9.73726 20.7865 10.2427 20.9425 10.8897C21 11.1282 21 11.4188 21 12C21 12.5812 21 12.8718 20.9425 13.1103C20.7865 13.7573 20.3316 14.2627 19.7493 14.4361C19.5347 14.5 19.2731 14.5 18.75 14.5H5.25C4.72689 14.5 4.46534 14.5 4.25074 14.4361C3.6684 14.2627 3.21354 13.7573 3.0575 13.1103C3 12.8718 3 12.5812 3 12Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingGalleryImage;
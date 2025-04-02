'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useListingGalleryModal from '@/app/hooks/useListingGalleryModal';
import useListingGridModal from '@/app/hooks/useListingGridModal';
import ListingGridModal from '../modals/ListingGridModal';
import { SafeListing, SafeUser } from '@/app/types';
import axios from 'axios';

interface ListingGalleryImageProps {
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingGalleryImage: React.FC<ListingGalleryImageProps> = ({ listing, currentUser }) => {
  const [images, setImages] = useState<string[]>(listing?.galleryImages || []);
  const [isEditMode, setIsEditMode] = useState(false);
  const listingGalleryModal = useListingGalleryModal();
  const listingGridModal = useListingGridModal();

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

  // Prepare the images array - combine main image with gallery images
  const allImages = listing?.imageSrc 
    ? [listing.imageSrc, ...images] 
    : [...images];
  
  // Create placeholders if fewer than 4 images
  const displayImages = [...allImages];
  while (displayImages.length < 4) {
    displayImages.push(''); // Empty placeholder
  }

  const handleImageClick = () => {
    if (listing?.id) {
      listingGridModal.onOpen(listing.id);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full max-w-xs ml-auto">
        {displayImages.slice(0, 4).map((image, index) => (
          <div 
            key={index} 
            className={`relative cursor-pointer overflow-hidden rounded-md ${!image ? 'bg-gray-100' : ''}`}
            onClick={() => image && handleImageClick()}
          >
            {image ? (
              <>
                <div className="aspect-[4/3] w-full h-full relative shadow-sm">
                  <Image
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 150px"
                    className="object-cover rounded-md transition-all duration-500 hover:scale-110 hover:brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 opacity-0 hover:opacity-100 transition-all duration-300" />
                </div>

                {/* Show View All overlay on the last image if there are more than 4 */}
                {index === 3 && allImages.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                    <span className="text-white font-medium text-sm">
                      +{allImages.length - 4} more
                    </span>
                  </div>
                )}

                {/* Delete Button in Edit Mode - only shown in edit mode */}
                {isEditMode && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteImage(index);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 
                             hover:bg-black/60 transition-all duration-300 shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" color="#ffffff" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </>
            ) : (
              // Empty placeholder
              <div className="aspect-[4/3] w-full h-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <ListingGridModal listing={listing} currentUser={currentUser} />
    </div>
  );
};

export default ListingGalleryImage;
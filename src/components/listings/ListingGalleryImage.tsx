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
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
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

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full max-w-xs ml-auto">
        {displayImages.slice(0, 4).map((image, index) => (
          <div 
            key={index} 
            className={`relative cursor-pointer overflow-hidden rounded-md ${!image ? 'bg-gray-100' : ''}`}
            onMouseEnter={() => setHoveredImageIndex(index)}
            onMouseLeave={() => setHoveredImageIndex(null)}
            onClick={() => {
              if (listing?.id && image) {
                listingGridModal.onOpen(listing.id);
              }
            }}
          >
            {image ? (
              <>
                <div className="aspect-[4/3] w-full h-full relative shadow-sm">
                  <Image
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 150px"
                    className="object-cover rounded-md transform transition-all duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 opacity-0 transition-all duration-300 hover:opacity-100" />
                </div>

                {/* Show View All overlay on the last image if there are more than 4 */}
                {index === 3 && allImages.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                    <span className="text-white font-medium text-xs">
                      +{allImages.length - 4} more
                    </span>
                  </div>
                )}

                {/* Action Buttons Container */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 translate-y-2 transition-all duration-300 hover:opacity-100 hover:translate-y-0">
                  {/* View Grid Button */}
                  <button 
                    className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 
                             hover:bg-black/60 transition-all duration-300 shadow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (listing?.id) {
                        listingGridModal.onOpen(listing.id);
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" color="#ffffff" fill="none">
                      <path d="M2 18C2 16.4596 2 15.6893 2.34673 15.1235C2.54074 14.8069 2.80693 14.5407 3.12353 14.3467C3.68934 14 4.45956 14 6 14C7.54044 14 8.31066 14 8.87647 14.3467C9.19307 14.5407 9.45926 14.8069 9.65327 15.1235C10 15.6893 10 16.4596 10 18C10 19.5404 10 20.3107 9.65327 20.8765C9.45926 21.1931 9.19307 21.4593 8.87647 21.6533C8.31066 22 7.54044 22 6 22C4.45956 22 3.68934 22 3.12353 21.6533C2.80693 21.4593 2.54074 21.1931 2.34673 20.8765C2 20.3107 2 19.5404 2 18Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 18C14 16.4596 14 15.6893 14.3467 15.1235C14.5407 14.8069 14.8069 14.5407 15.1235 14.3467C15.6893 14 16.4596 14 18 14C19.5404 14 20.3107 14 20.8765 14.3467C21.1931 14.5407 21.4593 14.8069 21.6533 15.1235C22 15.6893 22 16.4596 22 18C22 19.5404 22 20.3107 21.6533 20.8765C21.4593 21.1931 21.1931 21.4593 20.8765 21.6533C20.3107 22 19.5404 22 18 22C16.4596 22 15.6893 22 15.1235 21.6533C14.8069 21.4593 14.5407 21.1931 14.3467 20.8765C14 20.3107 14 19.5404 14 18Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2 6C2 4.45956 2 3.68934 2.34673 3.12353C2.54074 2.80693 2.80693 2.54074 3.12353 2.34673C3.68934 2 4.45956 2 6 2C7.54044 2 8.31066 2 8.87647 2.34673C9.19307 2.54074 9.45926 2.80693 9.65327 3.12353C10 3.68934 10 4.45956 10 6C10 7.54044 10 8.31066 9.65327 8.87647C9.45926 9.19307 9.19307 9.45926 8.87647 9.65327C8.31066 10 7.54044 10 6 10C4.45956 10 3.68934 10 3.12353 9.65327C2.80693 9.45926 2.54074 9.19307 2.34673 8.87647C2 8.31066 2 7.54044 2 6Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 6C14 4.45956 14 3.68934 14.3467 3.12353C14.5407 2.80693 14.8069 2.54074 15.1235 2.34673C15.6893 2 16.4596 2 18 2C19.5404 2 20.3107 2 20.8765 2.34673C21.1931 2.54074 21.4593 2.80693 21.6533 3.12353C22 3.68934 22 4.45956 22 6C22 7.54044 22 8.31066 21.6533 8.87647C21.4593 9.19307 21.1931 9.45926 20.8765 9.65327C20.3107 10 19.5404 10 18 10C16.4596 10 15.6893 10 15.1235 9.65327C14.8069 9.45926 14.5407 9.19307 14.3467 8.87647C14 8.31066 14 7.54044 14 6Z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>

                  {/* Delete Button in Edit Mode */}
                  {isEditMode && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteImage(index);
                      }}
                      className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 
                               hover:bg-black/60 transition-all duration-300 shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" color="#ffffff" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
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
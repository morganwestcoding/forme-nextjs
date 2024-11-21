// components/modals/ListingGridModal.tsx
'use client';

import { useMemo, useState } from "react";
import useListingGridModal from '@/app/hooks/useListingGridModal';
import useListingGalleryModal from '@/app/hooks/useListingGalleryModal';
import Modal from "./Modal";
import Image from 'next/image';
import { SafeListing } from "@/app/types";
import axios from 'axios';

interface ListingGridModalProps {
  listing: SafeListing | null;
  currentUser: any; // Replace 'any' with the correct type for currentUser
}

const ListingGridModal: React.FC<ListingGridModalProps> = ({ listing, currentUser }) => {
  const listingGridModal = useListingGridModal();
  const listingGalleryModal = useListingGalleryModal();
  const [images, setImages] = useState<string[]>(listing?.galleryImages || []);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
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

  const handleAddImage = () => {
    listingGalleryModal.onOpen(listing?.id || '');
    listingGridModal.onClose();
  };

  const bodyContent = useMemo(() => (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <div className="aspect-w-1 aspect-h-1 w-full">
              <Image
                src={image}
                layout="fill"
                objectFit="cover"
                alt={`Gallery image ${index + 1}`}
                className="rounded-lg"
              />
            </div>
            {isDeleteMode && (
              <button 
                onClick={() => handleDeleteImage(index)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      {currentUser?.id === listing?.userId && (
        <div className="flex justify-center mt-4 space-x-2 -mb-4">
          <button
            onClick={handleAddImage}
            className="bg-transparent text-white border border-white border-dashed p-3 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" color="#ffffff" fill="none">
    <path d="M12 4V20M20 12H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
          </button>
          <button
            onClick={toggleDeleteMode}
            className="bg-transparent text-white border border-white border-dashed p-3 rounded-full"
          >
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" color="#ffffff" fill="none">
    <path d="M20 12L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
          </button>
        </div>
      )}
    </div>
  ), [images, isDeleteMode, currentUser, listing]);

  return (
    <Modal
      isOpen={listingGridModal.isOpen}
      title="Gallery"
      onClose={listingGridModal.onClose}
      onSubmit={listingGridModal.onClose}
      actionLabel="Close"
      body={bodyContent}
    />
  );
}

export default ListingGridModal;
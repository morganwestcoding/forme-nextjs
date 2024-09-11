'use client'
import { useCallback } from "react";
import useListingGalleryModal from "@/app/hooks/useListingGalleryModal";
import { SafeListing } from "@/app/types";
import axios from 'axios';

interface AddListingImageButtonProps {
  listing: SafeListing | null;
  onImageAdded: (newImage: string) => void;
}

const AddListingImageButton: React.FC<AddListingImageButtonProps> = ({
  listing,
  onImageAdded
}) => {
  const listingGalleryModal = useListingGalleryModal();

  const onAddImage = useCallback(async (imageSrc: string) => {
    if (!listing) {
      console.error('No listing available');
      return;
    }

    try {
      const response = await axios.patch(`/api/listings/${listing.id}`, {
        action: 'addImage',
        image: imageSrc
      });
      
      if (response.data && response.data.galleryImages) {
        const newImage = response.data.galleryImages[response.data.galleryImages.length - 1];
        onImageAdded(newImage);
      }
      
      listingGalleryModal.onClose();
    } catch (error) {
      console.error('Error adding image:', error);
    }
  }, [listing, onImageAdded, listingGalleryModal]);

  return (
    <div 
      className="flex items-center justify-center bg-[#ffffff] rounded-full p-3 cursor-pointer shadow-sm border" 
      onClick={() => listing && listingGalleryModal.onOpen(listing.id)}
    >
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" color="#a2a2a2" fill="none">
    <path d="M12 4V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>
    </div>
  )
}

export default AddListingImageButton;
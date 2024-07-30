'use client';
import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import useProfileGalleryModal from '@/app/hooks/useProfileGalleryModal';
import { DropdownMenu, DropdownMenuTrigger,DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import AddImageButton from './AddGalleryImage';
import getCurrentUser from '@/app/actions/getCurrentUser';

interface PhotoGalleryProps {
  images: string[];
  onDeleteImage?: () => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images, onDeleteImage  }) => {
  const profileGalleryModal = useProfileGalleryModal();

  const handleAddImage = () => {
    profileGalleryModal.onOpen();
  };

  return (
    <div className="w-full md:w-11/12 bg-white rounded-2xl shadow-sm overflow-hidden mx-3 md:mr-16 md:ml-2 pb-16 relative">
      <div className="px-8 md:px-6 pt-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Gallery</h2>
      </div>
      <div className="px-8 md:px-6 pb-2">
      </div>
      <div className="grid grid-cols-4 gap-2 px-8 md:px-6 max-w-2xl mx-auto">
        {images.slice(0, 9).map((image, index) => (
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
      <div className="absolute bottom-1 left-6 flex space-x-2 mb-2">
        <AddImageButton />
        <div 
          className="flex items-center justify-center bg-[#ffffff] rounded-full p-3 cursor-pointer shadow-sm border"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#a2a2a2" fill="none">
            <path d="M3 12C3 11.4188 3 11.1282 3.0575 10.8897C3.21354 10.2427 3.6684 9.73726 4.25074 9.56389C4.46534 9.5 4.72689 9.5 5.25 9.5H18.75C19.2731 9.5 19.5347 9.5 19.7493 9.56389C20.3316 9.73726 20.7865 10.2427 20.9425 10.8897C21 11.1282 21 11.4188 21 12C21 12.5812 21 12.8718 20.9425 13.1103C20.7865 13.7573 20.3316 14.2627 19.7493 14.4361C19.5347 14.5 19.2731 14.5 18.75 14.5H5.25C4.72689 14.5 4.46534 14.5 4.25074 14.4361C3.6684 14.2627 3.21354 13.7573 3.0575 13.1103C3 12.8718 3 12.5812 3 12Z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;
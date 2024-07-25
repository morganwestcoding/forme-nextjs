import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface PhotoGalleryProps {
  images: string[];
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images }) => {
  const currentDate = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="w-full md:w-11/12 bg-white rounded-2xl shadow-sm overflow-hidden mx-3 md:mr-16 md:ml-2 pb-6">
      <div className="px-8 md:px-6 pt-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Gallery</h2>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#a2a2a2">
    <path d="M13.5 4.5C13.5 3.67157 12.8284 3 12 3C11.1716 3 10.5 3.67157 10.5 4.5C10.5 5.32843 11.1716 6 12 6C12.8284 6 13.5 5.32843 13.5 4.5Z" fill="currentColor" stroke="currentColor" stroke-width="1" />
    <path d="M13 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" fill="currentColor" stroke="currentColor" stroke-width="1" />
    <path d="M13.5 19.5C13.5 18.6716 12.8284 18 12 18C11.1716 18 10.5 18.6716 10.5 19.5C10.5 20.3284 11.1716 21 12 21C12.8284 21 13.5 20.3284 13.5 19.5Z" fill="currentColor" stroke="currentColor" stroke-width="1" />
</svg>
          </button>
        </div>
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
    </div>
  );
};

export default PhotoGallery;
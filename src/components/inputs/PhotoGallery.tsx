import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

interface PhotoGalleryProps {
  images: string[];
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images }) => {
  const currentDate = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="w-full md:w-11/12 bg-white rounded-2xl shadow-sm overflow-hidden mx-3 md:mr-16 md:ml-2 mb-6">
      <div className="px-8 md:px-6 pt-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Gallery</h2>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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
      <div className="px-8 md:px-6 pb-6 pt-2">
        <button className="text-blue-500 font-semibold">See all</button>
      </div>
    </div>
  );
};

export default PhotoGallery;
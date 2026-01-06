'use client';

import Image from 'next/image';
import TypeformHeading from '@/components/registration/TypeformHeading';

interface ImagesListStepProps {
  imageSrc: string;
  galleryImages: string[];
  onEditImage: (index: number) => void;
  onAddImage: () => void;
}

export default function ImagesListStep({
  imageSrc,
  galleryImages,
  onEditImage,
  onAddImage,
}: ImagesListStepProps) {
  return (
    <div>
      <TypeformHeading
        question="Add photos of your business"
        subtitle="Great photos help customers choose you"
      />

      {/* Main Image Section */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          Main Photo
          <span className="text-xs font-normal text-gray-500">(Required)</span>
        </div>

        {imageSrc ? (
          <button
            type="button"
            onClick={() => onEditImage(0)}
            className="group relative overflow-hidden rounded-xl w-full max-w-sm aspect-[4/3] cursor-pointer select-none transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 bg-white border-2 border-gray-900 hover:shadow-lg"
          >
            <Image
              src={imageSrc}
              alt="Main listing photo"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-sm font-medium">Edit main photo</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
              </svg>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onEditImage(0)}
            className="group relative overflow-hidden rounded-xl w-full max-w-sm aspect-[4/3] flex flex-col items-center justify-center gap-3 p-6 cursor-pointer select-none transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:shadow-md"
          >
            <div className="rounded-full bg-white p-3 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div className="text-center">
              <span className="block text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                Add main photo
              </span>
              <span className="block text-xs text-gray-500 mt-1">
                This will be your primary listing image
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Gallery Images Section */}
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          Gallery Images
          <span className="text-xs font-normal text-gray-500">(Optional)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {galleryImages.map((imgUrl, i) => (
            <button
              key={`gallery-${i}`}
              type="button"
              onClick={() => onEditImage(i + 1)}
              className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer select-none transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
            >
              <Image
                src={imgUrl}
                alt={`Gallery ${i + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </button>
          ))}

          {/* Add Gallery Image tile */}
          <button
            type="button"
            onClick={onAddImage}
            disabled={!imageSrc}
            className="group relative overflow-hidden rounded-xl aspect-square flex flex-col items-center justify-center gap-2 p-4 cursor-pointer select-none transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300"
            title={!imageSrc ? "Add main photo first" : "Add gallery image"}
          >
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="rounded-full bg-white p-2 shadow-sm transition-all duration-300 group-hover:shadow group-hover:scale-105 group-disabled:scale-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-500 transition-transform duration-300 ease-out group-hover:rotate-90 transform-gpu group-disabled:rotate-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>

              <span className="text-xs font-medium leading-tight text-gray-600 group-hover:text-gray-800 transform-gpu text-center">
                Add to gallery
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

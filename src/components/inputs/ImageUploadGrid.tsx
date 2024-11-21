'use client';

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useCallback, useState } from "react";

declare global {
  var cloudinary: any
}

const uploadPreset = "cs0am6m7";

interface ImageUploadGridProps {
  onChange: (value: string) => void;
  onGalleryChange: (values: string[]) => void;
  value: string;
  galleryImages: string[];
}

const ImageUploadGrid: React.FC<ImageUploadGridProps> = ({
  onChange,
  onGalleryChange,
  value,
  galleryImages
}) => {
  const [selectedBox, setSelectedBox] = useState<number | null>(null);

  const handleUpload = useCallback((result: any) => {
    if (selectedBox === null) {
      // Main image upload
      onChange(result.info.secure_url);
    } else {
      // Gallery image upload
      const newGalleryImages = [...galleryImages];
      newGalleryImages[selectedBox] = result.info.secure_url;
      onGalleryChange(newGalleryImages);
    }
    setSelectedBox(null);
  }, [onChange, onGalleryChange, selectedBox, galleryImages]);


  return (
    <div className="flex w-full gap-4 h-[220px]">
      {/* Main storefront image */}
      <div className="h-56 w-56 aspect-square">
        <CldUploadWidget 
          onUpload={handleUpload} 
          uploadPreset={uploadPreset}
          options={{ maxFiles: 1 }}
        >
          {({ open }) => (
            <div
              onClick={() => {
                setSelectedBox(null);
                open?.();
              }}
              className="
                relative
                h-full
                cursor-pointer
                hover:opacity-70
                transition
                border-dashed 
                border-2 
                border-neutral-300
                flex
                flex-col
                justify-center
                items-center
                gap-2
                text-white
                rounded-lg
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#ffffff" fill="none">
                <circle cx="7.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 21C9.37246 15.775 14.2741 8.88406 21.4975 13.5424" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <div className="font-medium text-sm">
                Storefront Profile Picture
              </div>
              {value && (
                <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden">
                  <Image
                    fill 
                    style={{ objectFit: 'cover' }} 
                    src={value} 
                    alt="Storefront" 
                  />
                </div>
              )}
            </div>
          )}
        </CldUploadWidget>
      </div>

      {/* Gallery images grid */}
      <div className="h-56 w-56 flex-1 grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <CldUploadWidget 
            key={index}
            onUpload={handleUpload} 
            uploadPreset={uploadPreset}
            options={{ maxFiles: 1 }}
          >
            {({ open }) => (
              <div
                onClick={() => {
                  setSelectedBox(index);
                  open?.();
                }}
                className="
                  relative
                  cursor-pointer
                  hover:opacity-70
                  transition
                  border-dashed 
                  border-2 
                  border-neutral-300
                  flex
                  flex-col
                  justify-center
                  items-center
                  gap-2
                  text-white
                  aspect-square
                  rounded-lg
                "
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffffff" fill="none">
                  <circle cx="7.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 21C9.37246 15.775 14.2741 8.88406 21.4975 13.5424" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <div className="font-medium text-sm">
                  Gallery {index + 1}
                </div>
                {galleryImages[index] && (
                  <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden">
                    <Image
                      fill 
                      style={{ objectFit: 'cover' }} 
                      src={galleryImages[index]} 
                      alt={`Gallery ${index + 1}`} 
                    />
                  </div>
                )}
              </div>
            )}
          </CldUploadWidget>
        ))}
      </div>
    </div>
);
}

export default ImageUploadGrid;
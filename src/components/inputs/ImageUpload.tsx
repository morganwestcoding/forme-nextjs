'use client';

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useCallback } from "react";
import { useState } from "react";

declare global {
  var cloudinary: any
}

const uploadPreset = "cs0am6m7";

interface ImageUploadProps {
  onChange: (value: string) => void;
  value: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  value,
  className
}) => {
  const [base64, setBase64] = useState(value);
  
  const handleUpload = useCallback((result: any) => {
    onChange(result.info.secure_url);
  }, [onChange]);

  return (
    <CldUploadWidget 
      onUpload={handleUpload} 
      uploadPreset={uploadPreset}
      options={{
        maxFiles: 1
      }}
    >
      {({ open }) => {
        const handleClick = () => {
          if (open) {
            open();
          }
        };
        
        return (
          <div 
            onClick={handleClick}
            className="flex justify-center items-center w-full"
          >
            <div className={`
              relative
              cursor-pointer
              hover:bg-neutral-200
             bg-slate-100
              shadow-md
              p-6
              rounded-lg
              flex
              flex-col
              justify-center
              items-center
              transition
              ${className || 'p-20'}
            `}>
              {!value && (
                <>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    width="28" 
                    height="28" 
                    color="#71717A" 
                    fill="none"
                    className="mb-4"
                  >
                    <path d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M15.5 17L14 15.5M21 16L18.5303 13.5303C18.1908 13.1908 17.7302 13 17.25 13C16.7698 13 16.3092 13.1908 15.9697 13.5303L14 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M15.5 8C15.7761 8 16 7.77614 16 7.5C16 7.22386 15.7761 7 15.5 7M15.5 8C15.2239 8 15 7.77614 15 7.5C15 7.22386 15.2239 7 15.5 7M15.5 8V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M3.69797 19.7472C2.5 18.3446 2.5 16.2297 2.5 12C2.5 7.77027 2.5 5.6554 3.69797 4.25276C3.86808 4.05358 4.05358 3.86808 4.25276 3.69797C5.6554 2.5 7.77027 2.5 12 2.5C16.2297 2.5 18.3446 2.5 19.7472 3.69797C19.9464 3.86808 20.1319 4.05358 20.302 4.25276C21.5 5.6554 21.5 7.77027 21.5 12C21.5 16.2297 21.5 18.3446 20.302 19.7472C20.1319 19.9464 19.9464 20.1319 19.7472 20.302C18.3446 21.5 16.2297 21.5 12 21.5C7.77027 21.5 5.6554 21.5 4.25276 20.302C4.05358 20.1319 3.86808 19.9464 3.69797 19.7472Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <div className="mb-2 text-xs font-medium text-neutral-700">Drag and drop<br/>or click to upload</div>
                  <div className="text-xs text-neutral-500">PNG, JPG, or SVG (max 5MB)</div>
                </>
              )}
              
              {value && (
                <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden">
                  <Image
                    fill 
                    style={{ objectFit: 'contain' }} 
                    src={value} 
                    alt="Uploaded image" 
                  />
                </div>
              )}
            </div>
          </div>
        ) 
    }}
    </CldUploadWidget>
  );
}

export default ImageUpload;
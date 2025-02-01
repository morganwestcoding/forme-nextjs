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
        return (
          <div 
            onClick={() => open?.()}
            className="flex justify-center items-center w-full"
          >
            <div className={`
              relative
              cursor-pointer
              hover:opacity-70
              border-dashed 
              border-2
              border-neutral-500
              flex
              justify-center
              items-center
              transition
              ${className || 'p-20'}
            `}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="32" 
                height="32" 
                color="#71717A" 
                fill="none"
              >
                <circle 
                  cx="7.5" 
                  cy="7.5" 
                  r="1.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="#ffffff" 
                />
                <path 
                  d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                />
                <path 
                  d="M5 21C9.37246 15.775 14.2741 8.88406 21.4975 13.5424" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  fill="#ffffff"
                />
              </svg>
              {value && (
                <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden">
                  <Image
                    fill 
                    style={{ objectFit: 'cover' }} 
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
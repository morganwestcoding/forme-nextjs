'use client';

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useCallback } from "react";
import { TbPhotoPlus } from 'react-icons/tb'

declare global {
  var cloudinary: any
}

const uploadPreset = "cs0am6m7";

interface ProfilePicUploadProps {
  onChange: (value: string) => void;
  value: string;
}

const ProfilePicUpload: React.FC<ProfilePicUploadProps> = ({
  onChange,
  value
}) => {
  const handleUpload = useCallback((result: any) => {
    onChange(result.info.secure_url);
  }, [onChange]);

  return (
    <CldUploadWidget 
      onUpload={handleUpload} 
      uploadPreset={uploadPreset}
      options={{
        maxFiles: 1,
        cropping: true, // Enable the cropping option
        croppingAspectRatio: 1, // Set aspect ratio to 1 for square images
        croppingShowBackButton: true,

      }}
    >
      {({ open }) => {
        return (
          <div
            onClick={() => open?.()}
            className="
            relative
            cursor-pointer
            hover:opacity-75
            transition
            border-dashed 
            border-2 
            p-4
            w-24 h-24
            border-neutral-300
            flex
            flex-col
            justify-center
            items-center
            text-neutral-600
            rounded-lg
            "
          >
            <TbPhotoPlus
              size={24}
            />
            {value && (
              <div className="
              absolute inset-0 w-full h-full">
                <Image
                  fill 
                  style={{ objectFit: 'cover' }} 
                  src={value} 
                  alt="Upload image" 
                />
              </div>
            )}
          </div>
        ) 
    }}
    </CldUploadWidget>
  );
}

export default ProfilePicUpload;

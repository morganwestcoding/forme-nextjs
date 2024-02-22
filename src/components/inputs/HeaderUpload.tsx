// HeaderUpload.tsx
import React, { useCallback } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { TbPhotoPlus } from 'react-icons/tb';
import axios from 'axios';

interface HeaderUploadProps {
    uploadType: 'image' | 'imageSrc';
    onUpdate: (imageUrl: string) => void; 
}

const HeaderUpload: React.FC<HeaderUploadProps> = ({ uploadType, onUpdate }) => {
  const uploadHandler = useCallback(async (result: any) => {
    if (result.info && result.info.secure_url) {
      const imageUrl = result.info.secure_url;
      
      try {
        await axios.post('/api/profile', {
          [uploadType]: imageUrl,
        });
        
        console.log(`${uploadType} updated successfully`);
        onUpdate(imageUrl);
      } catch (error) {
        console.error(`Error updating ${uploadType}:`, error);
      }
    }
  }, [uploadType,onUpdate]);

  return (
    <CldUploadWidget 
    uploadPreset="cs0am6m7" 
    onUpload={uploadHandler}
    options={{
        cropping: true, // Enable the built-in cropper
        croppingAspectRatio: 1, // Set crop aspect ratio to 1 for square images
        croppingShowDimensions: true, // Show dimensions while cropping
      }}>
      {({ open }) => (
        <div className="absolute bottom-0 right-0 p-2 cursor-pointer" onClick={() => open()}>
          <TbPhotoPlus size={24} className="text-white bg-gray-700 rounded-full" />
        </div>
      )}
    </CldUploadWidget>
  );
};

export default HeaderUpload;

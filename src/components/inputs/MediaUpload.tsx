import React, { useState, useCallback } from 'react';
import { CldUploadWidget } from "next-cloudinary";
import Image from 'next/image';
import { TbPhotoPlus } from 'react-icons/tb';
import { MediaData, MediaType } from '@/app/types';

const uploadPreset = "cs0am6m7";

interface MediaUploadProps {
  onMediaUpload: (data: MediaData) => void;
  currentMedia?: MediaData | null;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onMediaUpload, currentMedia }) => {
  const [mediaPreview, setMediaPreview] = useState<MediaData | null>(currentMedia || null);

  const handleUpload = useCallback((result: any) => {
    let url = result.info.secure_url;
    const resourceType = result.info.resource_type;
    const format = result.info.format;
    
    // For images, modify the URL to include crop parameters
    if (resourceType === 'image') {
      const transformationString = '/c_crop,g_center,h_800,w_800';
      url = url.replace('/upload/', `/upload${transformationString}/`);
    }
    
    // Properly type the mediaType based on your MediaType type
    let type: MediaType;
    if (resourceType === 'video') {
      type = 'video';
    } else if (format === 'gif') {
      type = 'gif';
    } else {
      type = 'image';
    }
  
    const mediaData: MediaData = { url, type };
    setMediaPreview(mediaData);
    onMediaUpload(mediaData);
  }, [onMediaUpload]);

  const renderPreview = () => {
    if (!mediaPreview) return null;

    switch (mediaPreview.type) {
      case 'video':
        return (
          <video 
            src={mediaPreview.url}
            className="w-full h-full object-cover"
            controls
          />
        );
      case 'gif':
      case 'image':
        return (
          <Image
            src={mediaPreview.url}
            alt="Upload"
            fill
            className="object-cover"
          />
        );
      default:
        return null;
    }
  };

  return (
    <CldUploadWidget 
    onUpload={handleUpload} 
    uploadPreset={uploadPreset}
    options={{
      maxFiles: 1,
      sources: ['local', 'url', 'camera'],
      resourceType: 'auto',
      clientAllowedFormats: ['image', 'video', 'gif'],
      maxImageFileSize: 10000000,
      maxVideoFileSize: 50000000,
      cropping: true,
      croppingAspectRatio: 1,
      croppingValidateDimensions: true,
      croppingShowDimensions: true,
    }}
    >
      {({ open }) => (
        <div 
          className="relative cursor-pointer hover:opacity-70 transition border-2 border-dashed 
                     border-neutral-300 flex flex-col justify-center items-center rounded-lg overflow-hidden"
          onClick={() => open?.()}
          style={{ aspectRatio: '1/1' }}
        >
          {!mediaPreview ? (
            <div className="flex flex-col items-center justify-center">
              <TbPhotoPlus size={25} />
              <div className="font-semibold text-lg mt-4">
                Upload media
              </div>
            </div>
          ) : (
            <div className="h-full w-full relative">
              {renderPreview()}
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};

export default MediaUpload;
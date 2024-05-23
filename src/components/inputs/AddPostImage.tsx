import React, { useState, useCallback } from 'react';
import { CldUploadWidget } from "next-cloudinary";
import Image from 'next/image'; 
import { TbPhotoPlus } from 'react-icons/tb';

const uploadPreset = "cs0am6m7";

interface AddPostImageProps {
    
    onImageUpload: (imageUrl: string) => void;
}

const AddPostImage: React.FC<AddPostImageProps> = ({  onImageUpload }) => {
    const [imageSrc, setImageSrc] = useState('');

    const handleUpload = useCallback((result: any) => {
        const url = result.info.secure_url;
        setImageSrc(url);
        onImageUpload(url);
    }, [onImageUpload]);

    return (
        
        <CldUploadWidget 
            onUpload={handleUpload} 
            uploadPreset={uploadPreset}
            options={{
                maxFiles: 1,
                cropping: true, // Enable cropping
                croppingAspectRatio: 1, // Square crop
                croppingShowBackButton: true,
            }}
        >
            {({ open }) => (
                 <div
                 className="relative cursor-pointer hover:opacity-75 transition border-dashed border-2 p-4 w-full h-full border-neutral-300 flex flex-col justify-center items-center text-neutral-600 rounded-lg"
                 onClick={() => open?.()}
             >
                   <TbPhotoPlus size={24} className="text-neutral-600" />
                    {imageSrc && (
                        <div className="absolute w-full h-full rounded-lg overflow-hidden">
                            <Image
                                src={imageSrc}
                                alt="Uploaded Image"
                                layout="fill"
                                objectFit="cover"
                                className='w-full'
                            />
                        </div>
                    )}
                   
                </div>
            )}
        </CldUploadWidget>
    );
};

export default AddPostImage;

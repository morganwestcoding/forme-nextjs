import React, { useState, useCallback } from 'react';
import { CldUploadWidget } from "next-cloudinary";
import Image from 'next/image'; 
import { TbPhotoPlus } from 'react-icons/tb';

const uploadPreset = "cs0am6m7";

interface AddPostImageProps {
    onImageUpload: (imageUrl: string) => void;
}

const AddPostImage: React.FC<AddPostImageProps> = ({ onImageUpload }) => {
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
                sources: ['local', 'url', 'camera'],
                cropping: true,
                croppingAspectRatio: 1,
                croppingDefaultSelectionRatio: 1,
                showSkipCropButton: false,
                croppingValidateDimensions: true,
                croppingShowDimensions: true,
                croppingCoordinatesMode: 'custom',
                folder: 'forme_posts',
                clientAllowedFormats: ['image'],
                maxImageFileSize: 10000000, // 10MB
                styles: {
                    palette: {
                        window: "#FFFFFF",
                        sourceBg: "#F4F5F5",
                        windowBorder: "#90A0B3",
                        tabIcon: "#000000",
                        inactiveTabIcon: "#555a5f",
                        menuIcons: "#555a5f",
                        link: "#000000",
                        action: "#339933",
                        inProgress: "#0433ff",
                        complete: "#339933",
                        error: "#cc0000",
                        textDark: "#000000",
                        textLight: "#fcfffd"
                    }
                }
            }}
        >
            {({ open }) => (
                <div 
                    className="relative cursor-pointer hover:opacity-70 transition border-2 border-dashed border-neutral-300 
                             flex flex-col justify-center items-center rounded-lg overflow-hidden"
                    onClick={() => open?.()}
                    style={{ aspectRatio: '1/1' }}
                >
                    {!imageSrc ? (
                        <div className="flex flex-col items-center justify-center">
                            <TbPhotoPlus size={50} />
                            <div className="font-semibold text-lg mt-4">
                                Upload an image
                            </div>
                        </div>
                    ) : (
                        <div className="h-full w-full relative">
                            <Image
                                src={imageSrc}
                                alt="Upload"
                                width={500}
                                height={500}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>
            )}
        </CldUploadWidget>
    );
};

export default AddPostImage;
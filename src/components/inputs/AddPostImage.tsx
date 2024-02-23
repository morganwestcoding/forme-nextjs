import React, { useState, useCallback } from 'react';
import { CldUploadWidget } from "next-cloudinary";
import { Image } from 'lucide-react';
import { TbPhotoPlus } from 'react-icons/tb';
import { SafeUser } from '@/app/types';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';


const uploadPreset = "cs0am6m7";

interface AddPostImageProps {
    currentUser: SafeUser | null;
    onImageUpload: (imageUrl: string) => void;
}

const AddPostImage: React.FC<AddPostImageProps> = ({ currentUser, onImageUpload }) => {
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
                maxFiles: 1
            }}
        >
            {({ open }) => (
                <div className="relative inline-block" onClick={() => open?.()}>
                    <ImageOutlinedIcon  width={24} height={24} className='mr-2'/>
                    
                    {/*{imageSrc && (
                        <div className="absolute inset-0 w-full h-full">
                            <Image fill style={{ objectFit: 'cover' }} src={imageSrc} alt="Uploaded Image" />
                        </div>
                    )}*/}
                </div>
            )}
        </CldUploadWidget>
    );
};

export default AddPostImage;

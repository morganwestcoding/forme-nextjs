import React, { useState } from 'react';
import { SafeUser } from '@/app/types';
import Image from 'next/image';

interface ContentInputProps {
    currentUser: SafeUser | null;
    imageSrc?: string;
    location?: { label: string; value: number } | null; 
    content: string;
    setContent: (content: string) => void;
    setImageSrc: (imageSrc: string) => void; 
    setLocation: (location: string | null) => void; 
}

const ContentInput: React.FC<ContentInputProps> = ({ currentUser, imageSrc, location, content, setContent, setLocation  }) => {

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    };

    return (
        <>
        <textarea
            className="ml-3 text-sm py-2 px-3 rounded-lg flex-1 min-h-[50px] drop-shadow-sm"
            placeholder={`${currentUser ? currentUser.name : 'User'}, what's on your mind?`}
            value={content}
            onChange={handleInputChange}
        />
        {imageSrc && (
    <div style={{ paddingTop: '5px' }}>
        <Image 
            src={imageSrc} 
            alt="Uploaded" 
            width={50} 
            height={50} 
        />
    </div>
)}
{location && (
                <div>
                    Location: {location.label}
                </div>
            )}
        </>
    );
};

export default ContentInput;

import React, { useState } from 'react';
import { SafeUser } from '@/app/types';
import Image from 'next/image';

interface ContentInputProps {
    currentUser: SafeUser | null;
    imageSrc?: string;
    content: string;
    setContent: (content: string) => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ currentUser, imageSrc, content, setContent }) => {

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
        </>
    );
};

export default ContentInput;

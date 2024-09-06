import React from 'react';
import { SafeUser } from '@/app/types';
import Image from 'next/image';

interface ContentInputProps {
    currentUser: SafeUser | null;
    imageSrc?: string;
    location?: { label: string; value: string } | null;
    content: string;
    setContent: (content: string) => void;
    setImageSrc: (imageSrc: string) => void;
    setLocation: (location: { label: string; value: string } | null) => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ 
    currentUser, 
    imageSrc, 
    location, 
    content, 
    setContent 
}) => {
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    };

    return (
        <div className="flex flex-col w-full">
            <textarea
                className="ml-3 text-sm py-2 px-3 rounded-lg flex-1 min-h-[50px] drop-shadow-sm mb-2"
                placeholder={`${currentUser ? currentUser.name : 'User'}, what's on your mind?`}
                value={content}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default ContentInput;
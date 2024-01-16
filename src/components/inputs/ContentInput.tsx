import React, { useState } from 'react';
import { SafeUser } from '@/app/types';

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
            className="ml-4 text-sm py-2 px-3 border rounded-lg flex-1 min-h-[50px]"
            placeholder={`${currentUser ? currentUser.name : 'User'}, what's on your mind?`}
            value={content}
            onChange={handleInputChange}
        />
        {imageSrc && (
            <div style={{ paddingTop: '5px' }}>
                <img src={imageSrc} alt="Uploaded" style={{ width: '50px', height: '50px', borderRadius: '0.25rem' }} />
            </div>
        )}
        </>
    );
};

export default ContentInput;

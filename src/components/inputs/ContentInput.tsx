import React from 'react';
import { SafeUser, MediaData } from '@/app/types';

interface ContentInputProps {
    currentUser: SafeUser | null;
    content: string;
    setContent: (content: string) => void;
    location?: { label: string; value: string } | null;
    setLocation: (location: { label: string; value: string } | null) => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ 
    currentUser, 
    content, 
    setContent,
    location,
    setLocation 
}) => {
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    };

    return (
        <div className="flex flex-col w-full">
            <textarea
                className="ml-3  placeholder:text-[#6B7280] text-sm py-2 px-3 rounded-md flex-1 min-h-[50px] shadow-sm mb-2"
                placeholder={`${currentUser ? currentUser.name : 'User'}, what's on your mind?`}
                value={content}
                onChange={handleInputChange}
            />
        </div>
    );
};

export default ContentInput;
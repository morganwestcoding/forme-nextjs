import React, { useState } from 'react';
import { SafeUser } from '@/app/types';

interface ContentInputProps {
    currentUser: SafeUser | null;
}

const ContentInput: React.FC<ContentInputProps> = ({ currentUser }) => {
    const [content, setContent] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value);
    };

    return (
        <textarea
            className="ml-4 text-sm py-2 px-3 border rounded-lg flex-1 min-h-[50px]"
            placeholder={`${currentUser ? currentUser.name : 'User'}, what's on your mind?`}
            value={content}
            onChange={handleInputChange}
        />
    );
};

export default ContentInput;

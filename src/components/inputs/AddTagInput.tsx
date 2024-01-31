import React, { useState } from 'react';
import { SafeUser } from '@/app/types';
import { MdCheckCircle } from 'react-icons/md'; // Check mark icon
import Image from 'next/image';

interface AddTagInputProps {
    currentUser: SafeUser | null;
    onTagSubmit: (tag: string) => void;
}

const AddTagInput: React.FC<AddTagInputProps> = ({ currentUser, onTagSubmit }) => {
    const [showInput, setShowInput] = useState(false);
    const [tag, setTag] = useState('');

    const handleSubmit = () => {
        onTagSubmit(tag);
        setTag(''); // Clear the field after submitting
        setShowInput(false); // Hide the input field again
    };

    return (
        <>
            <button onClick={() => setShowInput(true)} className="tag-icon-style">
            <Image src="/icons/tag.svg" alt="tag" width={26} height={26} className='cursor-pointer drop-shadow-sm ml-2'/>
            </button>

            {showInput && (
                <div className="absolute -mt-2 left-full top-0 ml-2 bg-white bg-opacity-85 rounded-lg shadow-lg z-[1000]"> {/* Adjusted for right side */}
                    <div className="flex items-center p-2">
                        <input
                            type="text"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            className="text-sm py-2 px-3 border rounded-lg flex-1"
                            placeholder="Enter tag"
                        />
                        <MdCheckCircle
                            size={24}
                            className={`cursor-pointer ml-2 ${tag ? 'text-green-500' : 'text-gray-500'}`}
                            onClick={handleSubmit}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default AddTagInput;

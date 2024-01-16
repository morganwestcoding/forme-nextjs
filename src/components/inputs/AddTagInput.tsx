import React, { useState } from 'react';
import { SafeUser } from '@/app/types';
import { MdCheckCircle } from 'react-icons/md'; // Check mark icon

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
            <img src="/icons/tag.svg" className='h-6.5 w-6.5 cursor-pointer drop-shadow ml-2'/>
            </button>

            {showInput && (
                <div className="absolute z-10 mt-28 bg-white bg-opacity-85 rounded-lg shadow-lg">
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

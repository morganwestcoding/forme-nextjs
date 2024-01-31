import React, { useState } from 'react';
import Image from 'next/image';
import { SafeUser } from '@/app/types';
import { MdCheckCircle } from 'react-icons/md'; // This is for the check mark icon, ensure you have react-icons installed

interface AddPostLocationProps {
    currentUser: SafeUser | null;
    onLocationSubmit: (location: string) => void;
}

const AddPostLocation: React.FC<AddPostLocationProps> = ({ currentUser, onLocationSubmit }) => {
    const [showInput, setShowInput] = useState(false);
    const [location, setLocation] = useState('');

    const handleSubmit = () => {
        onLocationSubmit(location);
        setLocation(''); // Clear the field after submitting
        setShowInput(false); // Hide the input field again
    };

    return (
        <>
            <button onClick={() => setShowInput(true)}>
            <Image src="/icons/location-add.svg" alt="location" width={24} height={24} className='cursor-pointer drop-shadow-sm'/>
            </button>

            {showInput && (
                <div className="absolute -mt-2 left-full top-0 ml-2 bg-white bg-opacity-85 rounded-lg shadow-lg z-[1000]"> {/* Adjusted for right side */}
                    <div className="flex items-center p-2">
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="text-sm py-2 px-3 border rounded-lg flex-1"
                        placeholder="Enter location"
                    />
                    <MdCheckCircle
                        size={24}
                        className={`cursor-pointer ml-2 ${location ? 'text-green-500' : 'text-gray-500'}`}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
            )}
        </>
    );
};

export default AddPostLocation;

import React, { useState } from 'react';
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
            <img src="/icons/location-add.svg" className='h-6 w-6 cursor-pointer drop-shadow'/>
            </button>

            {showInput && (
                <div className="absolute z-10 mt-28 bg-white bg-opacity-85 rounded-lg shadow-lg">
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

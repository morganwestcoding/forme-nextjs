import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { SafeUser } from '@/app/types';
import { MdCheckCircle } from 'react-icons/md'; // This is for the check mark icon, ensure you have react-icons installed
import AddLocationOutlinedIcon from '@mui/icons-material/AddLocationOutlined';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';

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
        <div className="relative inline-block">
            <button onClick={() => setShowInput(true)}>
            <FmdGoodOutlinedIcon className='h-5 w-5 text-white cursor-pointer'/>
            </button>

            {showInput && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-lg shadow z-[100] w-60"> {/* Adjusted for direct below */}
                    <div className="flex items-center p-2">
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="text-sm py-2 px-3 border w-32 rounded-lg flex-1"
                        placeholder="location"
                    />
                    <MdCheckCircle
                        size={24}
                        className={`cursor-pointer ml-2 ${location ? 'text-green-500' : 'text-gray-500'}`}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
            )}
        </div>
    );
};

export default AddPostLocation;

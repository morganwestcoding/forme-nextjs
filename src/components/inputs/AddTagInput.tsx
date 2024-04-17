import React, { useState } from 'react';
import { SafeUser } from '@/app/types';
import { MdCheckCircle } from 'react-icons/md'; // Check mark icon
import { Tag } from 'lucide-react';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';


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
        <div className="relative inline-block ">
            <button onClick={() => setShowInput(true)} className="tag-icon-style">
            <LocalOfferOutlinedIcon className='h-5 w-5 cursor-pointer ml-2 text-white mr-2'/>
            </button>

            {showInput && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 rounded-lg shadow-lg z-[100] w-60"> {/* Adjusted for direct below */}
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
        </div>
    );
};

export default AddTagInput;

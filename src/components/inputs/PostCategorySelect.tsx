import React, { useState } from 'react';
import { categories } from '../Categories'; // Assuming this is the correct import path
import { Button } from '../ui/button'; // Adjust the path as necessary

interface PostCategorySelectProps {
    onCategorySelected: (category: string) => void; // Callback when a category is selected
}

const PostCategorySelect: React.FC<PostCategorySelectProps> = ({
    onCategorySelected,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleCategorySelect = (category: string) => {
        onCategorySelected(category); // Notify parent component of the selection
        setShowDropdown(false); // Close the dropdown
    };

    return (
        <div className="relative inline-block">
            <Button className='rounded-xl bg-[#000000] p-5 py-2' onClick={() => setShowDropdown(!showDropdown)}>
                Genre
            </Button>
            {showDropdown && (
                <div className="absolute left-1/2 transform -translate-x-1/2 text-xs bg-opacity-80 bg-black p-2 rounded-lg mt-1">
                    {categories.map((category) => (
                        <div 
                            key={category.label} 
                            className={`flex items-center justify-center p-2 font-medium bg-opacity-95 hover:bg-gray-100 my-2 hover:text-black text-white gap-4 cursor-pointer rounded-lg ${category.color}`}
                            onClick={() => handleCategorySelect(category.label)}
                        > 
                            {category.label}
                        </div>
                    ))}
                </div>
            )}  
        </div>
    );
};

export default PostCategorySelect;

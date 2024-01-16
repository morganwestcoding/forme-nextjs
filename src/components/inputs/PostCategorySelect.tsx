import React, { useState } from 'react';
import { categories } from '../Categories'; // Assuming this is the correct import path
import { SafeUser } from '@/app/types';

import { Button } from '../ui/button'; // Adjust the path as necessary

interface PostCategorySelectProps {
    currentUser: SafeUser | null;
    onPostSubmit: (postData: any) => void;
    imageSrc?: string;
    location?: string;
    tag?: string;
    content: string; // Assuming this is a required prop from the parent component
}

const PostCategorySelect: React.FC<PostCategorySelectProps> = ({
    
    onPostSubmit,
    imageSrc,
    location,
    tag,
    content,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleSubmit = () => {
        console.log("Content:", content);
        console.log("Category:", selectedCategory
        );
        // Validation: Check if content and category are provided
        if (!content || !selectedCategory) {
            alert("Please fill in all required fields.");
            return;
        }

        const postData = {
            
            imageSrc,
            location,
            tag,
            content,
            category: selectedCategory
        };


        // Call the onPostSubmit prop with postData
        onPostSubmit(postData);

        // Close the dropdown
        setShowDropdown(false);
    };

        // Call Axios to submit the data
   

    return (
        <div className="relative inline-block">
            <Button className='rounded-xl bg-[#000000]' onClick={() => setShowDropdown(!showDropdown)}>
                Share
            </Button>
            {showDropdown && (
                <div className="absolute left-1/2 transform -translate-x-1/2 text-xs bg-opacity-80 bg-black p-2 rounded-lg mt-1">
                    {categories.map((category) => (
                        <div 
                            key={category.label} 
                            className={`flex items-center justify-center p-2 font-medium bg-opacity-95 hover:bg-gray-100 my-2 hover:text-black text-white gap-4 cursor-pointer rounded-lg ${category.color}`}
                            onClick={() => {
                                setSelectedCategory(category.label);
                                handleSubmit();
                            }}
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

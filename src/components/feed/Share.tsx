import React, { useRef, useState } from 'react';
import Avatar from '../ui/avatar';
import { Button } from '../ui/button';
import { SafeUser } from '@/app/types';
import { MdAddPhotoAlternate, MdAddLocationAlt } from "react-icons/md";
import axios from 'axios';
import { categories } from '../Categories';


const Share = ({ currentUser }) => {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const fileInputRef = useRef(null);
  const [showLocationInput, setShowLocationInput] = useState(false);  // Create a ref for the file input

  const toggleLocationInput = () => {
    setShowLocationInput(!showLocationInput); // Toggle the visibility
  };

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Check if current is not null
    }
  };

  const handleImageUpload = (event) => {
    // Logic for handling image upload
    const file = event.target.files[0];
    // Process the file as needed
  };

  const handleSubmit = async () => {
    if (!content || !selectedCategory) {
      alert('Content and category are required');
      return;
    }

    try {
      const response = await axios.post('/api/post', {
        userId: currentUser?.id,
        content,
        location,
        photo: imageSrc,
        categoryId: selectedCategory,
      });
      console.log('Post created:', response.data);
      // Reset form fields after successful submission
      setContent('');
      setLocation('');
      setImageSrc('');
      setSelectedCategory('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className='w-full h-auto rounded-lg shadow-md bg-[#ffffff] bg-opacity-80 p-4'>
      <div className="flex items-center">
        <Button variant="outline" size="icon">
          <Avatar src={currentUser?.image} />
        </Button>
        <input 
          type="text" 
          placeholder="What's on your mind?" 
          className="ml-4 text-sm py-2 px-3 border rounded-lg flex-1"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <MdAddPhotoAlternate 
            size={30} 
            className='cursor-pointer text-[#7d8085]' 
            onClick={handleIconClick} />
          <input 
            type="file" 
            className="hidden" // Hide the input
            ref={fileInputRef} // Attach the ref to the input
            onChange={handleImageUpload}
           
          />
          <MdAddLocationAlt 
          size={30} 
          className='cursor-pointer text-[#7d8085]' 
          onClick={toggleLocationInput} 
        />
        {showLocationInput && (
          <input 
            type="text" 
            placeholder="Add a location"
            className="ml-2 text-sm py-1 px-2 border rounded-lg"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        )}
          
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.label} value={category.label} style={{ color: category.color }}>
              {category.label}
            </option>
          ))}
        </select>
        <Button className='rounded-xl bg-[#3d3f42]' onClick={handleSubmit}>Share</Button>
      </div>
    </div>
  );
};

export default Share;

import React, { useRef, useState, useEffect } from 'react';
import Avatar from '../ui/avatar';
import { Button } from '../ui/button';
import axios from 'axios';
import { categories } from '../Categories';
import { SafeUser } from '@/app/types';
import { toast } from 'react-hot-toast';


interface ShareProps {
    currentUser?: SafeUser | null;
  }
  
  const Share: React.FC<ShareProps> = ({ currentUser }) => {
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [imageSrc, setImageSrc] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [locationSubmitted, setLocationSubmitted] = useState(false);
  
    const toggleLocationInput = () => setShowLocationInput(!showLocationInput);
    const [showLocationInput, setShowLocationInput] = useState(false);
  
    const handleIconClick = () => fileInputRef.current?.click();
  
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(file);
      }
    };
  
    const handleLocationSubmit = () => {
      if (location.trim() === '') {
        toast.error('Please enter a valid location');
        return;
      }
      setLocationSubmitted(true);
      setShowLocationInput(false);
    };
  
    const handleSubmit = async (category: string) => {
        setSelectedCategory(category);
        if (!currentUser) {
            toast.error('Please sign in to share a post');
            return;
        }
  
      if (!content || !category) {
        toast.error('Content and category are required');
        return;
      }
  
      try {
        await axios.post('/api/post', {
          userId: currentUser.id,
          content,
          location,
          photo: imageSrc,
          categoryId: category,
        });
        toast.success('Post created successfully!');
        setContent('');
        setLocation('');
        setImageSrc('');
        setSelectedCategory('');
      } catch (error) {
        console.error('Error creating post:', error);
        toast.error('Error creating post');
      }
    };

  return (
    <div className='w-full h-auto rounded-lg shadow-md bg-[#ffffff] bg-opacity-90 p-6 '>
      <div className="flex items-center">
        <Button variant="outline" size="icon">
        <Avatar src={currentUser?.image} />
        </Button>
        
        <div className="ml-4 text-sm py-2 px-3 border rounded-lg flex-1 min-h-[50px]" 
     contentEditable 
     onInput={(e) => setContent(e.currentTarget.textContent || '')} 
     onBlur={() => setContent(content)}  // Update content on blur
     suppressContentEditableWarning={true}> 
  {imageSrc && (
    <div style={{ paddingTop: '5px' }}>
      <img src={imageSrc} alt="Uploaded" style={{ width: '50px', height: '50px', borderRadius: '0.25rem' }} />
    </div>
  )}
</div>
      </div>
      
      <div className="mt-4 flex items-center justify-between bg">
        
        <div className="flex items-center bg-white p-2 rounded-lg drop-shadow-sm">
        <img src="/icons/image.svg" 
            className={`cursor-pointer text-[#48AEFB] mr-2 drop-shadow h-7 w-7 p-0.5 ${imageSrc ? 'border-2 border-green-500 rounded-lg' : ''}`}
            onClick={handleIconClick}/>
          <input 
            type="file" 
            className="hidden" // Hide the input
            ref={fileInputRef} // Attach the ref to the input
            onChange={handleImageUpload}
           
          />
        
        
        <div className="relative inline-flex items-center">

         <img src="/icons/location-add.svg"
          
          className={`h-7 w-7 cursor-pointer text-[#48AEFB] p-0.5 drop-shadow ${locationSubmitted ? 'border-2 border-green-500 rounded-lg' : ''}`}

          onClick={toggleLocationInput}
        />
        {showLocationInput && (
            <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 z-50 bg-black p-4 rounded-lg shadow-lg">
              <input 
                type="text" 
                placeholder="Add a location"
                className="text-sm py-1 px-4 border rounded-lg w-32"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button 
                onClick={handleLocationSubmit}
                className="mt-2 bg-white bg-opacity-55  hover:bg-blue-700 text-white font-bold py-1 px-1 text-sm rounded w-full">
                submit
              </button>
            </div>
          )}
        </div>

        <img src="/icons/tag.svg" alt="Home" className="h-7 w-7 ml-2 p-0.5 text-[#7d8085] cursor-pointer"/>
        
        </div>
       
        <div className="relative inline-block">
        <Button className='rounded-xl bg-[#000000]' onClick={() => setShowDropdown(!showDropdown)}>
            Share
          </Button>
          {showDropdown && (
            <div className=" absolute left-1/2 transform -translate-x-1/2 text-xs bg-opacity-80 bg-black p-2 rounded-lg mt-1">
                
              {categories.map((category) => (
                <div 
                  key={category.label} 
                  className={` flex items-center justify-center p-2 font-medium bg-opacity-95 hover:bg-gray-100 my-2 hover:text-black text-white gap-4 cursor-pointer rounded-lg ${category.color}`}
                  onClick={handleSubmit}
                >
                  {category.label}
                </div>
              ))}
              </div>
          )}  
          </div>
      </div>
    </div>
  );
};

export default Share;

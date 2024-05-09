// Avatar.tsx
import React from 'react';
import Image from 'next/image';
import useUserStore from '../../app/hooks/userStore'; // Adjust the import path as necessary

const Avatar: React.FC<{ src?: string }> = ({ src }) => {
  const defaultImage = "/people/rooster.jpg"; // Default image path

  // Use the provided `src` or fall back to the default image
  const imageSrc = src || defaultImage;


  return (
    <div className="relative w-11 h-11 rounded-full overflow-hidden">
      <Image
      layout="fill" // This will take the full area of the container
      objectFit="cover" 
        alt="Avatar"
        src={imageSrc}
        
        className='object-cover rounded-full'// Change to 'fill' to allow the image to fill the area
         // Ensure the image covers the area without distortion // This might be redundant due to the overflow-hidden on the container, but it's kept for consistency
      />
      </div>
    
  );
}

export default Avatar;

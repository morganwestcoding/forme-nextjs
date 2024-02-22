// Avatar.tsx
import React from 'react';
import Image from 'next/image';
import useUserStore from '../../app/hooks/userStore'; // Adjust the import path as necessary

const Avatar: React.FC<{ src?: string }> = ({ src }) => {
  const userImage = useUserStore((state) => state.user?.image) || src || "/people/rooster.jpg";

  return (
      <Image
        height={45} 
        width={45} 
        alt="Avatar"
        src={userImage}
        className='rounded-full'// Change to 'fill' to allow the image to fill the area
         // Ensure the image covers the area without distortion // This might be redundant due to the overflow-hidden on the container, but it's kept for consistency
      />
    
  );
}

export default Avatar;
